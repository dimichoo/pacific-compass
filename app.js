
(function(){
"use strict";

/* ---------- data (partner-country customs statistics, USD bn) ---------- */
/* 2025: full-year, real except India and Korea (reconstructed, see methodology).
   2026: annualized estimate = 2025 full year × (partial-2026 / same-partial-2025 growth rate).
   Partial periods actually observed: CN Jan–Aug (+28.4%), IN H1 (+15.89%), VN Jan–May (+6.6%),
   JP H1 (+15%), KR — no confirmed aggregate, conservative +5% assumed (see methodology). */
var PORTS = {
  vladivostok: {lat:43.10, lon:131.87},
  khabarovsk:  {lat:48.48, lon:135.08}
};
var portKey = "vladivostok";
try { var sp = localStorage.getItem("pc-port"); if (sp && PORTS[sp]) portKey = sp; } catch(e) {}
var HOME = PORTS[portKey];
var YEARS = [2021,2022,2023,2024,2025,2026];
var C = [
  {id:"cn", lat:39.90, lon:116.40, trade:[146.9,190.3,240.1,244.8,228.1,293],approx:[0,0,0,0,0,1], sanc:1, pay:1,   log:1,    agr:0.5,  place:"above"},
  {id:"in", lat:28.61, lon:77.21,  trade:[13.6,35.0,64.6,70.6,64.0,74.2],   approx:[1,1,1,0,1,1], sanc:1, pay:0.5, log:0.25, agr:0.25, place:"below"},
  {id:"vn", lat:21.03, lon:105.85, trade:[5.5,3.55,3.63,4.59,4.77,5.08],    approx:[0,0,0,0,0,1], sanc:1, pay:0.5, log:0.5,  agr:1,    place:"below"},
  {id:"kr", lat:37.57, lon:126.98, trade:[27.3,21.15,15.0,11.3,11.4,12.0],  approx:[1,0,0,0,1,1], sanc:0, pay:0,   log:0.75, agr:0,    place:"below"},
  {id:"jp", lat:35.68, lon:139.69, trade:[18.8,19.96,9.6,7.4,7.54,8.67],    approx:[1,0,0,1,0,1], sanc:0, pay:0,   log:0.75, agr:0,    place:"right"}
];
var LAST_REAL = 4; /* index of 2025 — the last complete, confirmed year; 2026 (index 5) is a projection */
var CRIT = ["dyn","scale","sanc","pay","log","agr"];
var PRESETS = {
  importer: {dyn:2, scale:4, sanc:5, pay:5, log:3, agr:1},
  exporter: {dyn:3, scale:3, sanc:4, pay:4, log:4, agr:2},
  safe:     {dyn:1, scale:1, sanc:8, pay:7, log:2, agr:1},
  econ:     {dyn:3, scale:3, sanc:0, pay:0, log:3, agr:1}
};

/* ---------- derived criteria (computed, see methodology) ---------- */
/* Momentum and scale are based on 2025 (LAST_REAL), the latest confirmed year — not the 2026 projection. */
function mm(arr){var lo=Math.min.apply(null,arr),hi=Math.max.apply(null,arr);return arr.map(function(v){return hi===lo?0:(v-lo)/(hi-lo);});}
var momentumRaw = C.map(function(c){return Math.log(c.trade[LAST_REAL]/c.trade[0]);});
var scaleRaw = C.map(function(c){return Math.log(c.trade[LAST_REAL]);});
var mom = mm(momentumRaw), scl = mm(scaleRaw);
C.forEach(function(c,i){ c.x = {dyn:mom[i], scale:scl[i], sanc:c.sanc, pay:c.pay, log:c.log, agr:c.agr}; });

function toRad(d){return d*Math.PI/180;}
function geo(a,b){
  var p1=toRad(a.lat),p2=toRad(b.lat),dl=toRad(b.lon-a.lon);
  var y=Math.sin(dl)*Math.cos(p2), x=Math.cos(p1)*Math.sin(p2)-Math.sin(p1)*Math.cos(p2)*Math.cos(dl);
  var brg=(Math.atan2(y,x)*180/Math.PI+360)%360;
  var h=Math.sin((p2-p1)/2)*Math.sin((p2-p1)/2)+Math.cos(p1)*Math.cos(p2)*Math.sin(dl/2)*Math.sin(dl/2);
  var dist=6371*2*Math.atan2(Math.sqrt(h),Math.sqrt(1-h));
  return {brg:brg, dist:dist};
}
function recomputeGeo(){ C.forEach(function(c){ var g = geo(HOME, c); c.brg = g.brg; c.dist = g.dist; }); }
recomputeGeo();

/* ---------- text ---------- */
var T = {
ru:{
  docTitle:"Pacific Compass — Россия и страны АТР",
  navMap:"Карта", navDyn:"Динамика", navScore:"Оценка", navCountries:"Страны", navFind:"Выводы", navMethod:"Данные и источники", navAbout:"О проекте",
  pgNext:"Дальше", pgPrev:"Назад",
  themeDark:"Тёмная тема", themeLight:"Светлая тема",
  presetHint:"Двигайте любой ползунок — набор станет «Свой вариант». Кнопка «Свой вариант» оставляет текущие веса без изменений.",
  heroTitle:"Торговля России со странами АТР, 2021–2026",
  heroLede:"Как менялся товарооборот России с Китаем, Индией, Вьетнамом, Республикой Корея и Японией. Направление и расстояние до каждой столицы отсчитываются от {port}. Размер круга — товарооборот за выбранный год, цвет — рост или снижение к 2021 году.",
  play:"Проиграть 2021–2026", pause:"Пауза",
  roTotal:"млрд $ — оборот с пятью странами", roGrow:"к уровню 2021 года",
  legUp:"рост к 2021 году", legDown:"снижение к 2021 году", legSize:"размер круга — товарооборот",
  home:"Владивосток", ocean:"Тихий океан", russia:"Россия", km:"км",
  port_vladivostok:"Владивосток", port_khabarovsk:"Хабаровск",
  port_vladivostok_gen:"Владивостока", port_khabarovsk_gen:"Хабаровска",
  portLabel:"Точка отсчёта:", estLabel:"оценка", N:"С", E:"В", S:"Ю", W:"З", bn:"млрд $",
  dynTitle:"Динамика товарооборота",
  dynLede:"Товарооборот с каждой страной в виде индекса: 2021 год = 100. Нажмите на название страны справа от графика, чтобы выделить её линию.",
  dynAxis:"Индекс товарооборота, 2021 = 100", dynRef:"уровень 2021 года",
  dynNote:"Пунктирный участок и полые точки — 2026 год: официальные итоги ещё не подведены, показана оценка на основе данных за несколько месяцев года. Значения с пометкой «≈» реконструированы по опубликованным темпам роста. Подробнее — в разделе «Данные и источники».",
  scoreTitle:"Оценка партнёров",
  scoreLede:"Каждая страна оценивается по шести критериям. Выберите готовый набор весов или задайте свои — итог пересчитается сразу. Цветные отрезки показывают вклад каждого критерия.",
  preset_importer:"Импорт товаров в Россию", preset_exporter:"Экспорт с Дальнего Востока", preset_safe:"Минимальный риск", preset_econ:"Без учёта политики", preset_custom:"Свой вариант",
  crit_dyn:"Динамика торговли", crit_scale:"Масштаб торговли", crit_sanc:"Санкционный риск", crit_pay:"Платежи", crit_log:"Логистика через порты Дальнего Востока", crit_agr:"Торговые соглашения с ЕАЭС",
  cd_dyn:"Рост оборота 2025 к 2021 году (логарифм), нормирован от 0 до 1",
  cd_scale:"Объём оборота в 2025 году (логарифм), нормирован от 0 до 1",
  cd_sanc:"1 — страна не присоединилась к санкциям, 0 — присоединилась",
  cd_pay:"1 — расчёты налажены, 0,5 — работают с трудностями, 0 — ограничены санкциями",
  cd_log:"Экспертная оценка доступа с Дальнего Востока: сухопутная граница, морские линии, расстояние",
  cd_agr:"1 — зона свободной торговли, 0,5 — непреференциальное соглашение, 0,25 — переговоры, 0 — нет",
  whyTop:"{c} лидирует: больше всего баллов дают «{a}» и «{b}».",
  whyLast:"{c} на последнем месте: слабее всего «{a}».",
  whatIf:"Проверка гипотезы: если убрать санкции и платежи из расчёта, порядок станет таким — {order}.",
  whatIfSame:"Проверка гипотезы: даже без санкций и платежей порядок не меняется — {order}. Санкционные потери уже отражены в динамике торговли.",
  zeroW:"Все веса равны нулю — сдвиньте хотя бы один ползунок.",
  matrixSum:"Показать оценки стран по каждому критерию",
  matrixNote:"Динамика и масштаб рассчитываются из данных автоматически; санкции, платежи, логистика и соглашения — оценки автора по шкалам, описанным в методике.",
  cTitle:"Страны", cLede:"Краткая справка по каждому партнёру: цифры, условия торговли, причины изменений.",
  f_trade24:"млрд $ — оборот в 2025 году", f_trade26:"оценка на 2026 год", f_change:"изменение к 2021 году", f_dist_from:"км от {port} до столицы",
  f_sanc_no:"Не присоединилась к санкциям", f_sanc_yes:"Присоединилась к санкциям",
  fTitle:"Выводы",
  fHyp:"Гипотеза: главным фактором изменения торговли России со странами АТР после 2022 года стала не география, а позиция страны по санкциям.",
  f1h:"Санкции разделили партнёров", f1p:"Китай и Индия, не вводившие санкций, нарастили торговлю на 67% и в 5,2 раза. Корея и Япония, присоединившиеся к санкциям, потеряли около 60%.",
  f2h:"География не решила исход", f2p:"Сеул и Токио — ближайшие к российскому Дальнему Востоку столицы из пяти, но именно с этими странами торговля упала сильнее всего.",
  f3h:"Нужны ещё и платежи", f3p:"Вьетнам санкций не вводил, но в 2022 году торговля упала на треть из-за проблем с расчётами и доставкой. Рост вернулся, когда заработали расчёты в национальных валютах.",
  fVerdict:"Вывод: гипотеза подтверждена частично — отказ от санкций необходим, но без работающих платежей его недостаточно.",
  mTitle:"Методика, данные и источники",
  m1:"Каждая страна получает оценку x от 0 до 1 по шести критериям. Пользователь задаёт вес w каждого критерия от 0 до 10; итоговый балл — взвешенное среднее, умноженное на 100:",
  m2:"Динамика и масштаб рассчитываются из таможенных данных: берётся логарифм (чтобы Китай с оборотом в сотни миллиардов не подавлял остальных), затем значения нормируются от 0 до 1. Остальные четыре критерия — экспертные оценки по заранее заданным шкалам; их можно оспорить, поэтому веса открыты для изменения.",
  m3:"Ограничения: стоимость торговли зависит от цен на энергоносители; статистика разных стран расходится (например, за 2021 год Вьетнам указывает 5,5 млрд $, а со ссылкой на российскую таможню называлась сумма 7,1 млрд $). Поэтому везде используется один принцип — данные таможни страны-партнёра. Расстояния рассчитаны по формуле гаверсинусов между выбранным дальневосточным портом (Владивосток или Хабаровск — переключается над картой) и столицами.",
  mDataH:"Товарооборот с Россией, млрд $",
  mDataNote:"≈ — расчётное значение. 2021–2024: Япония (2021, 2024) и Корея (2021) восстановлены по опубликованным темпам изменения; Индия (2021–2023) — по разным публикациям индийских данных. 2025: Индия и Корея — оценка (для Индии взято заявление президента РФ ≈$64–65 млрд, которое согласуется с темпом первого полугодия; для Кореи известен только импорт из России — $6,90 млрд по UN Comtrade). 2026: для всех стран — не факт, а оценка на весь год, построенная так — берётся товарооборот 2025 года и умножается на темп роста, зафиксированный за первые месяцы 2026-го к тому же периоду 2025-го (Китай: январь–август, +28,4%; Индия и Япония: первое полугодие, +15,9% и +15%; Вьетнам: январь–май, +6,6%; Корея — открытых сводных данных за 2026 год найти не удалось, взят осторожный ориентир +5%). Официальные заявления и таможенные данные иногда расходятся: например, для Индии в 2024 году президент РФ называл около 64–65 млрд $, а индийская таможня — 70,6. Поэтому везде взяты данные таможни страны-партнёра.",
  mSrcH:"Дополнительные материалы",
  sTableH:"Откуда каждая цифра",
  sTableNote:"Для каждого значения — источник, ссылка и дата обращения. Курсивом «оценка» помечено то, что рассчитано автором, а не опубликовано.",
  sColCountry:"Страна", sColPeriod:"Период", sColValue:"Млрд $", sColSource:"Источник", sColDate:"Дата обращения",
  srcDate:"сентябрь 2026", srcEst:"оценка",
  f4h:"Что изменилось после 2024 года",
  f4p:"В 2025 году торговля с Китаем впервые за четыре года снизилась (−6,9%), но в 2026 году снова растёт: +28,4% за восемь месяцев. Япония после обвала стабилизировалась — +1,3% в 2025 и +15% в первом полугодии 2026 года, но от очень низкой базы. По Корее полных данных нет, поэтому её значения за 2025–2026 годы — оценка.",
  aboutTitle:"О проекте",
  aboutLede:"Pacific Compass — учебный исследовательский проект о том, как менялась торговля России с пятью странами Азиатско-Тихоокеанского региона с 2021 года и что из этого следует для выбора партнёра.",
  ab1h:"Вопрос", ab1p:"Что определило, как изменилась торговля России со странами АТР после 2022 года: расстояние до страны или её позиция по санкциям?",
  ab2h:"Ответ", ab2p:"Гипотеза подтверждается частично: позиция по санкциям объясняет больше, чем география, но без работающих платежей и логистики отказ от санкций рост не гарантирует.",
  ab3h:"Инструмент", ab3p:"Карта, график динамики и оценка перспектив по шести критериям с настраиваемыми весами — чтобы читатель сам проверил вывод.",
  abRulesH:"Правила работы с данными",
  abRules:["Данные берутся из таможенной статистики страны-партнёра; заявления чиновников используются только как ориентир и помечены.","У каждой цифры есть источник, ссылка и дата обращения — см. раздел «Данные и источники».","Расчётные значения помечены «≈». Значения 2026 года — оценка на год по первым месяцам, а не итог.","Оценка перспектив считается по 2025 году — последнему полному году, а не по прогнозу."],
  abLimH:"Ограничения",
  abLimP:"Четыре критерия из шести (санкции, платежи, логистика, соглашения) — экспертные оценки автора по открытым шкалам. Данные разных стран расходятся, данные по Корее за 2025–2026 годы неполные. Это учебная модель, а не рекомендация для реальных сделок.",
  abWhoH:"Автор и версия",
  abWhoP:"Индивидуальный проект, 10 класс. Версия от 28 сентября 2026 года; данные будут обновлены к сдаче в феврале 2027 года.",
  country:"Страна",
  footer:"Pacific Compass — индивидуальный проект «Экономические связи России со странами Азиатско-Тихоокеанского региона», 10 класс, 2026–2027. Данные на сентябрь 2026 года."
},
en:{
  docTitle:"Pacific Compass — Russia and the Asia-Pacific",
  navMap:"Map", navDyn:"Trends", navScore:"Scoring", navCountries:"Countries", navFind:"Findings", navMethod:"Data & sources", navAbout:"About",
  pgNext:"Next", pgPrev:"Back",
  themeDark:"Dark mode", themeLight:"Light mode",
  presetHint:"Move any slider and the set becomes \u201cCustom\u201d. The Custom button keeps the current weights unchanged.",
  heroTitle:"Russia's trade with Asia-Pacific countries, 2021–2026",
  heroLede:"How Russia's trade with China, India, Vietnam, South Korea and Japan has changed. Bearing and distance to each capital are measured from {port}. Circle size shows trade in the selected year; colour shows growth or decline against 2021.",
  play:"Play 2021–2026", pause:"Pause",
  roTotal:"USD bn — trade with the five partners", roGrow:"against the 2021 level",
  legUp:"growth since 2021", legDown:"decline since 2021", legSize:"circle size = trade volume",
  home:"Vladivostok", ocean:"Pacific Ocean", russia:"Russia", km:"km",
  port_vladivostok:"Vladivostok", port_khabarovsk:"Khabarovsk",
  port_vladivostok_gen:"Vladivostok", port_khabarovsk_gen:"Khabarovsk",
  portLabel:"Measured from:", estLabel:"estimate", N:"N", E:"E", S:"S", W:"W", bn:"USD bn",
  dynTitle:"Trade dynamics",
  dynLede:"Trade with each country as an index, 2021 = 100. Click a country name to the right of the chart to highlight its line.",
  dynAxis:"Trade index, 2021 = 100", dynRef:"2021 level",
  dynNote:"The dashed segment and hollow points are 2026: the year is not yet complete, so the point is an estimate based on several months of data. Values marked \u201c\u2248\u201d are reconstructed from published growth rates. See Data & sources for details.",
  scoreTitle:"Partner scoring",
  scoreLede:"Each country is rated on six criteria. Pick a ready-made set of weights or set your own; the result updates instantly. Coloured segments show each criterion's contribution.",
  preset_importer:"Importing into Russia", preset_exporter:"Exporting from the Far East", preset_safe:"Lowest risk", preset_econ:"Economics only", preset_custom:"Custom",
  crit_dyn:"Trade momentum", crit_scale:"Trade scale", crit_sanc:"Sanctions risk", crit_pay:"Payments", crit_log:"Logistics via Far Eastern ports", crit_agr:"Trade agreements with the EAEU",
  cd_dyn:"Growth of trade 2025 vs 2021 (log), scaled from 0 to 1",
  cd_scale:"Trade volume in 2025 (log), scaled from 0 to 1",
  cd_sanc:"1 = the country has not joined sanctions, 0 = it has",
  cd_pay:"1 = settlements work, 0.5 = work with difficulty, 0 = restricted by sanctions",
  cd_log:"Expert rating of access from the Far East: land border, sea lines, distance",
  cd_agr:"1 = free trade area, 0.5 = non-preferential agreement, 0.25 = in negotiation, 0 = none",
  whyTop:"{c} leads: \u201c{a}\u201d and \u201c{b}\u201d contribute the most points.",
  whyLast:"{c} comes last: its weakest area is \u201c{a}\u201d.",
  whatIf:"Hypothesis check: without sanctions and payments in the formula, the order becomes {order}.",
  whatIfSame:"Hypothesis check: even without sanctions and payments the order stays the same \u2014 {order}. The sanctions shock is already built into trade momentum.",
  zeroW:"All weights are zero \u2014 move at least one slider.",
  matrixSum:"Show each country's rating on every criterion",
  matrixNote:"Momentum and scale are computed from the data; sanctions, payments, logistics and agreements are the author's ratings on the scales described in the method.",
  cTitle:"Countries", cLede:"A short profile of each partner: figures, trade conditions and reasons for change.",
  f_trade24:"USD bn \u2014 trade in 2025", f_trade26:"2026 estimate", f_change:"change since 2021", f_dist_from:"km from {port} to the capital",
  f_sanc_no:"Has not joined sanctions", f_sanc_yes:"Has joined sanctions",
  fTitle:"Findings",
  fHyp:"Hypothesis: after 2022 the main driver of Russia's trade with Asia-Pacific countries was not geography but each country's position on sanctions.",
  f1h:"Sanctions split the partners", f1p:"China and India, which imposed no sanctions, grew trade by 67% and 5.2 times. South Korea and Japan, which joined sanctions, lost about 60%.",
  f2h:"Geography did not decide it", f2p:"Seoul and Tokyo are the closest of the five capitals to Russia\u2019s Far East, yet trade with these two countries fell the most.",
  f3h:"Payments matter too", f3p:"Vietnam imposed no sanctions, yet its trade fell by a third in 2022 because of payment and shipping problems. Growth returned once settlements in national currencies started working.",
  fVerdict:"Verdict: the hypothesis is partly confirmed \u2014 staying out of sanctions is necessary, but not enough without working payments.",
  mTitle:"Method, data and sources",
  m1:"Each country gets a rating x from 0 to 1 on six criteria. The user sets a weight w from 0 to 10 for each criterion; the final score is the weighted average multiplied by 100:",
  m2:"Momentum and scale are computed from customs data: a logarithm is taken (so that China's hundreds of billions do not swamp everyone else), then values are scaled from 0 to 1. The other four criteria are expert ratings on fixed scales; they are open to debate, which is why the weights can be changed.",
  m3:"Limitations: trade values depend on energy prices, and national statistics disagree (for 2021, Vietnam reports USD 5.5 bn, while a figure of USD 7.1 bn was cited from Russian customs). The project therefore uses one rule throughout: the partner country's customs data. Distances are great-circle (haversine) distances between the selected Far Eastern port (Vladivostok or Khabarovsk \u2014 switchable above the map) and each capital.",
  mDataH:"Trade with Russia, USD bn",
  mDataNote:"\u2248 = estimate. 2021\u20132024: Japan (2021, 2024) and Korea (2021) are reconstructed from published rates of change; India (2021\u20132023) comes from different publications of Indian data. 2025: India and Korea are estimates (for India the Russian president\u2019s figure of about $64\u201365bn is used, consistent with the first-half pace; for Korea only imports from Russia are known \u2014 $6.90bn per UN Comtrade). 2026: for every country this is a full-year projection \u2014 the 2025 total multiplied by the growth rate seen in the first months of 2026 versus the same months of 2025 (China: January\u2013August, +28.4%; India and Japan: H1, +15.9% and +15%; Vietnam: January\u2013May, +6.6%; Korea: no confirmed aggregate was found, so a cautious +5% is assumed). Official statements and customs data sometimes disagree: for India in 2024 the Russian president cited about USD 64\u201365 bn, while Indian customs reported 70.6. That is why partner-country customs data are used throughout.",
  mSrcH:"Additional materials",
  sTableH:"Where each number comes from",
  sTableNote:"Every value has a source, a link and an access date. Rows marked \u201cestimate\u201d are calculated by the author, not published.",
  sColCountry:"Country", sColPeriod:"Period", sColValue:"USD bn", sColSource:"Source", sColDate:"Accessed",
  srcDate:"September 2026", srcEst:"estimate",
  f4h:"What changed after 2024",
  f4p:"In 2025 trade with China fell for the first time in four years (\u22126.9%), but in 2026 it is growing again: +28.4% over eight months. Japan stabilised after its collapse \u2014 +1.3% in 2025 and +15% in the first half of 2026, though from a very low base. There are no complete data for Korea, so its 2025\u20132026 values are estimates.",
  aboutTitle:"About the project",
  aboutLede:"Pacific Compass is a student research project on how Russia's trade with five Asia-Pacific countries has changed since 2021, and what that means for choosing a partner.",
  ab1h:"The question", ab1p:"What decided how Russia's trade with Asia-Pacific countries changed after 2022: distance to the country, or its position on sanctions?",
  ab2h:"The answer", ab2p:"The hypothesis is partly confirmed: sanctions policy explains more than geography, but without working payments and logistics, staying out of sanctions does not guarantee growth.",
  ab3h:"The tool", ab3p:"A map, a trend chart and a six-criteria scoring tool with adjustable weights, so readers can test the conclusion themselves.",
  abRulesH:"Rules for working with data",
  abRules:["Data comes from the partner country's customs statistics; officials' statements are used only as a guide and are flagged.","Every number has a source, a link and an access date \u2014 see \u201cData & sources\u201d.","Calculated values are marked \u201c\u2248\u201d. 2026 values are full-year estimates from the first months, not final results.","The scoring uses 2025 \u2014 the last complete year \u2014 not the projection."],
  abLimH:"Limitations",
  abLimP:"Four of the six criteria (sanctions, payments, logistics, agreements) are the author's expert ratings on open scales. National statistics disagree, and Korea's 2025\u20132026 data are incomplete. This is a teaching model, not advice for real transactions.",
  abWhoH:"Author and version",
  abWhoP:"Individual project, grade 10. Version of 28 September 2026; the data will be updated before submission in February 2027.",
  country:"Country",
  footer:"Pacific Compass is an individual project, “Economic ties between Russia and the Asia-Pacific countries”, grade 10, 2026–2027. Data as of September 2026."
}};

var NAMES = {
  ru:{cn:"Китай",in:"Индия",vn:"Вьетнам",kr:"Республика Корея",jp:"Япония"},
  en:{cn:"China",in:"India",vn:"Vietnam",kr:"South Korea",jp:"Japan"}
};
var SHORT = {
  ru:{cn:"Китай",in:"Индия",vn:"Вьетнам",kr:"Корея",jp:"Япония"},
  en:{cn:"China",in:"India",vn:"Vietnam",kr:"Korea",jp:"Japan"}
};
var FACTS = {
ru:{
  cn:["Крупнейший торговый партнёр России: 244,8 млрд $ в 2024 году — исторический рекорд.",
      "В 2025 году оборот впервые за четыре года снизился — до 228,1 млрд $ (−6,9%): упал спрос на китайские автомобили в России и подешевела нефть.",
      "Россия продаёт в основном энергоносители, Китай — автомобили, электронику и оборудование.",
      "Санкций не вводил. С ЕАЭС действует непреференциальное соглашение о торгово-экономическом сотрудничестве.",
      "Для российского Дальнего Востока — сосед: граница проходит по Амуру и Уссури."],
  in:["Оборот вырос с 13,6 млрд $ в 2021 году до 70,6 млрд $ в 2024 году — более чем в пять раз.",
      "Рост почти целиком дала российская нефть: в 2024 году Россия продала Индии товаров на 65,7 млрд $, а купила лишь на 4,9 млрд $.",
      "Россия — четвёртый торговый партнёр Индии.",
      "Главная проблема — дисбаланс: он мешает расчётам в национальных валютах. Обсуждается соглашение о свободной торговле с ЕАЭС."],
  vn:["Единственная страна из пяти с действующей зоной свободной торговли с ЕАЭС (с 2016 года).",
      "В 2022 году оборот упал с 5,5 до 3,55 млрд $ из-за проблем с платежами и доставкой, хотя санкций Вьетнам не вводил.",
      "В 2024 году — 4,59 млрд $ (+26,4% за год). Доля расчётов в национальных валютах выросла с 40% в 2023 году почти до 60% в начале 2024 года.",
      "Вьетнам продаёт одежду (762,5 млн $ в 2024 году), кофе (306,2 млн $) и морепродукты; Россия — уголь и удобрения."],
  kr:["Оборот сократился с 27,3 млрд $ в 2021 году до 11,3 млрд $ в 2024 году — минимум с 2009 года.",
      "Корея присоединилась к санкциям и ввела экспортный контроль: в списке товаров, запрещённых к поставке в Россию, — 1402 позиции.",
      "Корея продаёт в Россию автомобили и косметику, покупает уголь, газ и алюминий.",
      "Сеул — ближайшая к российскому Дальнему Востоку столица из пяти, но близость не удержала торговлю."],
  jp:["В 2022 году оборот даже вырос — до 19,96 млрд $ из-за высоких цен на энергоносители, но в 2023 году сократился почти вдвое, до 9,6 млрд $.",
      "В 2025 году — 7,54 млрд $; около 61% японского импорта из России составляет сжиженный природный газ.",
      "Япония действует в рамках санкций G7 и не покупает российскую нефть, кроме поставок с проекта «Сахалин-2».",
      "Основной экспорт Японии в Россию — автомобили и запчасти."]
},
en:{
  cn:["Russia's largest trading partner: USD 244.8 bn in 2024, an all-time record.",
      "In 2025 trade fell for the first time in four years, to USD 228.1 bn (\u22126.9%), as Russian demand for Chinese cars dropped and oil got cheaper.",
      "Russia mainly sells energy; China sells cars, electronics and equipment.",
      "China has imposed no sanctions and has a non-preferential trade and economic cooperation agreement with the EAEU.",
      "For Russia\u2019s Far East it is a neighbour: the border runs along the Amur and Ussuri rivers."],
  in:["Trade grew from USD 13.6 bn in 2021 to USD 70.6 bn in 2024, more than fivefold.",
      "Russian oil drove almost all of it: in 2024 Russia sold India USD 65.7 bn of goods and bought only USD 4.9 bn.",
      "Russia is India's fourth-largest trading partner.",
      "The key problem is the imbalance, which hampers settlements in national currencies. An EAEU free trade agreement is under discussion."],
  vn:["The only one of the five with a working free trade area with the EAEU (since 2016).",
      "In 2022 trade fell from USD 5.5 bn to 3.55 bn because of payment and shipping problems, even though Vietnam imposed no sanctions.",
      "In 2024 it reached USD 4.59 bn (+26.4% in a year). The share of settlements in national currencies rose from 40% in 2023 to almost 60% in early 2024.",
      "Vietnam sells clothing (USD 762.5 m in 2024), coffee (USD 306.2 m) and seafood; Russia sells coal and fertilisers."],
  kr:["Trade fell from USD 27.3 bn in 2021 to USD 11.3 bn in 2024, the lowest since 2009.",
      "Korea joined sanctions and introduced export controls: 1,402 items are now banned from export to Russia.",
      "Korea sells Russia cars and cosmetics and buys coal, gas and aluminium.",
      "Seoul is the closest of the five capitals to Russia\u2019s Far East, yet proximity did not hold trade up."],
  jp:["In 2022 trade even rose, to USD 19.96 bn, on high energy prices, but in 2023 it nearly halved, to USD 9.6 bn.",
      "In 2025 it was USD 7.54 bn; liquefied natural gas makes up about 61% of Japan's imports from Russia.",
      "Japan follows G7 sanctions and buys no Russian oil except supplies from the Sakhalin-2 project.",
      "Japan's main exports to Russia are cars and car parts."]
}};


/* ---------- source table: every value -> source, link, access date ---------- */
var SRC_TABLE = [
 {c:"cn", p:"2021\u20132022", v:[146.9,190.3], n:{ru:"ГТУ КНР: 2021 — 146,88; 2022 — 190,27 (+29,3%).", en:"China customs: 2021 \u2014 146.88; 2022 \u2014 190.27 (+29.3%)."},
   s:[["Профиль: итоги 2021 года","https://profile.ru/?p=1427190"],["Восток России / ТАСС: итоги 2022 года","https://www.eastrussia.ru/news/tovarooborot-rossii-i-kitaya-pobil-istoricheskiy-rekord/"]]},
 {c:"cn", p:"2023", v:[240.1], s:[["ТАСС / Mail Финансы: рекорд 2023 года (ГТУ КНР)","https://finance.mail.ru/article/v-kitae-zayavili-o-rekordnyh-obemah-torgovli-s-rossiey-v-2023-godu-59334261/"]]},
 {c:"cn", p:"2024", v:[244.8], s:[["Право.ру: рекорд 2024 года (ГТУ КНР)","https://pravo.ru/news/256888/"]]},
 {c:"cn", p:"2025", v:[228.1], n:{ru:"−6,9% к 2024 году (228,105 по данным таможни Китая).", en:"\u22126.9% vs 2024 (228.105 per Chinese customs)."},
   s:[["Альта-Софт: данные ГТУ КНР, 08.09.2026","https://www.alta.ru/external_news/130870/"]]},
 {c:"cn", p:"2026", v:[293], e:true, n:{ru:"Январь–август: 185,0 (+28,4% к тому же периоду 2025). Оценка на год = 228,1 × 1,284.", en:"January\u2013August: 185.0 (+28.4% on the same period of 2025). Full-year estimate = 228.1 \u00d7 1.284."},
   s:[["Альта-Софт: данные ГТУ КНР, 08.09.2026","https://www.alta.ru/external_news/130870/"]]},

 {c:"in", p:"2021\u20132023", v:[13.6,35.0,64.6], e:true, n:{ru:"Округлённые значения по публикациям индийской статистики; для 2023 года — январь–ноябрь 59,7.", en:"Rounded values from publications of Indian statistics; for 2023 January\u2013November was 59.7."},
   s:[["Ломоносов-2024: российско-индийская торговля","https://lomonosov.msu.ru/archive/Lomonosov_2024/data/34583/uid172101_e610667e948bcc1707102f4e2f2554be978d6293.docx"],["Эксперт: январь–ноябрь 2023 года — 59,7","https://expert.ru/news/tovarooborot-rossii-i-indii-pokazal-dvukratnyy-rost-do-rekordnoy-otmetki"]]},
 {c:"in", p:"2024", v:[70.6], n:{ru:"Данные индийской таможни: российский экспорт 65,7, индийский 4,9.", en:"Indian customs: Russian exports 65.7, Indian exports 4.9."}, s:[["Альта-Софт: итоги 2024 года","https://www.alta.ru/external_news/117740/"]]},
 {c:"in", p:"2025", v:[64.0], e:true, n:{ru:"Оценка: президент РФ назвал «около 64–65» и признал «некоторое снижение» за 9 месяцев; «по разным статистикам цифры отличаются». Индийская таможня для 2024 года даёт 70,6, поэтому спад 2024→2025 на графике предположительный. Проверка: первое полугодие 2025 = 38,35 ÷ 1,1589 ≈ 33,1.", en:"Estimate: the Russian president cited \u201caround 64\u201365\u201d and acknowledged \u201csome decline\u201d over nine months; \u201cstatistics differ slightly\u201d. Indian customs give 70.6 for 2024, so the 2024\u21922025 dip on the chart is tentative. Check: H1 2025 = 38.35 \u00f7 1.1589 \u2248 33.1."},
   s:[["Эксперт: заявление В. Путина, 05.12.2025","https://expert.ru/news/vladimir-putin-otsenil-obem-tovarooborota-s-indiey-po-itogam-goda"],["Альта-Софт: первое полугодие 2026 (даёт базу H1 2025)","https://www.alta.ru/external_news/130679/"]]},
 {c:"in", p:"2026", v:[74.2], e:true, n:{ru:"Первое полугодие: 38,35 (+15,89%, индийская статистика через торгпредство РФ). Оценка на год = 64 × 1,159.", en:"First half: 38.35 (+15.89%, Indian statistics via the Russian trade mission). Full-year estimate = 64 \u00d7 1.159."},
   s:[["Альта-Софт: торгпредство РФ в Индии","https://www.alta.ru/external_news/130679/"]]},

 {c:"vn", p:"2021\u20132022", v:[5.5,3.55], n:{ru:"Данные вьетнамской стороны.", en:"Vietnamese data."}, s:[["VnEconomy / MoIT: 5,5 в 2021, 3,55 в 2022","https://nhipcaudautu.vn/en/news/vietnam-russia-target-10bln-in-two-way-trade-by-2025-3352041"]]},
 {c:"vn", p:"2023", v:[3.63], s:[["Vietnam Customs News","https://english.haiquanonline.com.vn/new-momentum-for-vietnam-russia-trade-cooperation-31384.html"]]},
 {c:"vn", p:"2024", v:[4.59], s:[["VnEconomy: 4,59 млрд $ в 2024","https://en.vneconomy.vn/vietnam-russia-two-way-trade-reaches-4-59bln-in-2024.htm"]]},
 {c:"vn", p:"2025", v:[4.77], n:{ru:"+4% к 2024 году (таможня Вьетнама).", en:"+4% vs 2024 (Vietnam Customs)."}, s:[["Công Thương: данные таможни Вьетнама","https://ven.congthuong.vn/vietnam-russia-expanding-opportunities-for-bilateral-trade-cooperation-59382.html"]]},
 {c:"vn", p:"2026", v:[5.08], e:true, n:{ru:"Январь–май: 2,16 (+6,6%). Оценка на год = 4,77 × 1,066.", en:"January\u2013May: 2.16 (+6.6%). Full-year estimate = 4.77 \u00d7 1.066."},
   s:[["Nhân Dân: Russia–Viet Nam economic ties","https://en.qdnd.vn/economy/international-cooperation/russia-viet-nam-economic-ties-enter-more-substantive-phase-russian-website-594467"]]},

 {c:"kr", p:"2021\u20132022", v:[[27.3,1],21.15], n:{ru:"2021 восстановлено по падению 2022 года на 22,6% (данные KITA).", en:"2021 reconstructed from the 22.6% fall in 2022 (KITA data)."}, s:[["Aju Daily: торговля Кореи с Россией упала на 22,6%","https://www.ajudaily.com/view/20230222105952530"]]},
 {c:"kr", p:"2023\u20132024", v:[15.0,11.3], n:{ru:"2024: −24% к 2023 году.", en:"2024: \u221224% vs 2023."}, s:[["ТАСС: оборот России и Кореи в 2024 году","https://tass.com/economy/1927047"]]},
 {c:"kr", p:"2025", v:[[11.4,1]], n:{ru:"Оценка = импорт Кореи из России в 2025 (6,90) + экспорт Кореи в Россию в 2024 (4,52): по экспорту за 2025 год данных не нашёл.", en:"Estimate = Korea's imports from Russia in 2025 (6.90) + Korea's exports to Russia in 2024 (4.52); no 2025 export figure was found."},
   s:[["UN Comtrade через TradingEconomics: импорт Кореи по странам, 2025","https://tradingeconomics.com/south-korea/imports-by-country"],["UN Comtrade через TradingEconomics: экспорт Кореи в Россию","https://pt.tradingeconomics.com/south-korea/exports/russia"]]},
 {c:"kr", p:"2026", v:[[12.0,1]], n:{ru:"Сводных данных за 2026 год не найдено; принят осторожный рост +5% — предположение автора.", en:"No aggregate 2026 data found; a cautious +5% growth is the author's assumption."}, s:[]},

 {c:"jp", p:"2021\u20132022", v:[[18.8,1],19.96], n:{ru:"2022: +6,2%. 2021 восстановлено: 19,96 ÷ 1,062.", en:"2022: +6.2%. 2021 reconstructed: 19.96 \u00f7 1.062."}, s:[["Сноб / ТАСС: Япония–Россия в 2022 году","https://snob.ru/news/tovarooborot-yaponii-i-rossii-vyros-na-62-v-2022-godu/"]]},
 {c:"jp", p:"2023", v:[9.6], n:{ru:"1,43 трлн иен; −45,3% в иенах.", en:"JPY 1.43 trillion; \u221245.3% in yen terms."}, s:[["Эксперт / ТАСС по данным Минфина Японии","https://expert.ru/news/eksport-rossiyskogo-zerna-v-yaponiyu-uvelichilsya-v-5-raz"]]},
 {c:"jp", p:"2024", v:[[7.4,1]], n:{ru:"Восстановлено: 2025 год 7,54 при росте +1,3% ≈ 7,45; первое полугодие 2024 — 602,6 млрд иен (≈3,8).", en:"Reconstructed: 2025 is 7.54 after +1.3% \u2248 7.45; H1 2024 was JPY 602.6 bn (\u2248 3.8)."},
   s:[["TKS.ru: итоги 2025 года","https://www.tks.ru/news/nearby/2026/01/22/0015/tovarooborot-yaponii-i-rf-v-2025-godu-vyiros-do-7-54-mlrd/"],["Mail Финансы / ТАСС: первое полугодие 2024","https://finance.mail.ru/article/tovarooborot-yaponii-i-rossii-za-pervye-shest-mesyacev-2024-goda-upal-na-24-8-61982663/"]]},
 {c:"jp", p:"2025", v:[7.54], n:{ru:"+1,3% к 2024 году.", en:"+1.3% vs 2024."}, s:[["TKS.ru: итоги 2025 года (по данным Минфина Японии)","https://www.tks.ru/news/nearby/2026/01/22/0015/tovarooborot-yaponii-i-rf-v-2025-godu-vyiros-do-7-54-mlrd/"]]},
 {c:"jp", p:"2026", v:[[8.7,1]], n:{ru:"Первое полугодие: 670 млрд иен (≈4,1; +15%). Оценка на год = 7,54 × 1,15.", en:"First half: JPY 670 bn (\u2248 4.1; +15%). Full-year estimate = 7.54 \u00d7 1.15."},
   s:[["ТАСС по данным Минфина Японии, первое полугодие 2026","https://new-retail.ru/novosti/retail/tovarooborot_yaponii_i_rossii_v_i_polugodii_vyros_na_157482/"]]}
];
var EXTRA = [
  {t:"Головнин М. Ю. Новые вызовы для экономического сотрудничества России и Вьетнама (ИЭ РАН, 2025)", u:"https://inecon.org/docs/2025/Golovnin-Vietnam-2025-12-10.pdf"},
  {t:"OEC: South Korea – Russia, торговля по товарам", u:"https://oec.world/en/profile/bilateral-country/kor/partner/rus"},
  {t:"Эксперт: доля расчётов России и Вьетнама в национальных валютах", u:"https://expert.ru/news/vladimir-putin-tovarooborot-rf-i-vetnama-v-1-kv-2024-g-vyros-na-tret-a-dolya-raschetov-v-natsvalyutakh-pochti-do-60-protsentov"},
  {t:"Government of Viet Nam: Viet Nam — Russia business forum", u:"https://primeminister.chinhphu.vn/viet-nam-russia-business-forum-held-in-ha-noi-111230407111323726.htm"}
];
FACTS.ru.cn.push("За январь–август 2026 года оборот вырос на 28,4% — до 185,0 млрд $ (ГТУ КНР): спад 2025 года сменился ростом.");
FACTS.en.cn.push("In January\u2013August 2026 trade grew 28.4% to USD 185.0 bn (China customs): the 2025 dip has turned into growth.");
FACTS.ru.in.push("В первом полугодии 2026 года оборот — 38,35 млрд $ (+15,9%). В 2025 году он, по оценке, снизился: президент РФ признавал «некоторое снижение» за девять месяцев.");
FACTS.en.in.push("In the first half of 2026 trade was USD 38.35 bn (+15.9%). In 2025 it probably fell: the Russian president acknowledged \u201csome decline\u201d over nine months.");
FACTS.ru.vn.push("В 2025 году — 4,77 млрд $ (+4%); январь–май 2026 — 2,16 млрд $ (+6,6%).");
FACTS.en.vn.push("In 2025 trade was USD 4.77 bn (+4%); January\u2013May 2026 was USD 2.16 bn (+6.6%).");
FACTS.ru.kr.push("Для 2025 года известен только импорт Кореи из России — 6,90 млрд $ (UN Comtrade); полных данных за 2025 и 2026 годы нет, поэтому оборот показан как оценка.");
FACTS.en.kr.push("For 2025 only Korea's imports from Russia are known \u2014 USD 6.90 bn (UN Comtrade); there are no complete 2025 or 2026 data, so trade is shown as an estimate.");
FACTS.ru.jp.push("В первом полугодии 2026 года — около 4,1 млрд $ (+15%), но от очень низкой базы.");
FACTS.en.jp.push("In the first half of 2026 trade was about USD 4.1 bn (+15%), from a very low base.");

var SOURCES = [
  {t:"Право.ру: товарооборот России и Китая в 2024 году ($244,8 млрд, ГТУ КНР)", u:"https://pravo.ru/news/256888/amp/"},
  {t:"Эксперт: российско-китайский товарооборот в 2025 году снизился почти на 7%", u:"https://expert.ru/news/rossiysko-kitayskiy-tovarooborot-v-2025-godu-snizilsya-pochti-na-7"},
  {t:"TASS: Trade turnover between Russia, South Korea loses 24% in 2024", u:"https://tass.com/economy/1927047"},
  {t:"Aju Daily / KITA: South Korea's trade with Russia fell 22.6% in 2022", u:"https://www.ajudaily.com/view/20230222105952530"},
  {t:"Сноб / ТАСС: товарооборот Японии и России в 2022 году — 19,96 млрд $", u:"https://snob.ru/news/tovarooborot-yaponii-i-rossii-vyros-na-62-v-2022-godu/"},
  {t:"Эксперт: итоги торговли Японии и России в 2023 году", u:"https://expert.ru/news/eksport-rossiyskogo-zerna-v-yaponiyu-uvelichilsya-v-5-raz"},
  {t:"TKS.ru: товарооборот Японии и РФ в 2025 году — 7,54 млрд $", u:"https://www.tks.ru/news/nearby/2026/01/22/0015/tovarooborot-yaponii-i-rf-v-2025-godu-vyiros-do-7-54-mlrd/"},
  {t:"Альта-Софт: товарооборот России и Индии по данным индийской таможни", u:"https://www.alta.ru/external_news/117740/"},
  {t:"Ломоносов-2024: российско-индийская торговля в 2021–2023 гг.", u:"https://lomonosov.msu.ru/archive/Lomonosov_2024/data/34583/uid172101_e610667e948bcc1707102f4e2f2554be978d6293.docx"},
  {t:"Government of Viet Nam: trade was USD 5.5 bn in 2021 and USD 3.55 bn in 2022", u:"https://primeminister.chinhphu.vn/viet-nam-russia-business-forum-held-in-ha-noi-111230407111323726.htm"},
  {t:"Vietnam Customs News: Vietnam-Russia trade in 2023", u:"https://english.haiquanonline.com.vn/new-momentum-for-vietnam-russia-trade-cooperation-31384.html"},
  {t:"VnEconomy: Vietnam-Russia two-way trade reaches $4.59bln in 2024", u:"https://en.vneconomy.vn/vietnam-russia-two-way-trade-reaches-4-59bln-in-2024.htm"},
  {t:"Эксперт: расчёты России и Вьетнама в национальных валютах", u:"https://expert.ru/news/vladimir-putin-tovarooborot-rf-i-vetnama-v-1-kv-2024-g-vyros-na-tret-a-dolya-raschetov-v-natsvalyutakh-pochti-do-60-protsentov"},
  {t:"OEC: South Korea – Russia trade by product, 2024", u:"https://oec.world/en/profile/bilateral-country/kor/partner/rus"},
  {t:"Головнин М. Ю. Новые вызовы для экономического сотрудничества России и Вьетнама (ИЭ РАН, 2025)", u:"https://inecon.org/docs/2025/Golovnin-Vietnam-2025-12-10.pdf"}
];

/* ---------- state ---------- */
var lang = "ru", yi = LAST_REAL, preset = "importer", focusDyn = null, tab = "cn";
var W = Object.assign({}, PRESETS.importer);
try { var sl = localStorage.getItem("pc-lang"); if (sl === "en" || sl === "ru") lang = sl; } catch(e) {}

function t(k){ return (T[lang][k] !== undefined) ? T[lang][k] : k; }
function nf(v, d){ return new Intl.NumberFormat(lang === "ru" ? "ru-RU" : "en-US", {maximumFractionDigits: d === undefined ? 1 : d, minimumFractionDigits: 0}).format(v); }
function esc(s){ return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
function idx(c, i){ return c.trade[i] / c.trade[0] * 100; }

/* ---------- static text ---------- */
function applyTheme(){
  var dark = document.documentElement.getAttribute("data-theme") === "dark";
  var b = document.getElementById("themeBtn"); if (b) b.textContent = dark ? t("themeLight") : t("themeDark");
}
function applyText(){
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-i]").forEach(function(el){ el.textContent = t(el.getAttribute("data-i")); });
  document.querySelectorAll("[data-lang]").forEach(function(b){ b.setAttribute("aria-pressed", b.getAttribute("data-lang") === lang ? "true" : "false"); });
  applyTheme();
  var pb = document.getElementById("playBtn"); if (pb) pb.textContent = playing ? t("pause") : t("play");
  var hl = document.getElementById("heroLede"); if (hl) hl.textContent = t("heroLede").replace("{port}", t("port_"+portKey+"_gen"));
}

/* ---------- compass ---------- */
var CX = 300, CY = 276, R = 238, MAXD = 7000;
function rOf(d){ return R * Math.sqrt(d / MAXD); }
var MAXT = Math.max.apply(null, C.reduce(function(a, c){ return a.concat(c.trade); }, []));
function nodeR(v){ return 8 + 38 * Math.sqrt(v / MAXT); }
function nodeColor(c, i){
  if (i === 0) return "var(--neutral)";
  return idx(c, i) >= 100 ? "var(--up)" : "var(--down)";
}
function pos(c){
  var r = rOf(c.dist), b = toRad(c.brg);
  return {x: CX + r * Math.sin(b), y: CY - r * Math.cos(b), ux: Math.sin(b), uy: -Math.cos(b)};
}
function buildCompass(){
  var s = document.getElementById("compass"), h = [];
  s.setAttribute("aria-label", t("heroTitle"));
  h.push('<g stroke="var(--rule)" fill="none">');
  [1000, 2500, 5000].forEach(function(d){
    h.push('<circle cx="'+CX+'" cy="'+CY+'" r="'+rOf(d).toFixed(1)+'" stroke-dasharray="3 5"/>');
  });
  h.push('<circle cx="'+CX+'" cy="'+CY+'" r="'+R+'" stroke="var(--ink-2)" stroke-opacity=".5"/>');
  h.push('</g>');
  [1000, 2500, 5000].forEach(function(d){
    var r = rOf(d), a = toRad(38);
    h.push('<text x="'+(CX + r*Math.sin(a) + 4).toFixed(1)+'" y="'+(CY - r*Math.cos(a)).toFixed(1)+'" font-size="13" fill="var(--ink-2)">'+nf(d,0)+' '+esc(t("km"))+'</text>');
  });
  h.push('<g stroke="var(--ink-2)">');
  for (var a = 0; a < 360; a += 10){
    var major = a % 90 === 0, mid = a % 30 === 0, len = major ? 14 : (mid ? 9 : 5), rr = toRad(a);
    h.push('<line x1="'+(CX + R*Math.sin(rr)).toFixed(1)+'" y1="'+(CY - R*Math.cos(rr)).toFixed(1)+'" x2="'+(CX + (R+len)*Math.sin(rr)).toFixed(1)+'" y2="'+(CY - (R+len)*Math.cos(rr)).toFixed(1)+'" stroke-width="'+(major?1.6:1)+'"/>');
  }
  h.push('</g>');
  [["N",0],["E",90],["S",180],["W",270]].forEach(function(p){
    var rr = toRad(p[1]), rx = CX + (R+26)*Math.sin(rr), ry = CY - (R+26)*Math.cos(rr) + 6;
    h.push('<text x="'+rx.toFixed(1)+'" y="'+ry.toFixed(1)+'" text-anchor="middle" font-weight="600" font-size="16" fill="var(--ink)">'+esc(t(p[0]))+'</text>');
  });
  C.forEach(function(c){
    var p = pos(c);
    h.push('<line x1="'+CX+'" y1="'+CY+'" x2="'+p.x.toFixed(1)+'" y2="'+p.y.toFixed(1)+'" stroke="var(--ink-2)" stroke-opacity=".35" stroke-dasharray="1 4"/>');
  });
  C.forEach(function(c){
    var p = pos(c);
    h.push('<g class="cn-node" data-id="'+c.id+'" tabindex="0" role="button" style="cursor:pointer">');
    h.push('<circle class="node" id="n-'+c.id+'" cx="'+p.x.toFixed(1)+'" cy="'+p.y.toFixed(1)+'" r="10" fill="var(--neutral)" fill-opacity=".78" stroke="var(--surface)" stroke-width="1.5"><title id="nt-'+c.id+'"></title></circle>');
    h.push('<text id="nl-'+c.id+'" font-size="18" fill="var(--ink)"><tspan class="nm" font-weight="600"></tspan><tspan class="vl" fill="var(--ink-2)" font-size="15"></tspan></text>');
    h.push('</g>');
  });
  h.push('<path d="M'+CX+' '+(CY-11)+' L'+(CX+4)+' '+CY+' L'+CX+' '+(CY+11)+' L'+(CX-4)+' '+CY+' Z" fill="var(--ink)"/>');
  h.push('<circle cx="'+CX+'" cy="'+CY+'" r="3" fill="var(--bg)"/>');
  h.push('<text x="'+(CX+10)+'" y="'+(CY-10)+'" font-size="17" font-weight="600" fill="var(--ink)">'+esc(t("port_"+portKey))+'</text>');
  [["ocean",124,200],["russia",318,120]].forEach(function(w){ var rr = toRad(w[1]); h.push('<text x="'+(CX + w[2]*Math.sin(rr)).toFixed(1)+'" y="'+(CY - w[2]*Math.cos(rr)).toFixed(1)+'" text-anchor="middle" font-size="15" fill="var(--ink-2)" letter-spacing="1">'+esc(t(w[0]))+'</text>'); });
  s.innerHTML = h.join("");
  s.querySelectorAll(".cn-node").forEach(function(g){
    var go = function(){ location.href = "countries.html?c=" + g.getAttribute("data-id"); };
    g.addEventListener("click", go);
    g.addEventListener("keydown", function(e){ if (e.key === "Enter" || e.key === " "){ e.preventDefault(); go(); } });
  });
  updateCompass();
}
function updateCompass(){
  C.forEach(function(c){
    var p = pos(c), v = c.trade[yi], r = nodeR(v);
    var n = document.getElementById("n-"+c.id);
    n.setAttribute("r", r.toFixed(1));
    n.setAttribute("fill", nodeColor(c, yi));
    var ch = idx(c, yi) - 100;
    document.getElementById("nt-"+c.id).textContent = NAMES[lang][c.id] + ", " + YEARS[yi] + ": " + (c.approx[yi] ? "\u2248" : "") + nf(v) + " " + t("bn") + (yi ? " (" + (ch >= 0 ? "+" : "") + nf(ch, 0) + "%)" : "");
    var L = document.getElementById("nl-"+c.id), nm = L.querySelector(".nm"), vl = L.querySelector(".vl");
    var x, y, anchor;
    if (c.place === "above"){ x = p.x; y = p.y - r - 28; anchor = "middle"; }
    else if (c.place === "right"){ x = p.x + r + 8; y = p.y - 4; anchor = "start"; }
    else { x = p.x; y = p.y + r + 19; anchor = "middle"; }
    L.setAttribute("text-anchor", anchor);
    nm.setAttribute("x", x.toFixed(1)); nm.setAttribute("y", y.toFixed(1)); nm.textContent = SHORT[lang][c.id];
    vl.setAttribute("x", x.toFixed(1)); vl.setAttribute("y", (y + 18).toFixed(1)); vl.textContent = (c.approx[yi] ? "\u2248" : "") + nf(v) + " " + t("bn");
  });
  var tot = C.reduce(function(s, c){ return s + c.trade[yi]; }, 0), tot0 = C.reduce(function(s, c){ return s + c.trade[0]; }, 0);
  document.getElementById("roTotal").textContent = nf(tot);
  var g = (tot / tot0 - 1) * 100;
  document.getElementById("roGrow").textContent = yi === 0 ? "100%" : (g >= 0 ? "+" : "\u2212") + nf(Math.abs(g), 0) + "%";
  document.querySelectorAll("#yearSeg button").forEach(function(b, i){ b.setAttribute("aria-pressed", i === yi ? "true" : "false"); });
}
function buildPortSeg(){
  var el = document.getElementById("portSeg");
  el.setAttribute("aria-label", t("portLabel"));
  var keys = ["vladivostok", "khabarovsk"];
  el.innerHTML = '<span style="align-self:center;padding-left:9px;font-size:13px;color:var(--ink-2)">'+esc(t("portLabel"))+'</span>' +
    keys.map(function(k){ return '<button type="button" data-port="'+k+'" aria-pressed="'+(portKey===k)+'">'+esc(t("port_"+k))+'</button>'; }).join("");
  el.querySelectorAll("button").forEach(function(b){
    b.addEventListener("click", function(){
      portKey = b.getAttribute("data-port"); HOME = PORTS[portKey];
      try { localStorage.setItem("pc-port", portKey); } catch(e) {}
      recomputeGeo(); buildPortSeg(); buildCompass(); applyText(); if (has("tabs")) renderTabs();
    });
  });
}
function buildYears(){
  var seg = document.getElementById("yearSeg");
  seg.setAttribute("aria-label", lang === "ru" ? "Год" : "Year");
  seg.innerHTML = YEARS.map(function(y, i){ return '<button type="button" data-y="'+i+'" aria-pressed="'+(i===yi)+'">'+y+(i > LAST_REAL ? " \u2248" : "")+'</button>'; }).join("");
  seg.querySelectorAll("button").forEach(function(b){ b.addEventListener("click", function(){ stopPlay(); yi = +b.getAttribute("data-y"); updateCompass(); }); });
}
var playing = false, timer = null;
function reduced(){ return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches; }
function stopPlay(){ playing = false; if (timer) clearInterval(timer); timer = null; var pb = document.getElementById("playBtn"); if (pb) pb.textContent = t("play"); }
(document.getElementById("playBtn") || document.createElement("button")).addEventListener("click", function(){
  if (playing){ stopPlay(); return; }
  playing = true; this.textContent = t("pause"); yi = 0; updateCompass();
  timer = setInterval(function(){ yi++; updateCompass(); if (yi >= YEARS.length - 1) stopPlay(); }, reduced() ? 400 : 1100);
});

/* ---------- dynamics chart ---------- */
function buildDyn(){
  var s = document.getElementById("dyn"), h = [], L = 70, Rr = 590, T0 = 30, B = 300, peak = 600;
  var x = function(i){ return L + i * (Rr - L) / (YEARS.length - 1); }, y = function(v){ return B - v / peak * (B - T0); };
  s.setAttribute("aria-label", t("dynTitle"));
  for (var v = 0; v <= peak; v += 100){
    h.push('<line x1="'+L+'" x2="'+Rr+'" y1="'+y(v)+'" y2="'+y(v)+'" stroke="'+(v===0?'var(--ink-2)':'var(--rule-2)')+'"/>');
    h.push('<text x="'+(L-10)+'" y="'+(y(v)+4)+'" text-anchor="end" font-size="13" fill="var(--ink-2)">'+v+'</text>');
  }
  h.push('<text x="'+L+'" y="16" font-size="13" fill="var(--ink-2)">'+esc(t("dynAxis"))+'</text>');
  h.push('<line x1="'+L+'" x2="'+Rr+'" y1="'+y(100)+'" y2="'+y(100)+'" stroke="var(--ink-2)" stroke-dasharray="4 4"/>');
  h.push('<text x="'+(Rr-6)+'" y="'+(y(100)-7)+'" text-anchor="end" font-size="12.5" fill="var(--ink-2)">'+esc(t("dynRef"))+'</text>');
  YEARS.forEach(function(yr, i){ h.push('<text x="'+x(i)+'" y="'+(B+22)+'" text-anchor="middle" font-size="13" fill="var(--ink-2)">'+yr+'</text>'); });
  var LAST = YEARS.length - 1;
  var ends = C.map(function(c){ return {c:c, y:y(idx(c, LAST))}; }).sort(function(a, b){ return a.y - b.y; });
  for (var k = 1; k < ends.length; k++){ if (ends[k].y - ends[k-1].y < 17) ends[k].y = ends[k-1].y + 17; }
  C.forEach(function(c){
    var op = (focusDyn && focusDyn !== c.id) ? .15 : 1, col = "var(--l-"+c.id+")";
    var solidPts = YEARS.slice(0, LAST_REAL + 1).map(function(_, i){ return x(i)+","+y(idx(c, i)).toFixed(1); }).join(" ");
    var lastPts = x(LAST_REAL)+","+y(idx(c, LAST_REAL)).toFixed(1)+" "+x(LAST_REAL+1)+","+y(idx(c, LAST_REAL+1)).toFixed(1);
    var sw = focusDyn===c.id?3.5:2.5;
    h.push('<g class="dyn-line" opacity="'+op+'"><polyline fill="none" stroke="'+col+'" stroke-width="'+sw+'" stroke-linejoin="round" points="'+solidPts+'"/>' +
      '<polyline fill="none" stroke="'+col+'" stroke-width="'+sw+'" stroke-dasharray="5 4" stroke-linejoin="round" points="'+lastPts+'"/>');
    YEARS.forEach(function(yr, i){
      var projected = i > LAST_REAL;
      h.push('<circle cx="'+x(i)+'" cy="'+y(idx(c, i)).toFixed(1)+'" r="4.5" fill="'+(projected?"var(--surface)":col)+'" stroke="'+col+'" stroke-width="'+(projected?2:0)+'"><title>'+esc(NAMES[lang][c.id]+", "+yr+(projected?" ("+t("estLabel")+")":"")+": "+(c.approx[i]?"\u2248":"")+nf(c.trade[i])+" "+t("bn")+" \u2014 "+nf(idx(c, i), 0))+'</title></circle>');
    });
    h.push('</g>');
  });
  ends.forEach(function(e){
    var c = e.c, op = (focusDyn && focusDyn !== c.id) ? .3 : 1;
    h.push('<g class="dyn-lab" data-id="'+c.id+'" tabindex="0" role="button" style="cursor:pointer" opacity="'+op+'"><rect x="'+(Rr+8)+'" y="'+(e.y-12)+'" width="160" height="22" fill="transparent"/><text x="'+(Rr+14)+'" y="'+(e.y+4)+'" font-size="14"><tspan font-weight="600" fill="var(--l-'+c.id+')">'+esc(SHORT[lang][c.id])+'</tspan><tspan dx="7" fill="var(--ink-2)">'+(c.approx[LAST]?"\u2248":"")+nf(idx(c, LAST), 0)+'</tspan></text></g>');
  });
  s.innerHTML = h.join("");
  s.querySelectorAll(".dyn-lab").forEach(function(g){
    var go = function(){ var id = g.getAttribute("data-id"); focusDyn = focusDyn === id ? null : id; buildDyn(); };
    g.addEventListener("click", go);
    g.addEventListener("keydown", function(e){ if (e.key === "Enter" || e.key === " "){ e.preventDefault(); go(); } });
  });
}

/* ---------- scoring ---------- */
function score(c, w){
  var sw = CRIT.reduce(function(s, k){ return s + w[k]; }, 0);
  if (!sw) return {total:0, parts:{}};
  var parts = {}, tot = 0;
  CRIT.forEach(function(k){ parts[k] = w[k] * c.x[k] / sw * 100; tot += parts[k]; });
  return {total:tot, parts:parts};
}
function buildPresets(){
  var el = document.getElementById("presets");
  el.setAttribute("aria-label", t("scoreTitle"));
  var keys = ["importer","exporter","safe","econ","custom"];
  el.innerHTML = keys.map(function(k){ return '<button type="button" class="chip" data-p="'+k+'" aria-pressed="'+(preset===k)+'"'+'>'+esc(t("preset_"+k))+'</button>'; }).join("");
  el.querySelectorAll("button").forEach(function(b){
    b.addEventListener("click", function(){
      var k = b.getAttribute("data-p");
      if (k === "custom"){ preset = "custom"; buildPresets(); renderScore(); return; }
      preset = k; W = Object.assign({}, PRESETS[k]); buildPresets(); buildSliders(); renderScore();
    });
  });
}
function buildSliders(){
  var el = document.getElementById("sliders");
  el.innerHTML = CRIT.map(function(k){
    return '<div class="sl"><label for="w-'+k+'"><span><span class="swatch" style="background:var(--c-'+k+')"></span>'+esc(t("crit_"+k))+'</span><output id="o-'+k+'" for="w-'+k+'">'+W[k]+'</output></label>'+
      '<input type="range" id="w-'+k+'" min="0" max="10" step="1" value="'+W[k]+'" aria-describedby="d-'+k+'"><p id="d-'+k+'">'+esc(t("cd_"+k))+'</p></div>';
  }).join("");
  CRIT.forEach(function(k){
    var inp = document.getElementById("w-"+k);
    inp.addEventListener("input", function(){
      W[k] = +inp.value; document.getElementById("o-"+k).textContent = inp.value;
      if (preset !== "custom"){ preset = "custom"; buildPresets(); }
      renderScore();
    });
  });
}
function critName(k){ return t("crit_"+k); }
function renderScore(){
  var res = C.map(function(c){ var s = score(c, W); return {c:c, s:s}; }).sort(function(a, b){ return b.s.total - a.s.total; });
  var ol = document.getElementById("results"), why = document.getElementById("why");
  var sw = CRIT.reduce(function(s, k){ return s + W[k]; }, 0);
  ol.innerHTML = res.map(function(r, i){
    var segs = CRIT.map(function(k){ var v = r.s.parts[k] || 0; return '<span style="width:'+v.toFixed(2)+'%;background:var(--c-'+k+')" title="'+esc(critName(k)+": "+nf(v, 1))+'"></span>'; }).join("");
    return '<li><span class="rk">'+(i+1)+'</span><span class="nm">'+esc(NAMES[lang][r.c.id])+'</span><span class="sc">'+nf(r.s.total, 0)+'</span><div class="bar-track" role="img" aria-label="'+esc(NAMES[lang][r.c.id]+": "+nf(r.s.total, 0))+'">'+segs+'</div></li>';
  }).join("");
  if (!sw){ why.innerHTML = '<p>'+esc(t("zeroW"))+'</p>'; return; }
  var top = res[0], last = res[res.length - 1];
  var tp = CRIT.filter(function(k){ return W[k] > 0; }).sort(function(a, b){ return top.s.parts[b] - top.s.parts[a]; });
  var weakest = CRIT.filter(function(k){ return W[k] > 0; }).sort(function(a, b){ return last.c.x[a] - last.c.x[b]; })[0];
  var p1 = t("whyTop").replace("{c}", NAMES[lang][top.c.id]).replace("{a}", critName(tp[0])).replace("{b}", critName(tp[1] || tp[0]));
  var p2 = t("whyLast").replace("{c}", NAMES[lang][last.c.id]).replace("{a}", critName(weakest));
  var w2 = Object.assign({}, W, {sanc:0, pay:0});
  var sw2 = CRIT.reduce(function(s, k){ return s + w2[k]; }, 0);
  var p3 = "";
  if (sw2 && (W.sanc || W.pay)){
    var alt = C.map(function(c){ return {c:c, v:score(c, w2).total}; }).sort(function(a, b){ return b.v - a.v; });
    var same = alt.every(function(a, i){ return a.c.id === res[i].c.id; });
    var order = alt.map(function(a){ return SHORT[lang][a.c.id]; }).join(" \u2192 ");
    p3 = (same ? t("whatIfSame") : t("whatIf")).replace("{order}", order);
  }
  why.innerHTML = '<p>'+esc(p1)+' '+esc(p2)+'</p>' + (p3 ? '<p>'+esc(p3)+'</p>' : '');
}
function buildMatrix(){
  var tb = document.getElementById("matrix");
  var head = '<thead><tr><th>'+esc(t("country"))+'</th>' + CRIT.map(function(k){ return '<th class="num">'+esc(critName(k))+'</th>'; }).join("") + '</tr></thead>';
  var body = '<tbody>' + C.map(function(c){ return '<tr><td>'+esc(NAMES[lang][c.id])+'</td>' + CRIT.map(function(k){ return '<td class="num">'+nf(c.x[k], 2)+'</td>'; }).join("") + '</tr>'; }).join("") + '</tbody>';
  tb.innerHTML = head + body;
}

/* ---------- countries ---------- */
function renderTabs(){
  var el = document.getElementById("tabs"); if (!el) return;
  el.innerHTML = C.map(function(c){ return '<button type="button" role="tab" id="tab-'+c.id+'" aria-controls="panel" aria-selected="'+(tab===c.id)+'" tabindex="'+(tab===c.id?0:-1)+'">'+esc(SHORT[lang][c.id])+'</button>'; }).join("");
  el.querySelectorAll("button").forEach(function(b, i){
    b.addEventListener("click", function(){ tab = C[i].id; try { history.replaceState(null, "", "?c=" + tab); } catch(e) {} renderTabs(); });
    b.addEventListener("keydown", function(e){
      var d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0; if (!d) return;
      e.preventDefault(); var j = (i + d + C.length) % C.length; tab = C[j].id; renderTabs(); document.getElementById("tab-"+tab).focus();
    });
  });
  var c = C.filter(function(x){ return x.id === tab; })[0], ch = idx(c, LAST_REAL) - 100;
  var p = document.getElementById("panel");
  p.setAttribute("aria-labelledby", "tab-"+c.id);
  p.innerHTML =
    '<div class="facts">' +
      '<div class="fact"><b>'+nf(c.trade[LAST_REAL])+'</b><span>'+esc(t("f_trade24"))+'</span></div>' +
      '<div class="fact"><b style="color:'+(ch>=0?'var(--up)':'var(--down)')+'">'+(ch>=0?"+":"\u2212")+nf(Math.abs(ch), 0)+'%</b><span>'+esc(t("f_change"))+'</span></div>' +
      '<div class="fact"><b>\u2248'+nf(c.trade[5])+'</b><span>'+esc(t("f_trade26"))+'</span></div>' +
      '<div class="fact"><b>'+nf(Math.round(c.dist/10)*10, 0)+'</b><span>'+esc(t("f_dist_from").replace("{port}", t("port_"+portKey+"_gen")))+'</span></div>' +
      '<div><span class="status '+(c.sanc?"no":"yes")+'">'+esc(t(c.sanc?"f_sanc_no":"f_sanc_yes"))+'</span></div>' +
    '</div>' +
    '<div><h3 style="margin-bottom:14px">'+esc(NAMES[lang][c.id])+'</h3><ul>' + FACTS[lang][c.id].map(function(f){ return '<li>'+esc(f)+'</li>'; }).join("") + '</ul></div>';
}

/* ---------- method ---------- */
function buildRaw(){
  var tb = document.getElementById("rawTable");
  var head = '<thead><tr><th>'+esc(t("country"))+'</th>' + YEARS.map(function(y, i){ return '<th class="num">'+y+(i > LAST_REAL ? " \u2248" : "")+'</th>'; }).join("") + '</tr></thead>';
  var body = '<tbody>' + C.map(function(c){ return '<tr><td>'+esc(NAMES[lang][c.id])+'</td>' + c.trade.map(function(v, i){ return '<td class="num">'+(c.approx[i]?"\u2248":"")+nf(v, 2)+'</td>'; }).join("") + '</tr>'; }).join("") + '</tbody>';
  tb.innerHTML = head + body;
  document.getElementById("srcList").innerHTML = EXTRA.map(function(s){ return '<li><a href="'+s.u+'" target="_blank" rel="noopener">'+esc(s.t)+'</a></li>'; }).join("");
  buildSources();
}
function buildSources(){
  var tb = document.getElementById("srcTable");
  var head = '<thead><tr><th>'+esc(t("sColCountry"))+'</th><th>'+esc(t("sColPeriod"))+'</th><th class="num">'+esc(t("sColValue"))+'</th><th>'+esc(t("sColSource"))+'</th><th>'+esc(t("sColDate"))+'</th></tr></thead>';
  var body = '<tbody>' + SRC_TABLE.map(function(r){
    var vals = r.v.map(function(x){ var n = Array.isArray(x) ? x[0] : x, e = Array.isArray(x) ? x[1] : r.e; return (e ? "\u2248" : "") + nf(n, 2); }).join("; ");
    var links = r.s.map(function(x){ return '<a href="'+x[1]+'" target="_blank" rel="noopener">'+esc(x[0])+'</a>'; }).join("");
    if (!r.s.length) links = '<em>'+esc(t("srcEst"))+'</em>';
    var note = (r.n && r.n[lang]) ? '<small>'+esc(r.n[lang])+'</small>' : "";
    return '<tr><td>'+esc(NAMES[lang][r.c])+'</td><td>'+esc(r.p)+'</td><td class="num">'+vals+'</td><td>'+links+note+'</td><td>'+(r.s.length ? esc(t("srcDate")) : "\u2014")+'</td></tr>';
  }).join("") + '</tbody>';
  tb.innerHTML = head + body;
}


/* ---------- boot ---------- */

/* ---------- site chrome: title, current link, previous/next ---------- */
var PAGE = document.body.getAttribute("data-page") || "index";
var ORDER = ["index","dynamics","score","countries","findings","data","about"];
var PAGE_KEY = {index:"navMap", dynamics:"navDyn", score:"navScore", countries:"navCountries", findings:"navFind", data:"navMethod", about:"navAbout"};
function buildChrome(){
  document.title = t(PAGE_KEY[PAGE]) + " \u2014 Pacific Compass";
  document.querySelectorAll(".nav a").forEach(function(a){
    if (a.getAttribute("data-p") === PAGE) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
  });
  var old = document.querySelector(".pager"); if (old) old.parentNode.removeChild(old);
  var i = ORDER.indexOf(PAGE), h = '<div class="pager">';
  h += i > 0 ? '<a href="' + ORDER[i-1] + '.html">\u2190 ' + esc(t("pgPrev")) + ': ' + esc(t(PAGE_KEY[ORDER[i-1]])) + '</a>' : '<span></span>';
  h += i < ORDER.length - 1 ? '<a href="' + ORDER[i+1] + '.html">' + esc(t("pgNext")) + ': ' + esc(t(PAGE_KEY[ORDER[i+1]])) + ' \u2192</a>' : '<span></span>';
  document.querySelector("main").insertAdjacentHTML("beforeend", h + '</div>');
}

/* ---------- boot ---------- */
function has(id){ return !!document.getElementById(id); }
function renderAll(){
  applyText();
  if (has("compass")){ buildPortSeg(); buildYears(); buildCompass(); }
  if (has("dyn")) buildDyn();
  if (has("presets")){ buildPresets(); buildSliders(); renderScore(); buildMatrix(); }
  if (has("tabs")) renderTabs();
  if (has("rawTable")) buildRaw();
  if (has("aboutRules")) document.getElementById("aboutRules").innerHTML = t("abRules").map(function(x){ return '<li>'+esc(x)+'</li>'; }).join("");
  buildChrome();
}
document.querySelectorAll("[data-lang]").forEach(function(b){
  b.addEventListener("click", function(){
    lang = b.getAttribute("data-lang");
    try { localStorage.setItem("pc-lang", lang); } catch(e) {}
    renderAll();
  });
});
(document.getElementById("themeBtn") || document.createElement("button")).addEventListener("click", function(){
  var dark = document.documentElement.getAttribute("data-theme") === "dark";
  if (dark) document.documentElement.removeAttribute("data-theme"); else document.documentElement.setAttribute("data-theme", "dark");
  try { localStorage.setItem("pc-theme", dark ? "light" : "dark"); } catch(e) {}
  applyTheme();
});
try { var qc = new URLSearchParams(location.search).get("c"); if (qc && C.some(function(x){ return x.id === qc; })) tab = qc; } catch(e) {}
renderAll();
})();
