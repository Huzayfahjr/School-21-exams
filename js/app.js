/* Imtihon Tayyorlov: static exam-prep platform. Data lives in data/*.json. */
(function () {
  'use strict';

  /* ---------- storage (always guarded) ---------- */
  function load(k, d) { try { var s = localStorage.getItem(k); return s ? JSON.parse(s) : d; } catch (e) { return d; } }
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* unavailable */ } }

  var prefs = Object.assign({ lang: 'uz', theme: 'dark', mode: 'study', timer: 0, shuffle: false, pool: 'all', count: 20, topics: [] }, load('ip_prefs', {}));
  var hist = load('ip_hist', []);
  var wrong = load('ip_wrong', {});
  var bm = load('ip_bm', {});
  var sess = load('ip_session', null);

  var CFG = null, BANKS = {}, QMAP = {}, EXAMS = {};
  var view = 'home', examId = null, confirmFinish = false, navOpen = false, subOut = '', subMsg = '', subOk = '', authUser = null, sending = false;
  var app = document.getElementById('app');

  /* ---------- text ---------- */
  var UI = {
    sub: ['неофициально · School 21', 'norasmiy · School 21'],
    heroT: ['Подготовка к экзаменам School 21', 'School 21 imtihonlariga tayyorgarlik'],
    heroP: ['Выберите направление, тренируйтесь на вопросах, которые студенты запомнили с экзамена, и проверьте себя в режиме экзамена с таймером.', 'Yo\'nalishni tanlang, talabalar imtihondan eslab qolgan savollarda mashq qiling va taymerli imtihon rejimida o\'zingizni sinang.'],
    tracks: ['Направления', 'Yo\'nalishlar'], soon: ['Скоро', 'Tez orada'], open: ['Открыть', 'Ochish'],
    home: ['На главную', 'Bosh sahifa'], theme: ['Тема', 'Mavzu (rang)'],
    total: ['вопросов в базе', 'ta savol bazada'],
    srcExam: ['С экзамена', 'Imtihondan'], srcSim: ['Похожие', 'O\'xshash'],
    srcExamL: ['с экзамена', 'imtihondan'], srcSimL: ['похожих', 'o\'xshash'],
    practice: ['практика', 'amaliy'], theory: ['теория', 'nazariya'],
    mode: ['Режим', 'Rejim'], study: ['Обучение', 'O\'rganish'], exam: ['Экзамен', 'Imtihon'],
    studyD: ['Ответ и объяснение сразу после выбора. Можно выбрать темы и сохранять вопросы.', 'Variant tanlanishi bilan javob va izoh chiqadi. Mavzularni tanlash va savollarni saqlash mumkin.'],
    examD: ['Случайные вопросы, ответы можно менять, результат — только в конце.', 'Tasodifiy savollar, javoblarni o\'zgartirish mumkin, natija faqat oxirida.'],
    timer: ['Таймер', 'Taymer'], h1: ['1 час', '1 soat'], h15: ['1,5 часа', '1,5 soat'], h2: ['2 часа', '2 soat'], none: ['Без таймера', 'Vaqtsiz'],
    timerD: ['По окончании времени тест завершится сам.', 'Vaqt tugasa, test o\'zi yakunlanadi.'], timerN: ['Время только отсчитывается.', 'Vaqt faqat hisoblanadi.'],
    shuffleL: ['Порядок', 'Tartib'], shuffle: ['Перемешать вопросы и ответы', 'Savol va javoblarni aralashtirish'], shuffleD: ['Позиции ответов меняются.', 'Javoblar joyi almashadi.'],
    pool: ['Источник вопросов', 'Savollar manbasi'], pAll: ['Все', 'Hammasi'], pExam: ['С экзамена', 'Imtihondan'], pSim: ['Похожие', 'O\'xshash'],
    poolAll: ['Вопросы с экзамена и похожие учебные вопросы.', 'Imtihondan eslab qolingan va ularga o\'xshash mashq savollari.'],
    poolExam: ['Только вопросы, которые студенты встретили на экзамене.', 'Faqat talabalar imtihonda uchratgan savollar.'],
    poolSim: ['Учебные вопросы этого типа, написанные нами. Это не реальные экзаменационные вопросы.', 'Shu turdagi, biz yozgan mashq savollari. Bular haqiqiy imtihon savollari emas.'],
    count: ['Сколько вопросов', 'Nechta savol'], all: ['Все', 'Hammasi'],
    topics: ['Темы', 'Mavzular'], topicsD: ['Ничего не выбрано — берутся все темы.', 'Hech narsa tanlanmasa, barcha mavzular olinadi.'],
    start: ['Начать', 'Boshlash'], resume: ['Продолжить', 'Davom ettirish'], seeLast: ['Открыть результат', 'Natijani ochish'],
    unfinished: ['Есть незавершённый тест', 'Tugallanmagan test bor'], lastRes: ['Последний тест завершён', 'Oxirgi test yakunlangan'],
    selected: ['Выбрано вопросов', 'Tanlangan savollar'], none0: ['Нет вопросов по выбранным условиям.', 'Tanlangan shartlar bo\'yicha savol yo\'q.'],
    mis: ['Работа над ошибками', 'Xatolar ustida ishlash'], misP: ['Вопросы, на которые вы ответили неверно. Верный ответ убирает вопрос из списка.', 'Noto\'g\'ri javob bergan savollaringiz. To\'g\'ri javob savolni ro\'yxatdan olib tashlaydi.'], misNone: ['Пока нет ошибок.', 'Hozircha xato yo\'q.'],
    bmT: ['Сохранённые', 'Belgilanganlar'], bmP: ['Вопросы, которые вы отметили, чтобы вернуться к ним позже.', 'Keyin qaytish uchun belgilagan savollaringiz.'], bmNone: ['Отмечайте вопросы кнопкой «Сохранить» во время теста.', 'Test paytida «Saqlash» tugmasi bilan savollarni belgilang.'],
    best: ['Лучший результат (экзамен)', 'Eng yaxshi natija (imtihon)'], never: ['ещё не проходили', 'hali topshirilmagan'],
    histT: ['История попыток', 'Urinishlar tarixi'], histNone: ['Здесь появятся ваши результаты.', 'Natijalaringiz shu yerda paydo bo\'ladi.'],
    thDate: ['Дата', 'Sana'], thKind: ['Тип', 'Tur'], thScore: ['Баллы', 'Ball'], thTime: ['Время', 'Vaqt'],
    kExam: ['Экзамен', 'Imtihon'], kStudy: ['Обучение', 'O\'rganish'], kMis: ['Ошибки', 'Xatolar'], kBm: ['Сохранённые', 'Belgilanganlar'],
    submitT: ['Предложить вопрос', 'Savol yuborish'], submitP: ['Запомнили вопрос с экзамена? Отправьте его. Мы проверим и добавим в базу.', 'Imtihondan savol eslab qoldingizmi? Yuboring, tekshirib bazaga qo\'shamiz.'],
    q: ['Вопрос', 'Savol'], finish: ['Завершить', 'Tugatish'], prev: ['Назад', 'Orqaga'], next: ['Далее', 'Keyingi'], toRes: ['К результатам', 'Natijalarga'],
    save: ['Сохранить', 'Saqlash'], saved: ['Сохранено', 'Saqlangan'],
    ok: ['Верно!', 'To\'g\'ri!'], bad: ['Неверно', 'Noto\'g\'ri'], miss: ['Без ответа', 'Javobsiz'], corr: ['Правильный ответ', 'To\'g\'ri javob'], expl: ['Объяснение', 'Izoh'],
    typeP: ['Практика', 'Amaliy'], typeT: ['Теория', 'Nazariy'], diff: ['Сложность', 'Qiyinlik'], d1: ['легко', 'oson'], d2: ['средне', 'o\'rtacha'], d3: ['сложно', 'qiyin'],
    tables: ['Таблицы', 'Jadvallar'], keys: ['Клавиши: 1–4 — выбор ответа, ← → — переход между вопросами', 'Tugmalar: 1–4 — javob tanlash, ← → — savollar orasida o\'tish'],
    map: ['Карта вопросов', 'Savollar xaritasi'], mapShort: ['Вопросы', 'Savollar'],
    lAns: ['отвечено', 'javob berilgan'], lBm: ['сохранено', 'saqlangan'], lOk: ['верно', 'to\'g\'ri'], lBad: ['неверно', 'noto\'g\'ri'],
    confT: ['Завершить тест?', 'Testni tugatasizmi?'], conf0: ['Вы ответили на все вопросы.', 'Barcha savollarga javob berdingiz.'], confBack: ['Вернуться к тесту', 'Testga qaytish'],
    spent: ['Затрачено', 'Sarflangan vaqt'], timeUp: ['Время вышло', 'Vaqt tugadi'], byType: ['По типам', 'Turlar bo\'yicha'], byTopic: ['По темам, слабые сверху', 'Mavzular bo\'yicha, zaiflari tepada'],
    reviewAll: ['Просмотреть ответы', 'Javoblarni ko\'rib chiqish'], reviewWrong: ['Разобрать ошибки', 'Xatolarni ko\'rib chiqish'], retryWrong: ['Пройти ошибки заново', 'Xatolar ustida qayta ishlash'],
    again: ['Пройти заново', 'Qayta topshirish'], backRes: ['К результатам', 'Natijalarga qaytish'], review: ['Просмотр', 'Ko\'rib chiqish'], back: ['К экзамену', 'Imtihonga'],
    fType: ['Тип вопроса', 'Savol turi'], fText: ['Текст вопроса', 'Savol matni'], fCode: ['SQL-код (если есть)', 'SQL kod (bo\'lsa)'], fTables: ['Таблицы (текстом, если есть)', 'Jadvallar (matn ko\'rinishida, bo\'lsa)'],
    fOpts: ['Варианты ответа (отметьте верный)', 'Javob variantlari (to\'g\'risini belgilang)'], fExpl: ['Объяснение (по желанию)', 'Izoh (ixtiyoriy)'], fSeen: ['Этот вопрос был на экзамене', 'Bu savol imtihonda tushgan'],
    fMake: ['Подготовить сообщение', 'Xabarni tayyorlash'], fCopy: ['Копировать', 'Nusxalash'], fCopied: ['Скопировано', 'Nusxalandi'], fNeed: ['Заполните текст вопроса и минимум два варианта.', 'Savol matni va kamida ikkita variantni to\'ldiring.'],
    fSend: ['Отправьте этот текст боту или автору:', 'Shu matnni botga yoki muallifga yuboring:'], fNoBot: ['Бот пока не подключён: скопируйте текст и отправьте автору.', 'Bot hali ulanmagan: matnni nusxalab, muallifga yuboring.'], fOpenBot: ['Открыть бота в Telegram', 'Telegramda botni ochish'],
    loginNeed: ['Чтобы отправить вопрос, войдите. Решать тесты можно без входа.', 'Savol yuborish uchun kiring. Testlarni yechish uchun kirish shart emas.'],
    google: ['Войти через Google', 'Google bilan kirish'], github: ['Войти через GitHub', 'GitHub bilan kirish'], signedAs: ['Вы вошли как', 'Siz kirgansiz'], signOut: ['Выйти', 'Chiqish'],
    fAuthor: ['Ваше имя (по желанию)', 'Ismingiz (ixtiyoriy)'], fShowName: ['Показать моё имя рядом с вопросом', 'Ismim savol yonida ko\'rsatilsin'],
    fSendBtn: ['Отправить на проверку', 'Tekshiruvga yuborish'], fNeed4: ['Заполните текст вопроса (минимум 5 символов) и все четыре варианта.', 'Savol matnini (kamida 5 belgi) va to\'rtala variantni to\'ldiring.'],
    fSent: ['Спасибо! Вопрос отправлен и появится на сайте после проверки.', 'Rahmat! Savol yuborildi va tekshiruvdan keyin saytda chiqadi.'],
    eLimit: ['Дневной лимит исчерпан (5 вопросов в сутки). Попробуйте завтра.', 'Kunlik limit tugadi (kuniga 5 ta savol). Ertaga urinib ko\'ring.'],
    eBlocked: ['Отправка вопросов для этого аккаунта отключена.', 'Bu akkaunt uchun savol yuborish o\'chirilgan.'],
    eInvalid: ['Проверьте длину текстов: вопрос до 2000 символов, код и таблицы до 4000.', 'Matn uzunligini tekshiring: savol 2000 belgigacha, kod va jadvallar 4000 gacha.'],
    eGeneric: ['Не удалось отправить. Попробуйте позже.', 'Yuborib bo\'lmadi. Keyinroq urinib ko\'ring.'], author: ['Автор', 'Muallif'], sending: ['Отправляем…', 'Yuborilmoqda…'],
    note: ['Это неофициальный учебный проект студентов, он не связан со School 21. Вопросы собраны по памяти студентов и могут содержать неточности. Ответы на практические вопросы проверены в PostgreSQL.', 'Bu talabalarning norasmiy o\'quv loyihasi, School 21 bilan bog\'liq emas. Savollar talabalar xotirasi asosida yig\'ilgan va noaniqliklar bo\'lishi mumkin. Amaliy savollar javoblari PostgreSQLda tekshirilgan.'],
    loadErr: ['Не удалось загрузить данные. Откройте сайт через сервер (GitHub Pages или локальный сервер), а не как файл.', 'Ma\'lumotlarni yuklab bo\'lmadi. Saytni fayl sifatida emas, server orqali (GitHub Pages yoki lokal server) oching.']
  };
  function t(k) { var v = UI[k]; return v ? v[prefs.lang === 'ru' ? 0 : 1] : k; }
  function L(x) { return Array.isArray(x) ? x[prefs.lang === 'ru' ? 0 : 1] : x; }
  function nQ(n) { return prefs.lang === 'ru' ? n + ' вопросов' : n + ' ta savol'; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var x = a[i]; a[i] = a[j]; a[j] = x; } return a; }
  function fmtTime(s) { s = Math.max(0, Math.round(s)); var h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), ss = s % 60; return (h ? h + ':' + String(m).padStart(2, '0') : String(m)) + ':' + String(ss).padStart(2, '0'); }
  function fmtDate(ts) { var d = new Date(ts); return String(d.getDate()).padStart(2, '0') + '.' + String(d.getMonth() + 1).padStart(2, '0') + ' ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); }
  function sj(a, b) { return a.concat(b); }

  /* ---------- SQL highlighter ---------- */
  var KW = {}; ('SELECT FROM WHERE GROUP BY ORDER HAVING LIMIT OFFSET JOIN INNER LEFT RIGHT FULL OUTER CROSS ON AS AND OR NOT IN EXISTS BETWEEN LIKE IS NULL CASE WHEN THEN ELSE END DISTINCT UNION ALL INTERSECT EXCEPT WITH RECURSIVE OVER PARTITION ASC DESC NULLS FIRST LAST VALUES INSERT INTO UPDATE SET DELETE CREATE TABLE VIEW INDEX UNIQUE ALTER ADD CONSTRAINT PRIMARY KEY FOREIGN REFERENCES CHECK BEGIN COMMIT ROLLBACK SAVEPOINT TO TRUE FALSE DEFAULT USING').split(' ').forEach(function (w) { KW[w] = 1; });
  var TY = {}; 'INT INTEGER VARCHAR TEXT NUMERIC BOOLEAN DATE BIGINT'.split(' ').forEach(function (w) { TY[w] = 1; });
  var NAMEPREV = { AS: 1, RECURSIVE: 1, TABLE: 1, VIEW: 1, INTO: 1 };
  function hl(code) {
    var re = /(--[^\n]*)|('(?:[^']|'')*')|(\d+(?:\.\d+)?)|([\p{L}_][\p{L}\p{N}_]*)|(::|<>|<=|>=|!=|\|\||[=<>+\-*\/%])|([\s\S])/gu;
    var out = '', m, prevW = '', prevOp = false;
    while ((m = re.exec(code)) !== null) {
      if (m[1]) out += '<span class="c">' + esc(m[1]) + '</span>';
      else if (m[2]) { out += '<span class="s">' + esc(m[2]) + '</span>'; prevOp = false; }
      else if (m[3]) { out += '<span class="n">' + m[3] + '</span>'; prevOp = false; }
      else if (m[4]) {
        var w = m[4], U = w.toUpperCase(), cls = '';
        if (prevOp && TY[U]) cls = 't'; else if (KW[U]) cls = 'k'; else if (TY[U]) cls = 't';
        else if (!NAMEPREV[prevW] && /^\s*\(/.test(code.slice(re.lastIndex))) cls = 'f';
        out += cls ? '<span class="' + cls + '">' + esc(w) + '</span>' : esc(w);
        prevW = U; prevOp = false;
      } else if (m[5]) { out += '<span class="o">' + esc(m[5]) + '</span>'; prevOp = m[5] === '::'; }
      else out += esc(m[6]);
    }
    return out;
  }

  /* ---------- helpers over the data ---------- */
  function exam() { return EXAMS[examId]; }
  function bank() { return BANKS[examId]; }
  function topicName(k) { var tp = (BANKS[sess && view !== 'prep' ? sess.exam : examId] || bank() || {}).topics; return tp && tp[k] ? L(tp[k]) : k; }
  function poolOk(q, pool) { return pool === 'all' || (pool === 'exam' ? q.src === 'exam' : q.src === 'similar'); }
  function stats(b) {
    var s = { n: b.questions.length, exam: 0, sim: 0, p: 0, t: 0 };
    b.questions.forEach(function (q) { if (q.src === 'exam') s.exam++; else s.sim++; if (q.p) s.p++; else s.t++; });
    return s;
  }
  function countIn(obj, b) { return Object.keys(obj).filter(function (id) { return QMAP[id] && QMAP[id].exam === b.exam; }).length; }
  function studyPool() {
    return bank().questions.filter(function (q) { return poolOk(q, prefs.pool) && (!prefs.topics.length || prefs.topics.indexOf(q.t) >= 0); });
  }
  function examPick() {
    var mix = exam().mix, pool = bank().questions.filter(function (q) { return poolOk(q, prefs.pool); });
    var P = shuffle(pool.filter(function (q) { return q.p; })).slice(0, mix.practice);
    var T = shuffle(pool.filter(function (q) { return !q.p; })).slice(0, mix.theory);
    var r = [], i; for (i = 0; i < Math.max(P.length, T.length); i++) { if (P[i]) r.push(P[i]); if (T[i]) r.push(T[i]); }
    return r;
  }
  function bestExam(b) { var best = null; hist.forEach(function (h) { if (h.exam === b.exam && h.kind === 'exam' && (!best || h.score / h.total > best.score / best.total)) best = h; }); return best; }

  /* ---------- session logic ---------- */
  function scoreOf(s) { var c = 0; s.ids.forEach(function (id, i) { if (s.ans[i] === QMAP[id].a) c++; }); return c; }
  function persist() { save('ip_session', sess); }
  function newSession(kind, ids) {
    if (!ids.length) return;
    var timed = kind === 'exam' || (kind === 'study' && prefs.timer);
    var secs = timed ? prefs.timer * 3600 : 0, now = Date.now();
    if (kind !== 'exam' && kind !== 'study') secs = 0;
    sess = { exam: examId, kind: kind, mode: kind === 'exam' ? 'exam' : 'study', timer: secs, ids: ids,
      ord: ids.map(function () { return prefs.shuffle ? shuffle([0, 1, 2, 3]) : [0, 1, 2, 3]; }),
      ans: ids.map(function () { return null; }), idx: 0, start: now, deadline: secs ? now + secs * 1000 : 0, finished: false, end: 0, timeUp: false };
    persist(); view = 'quiz'; confirmFinish = false; navOpen = false; render(); window.scrollTo(0, 0);
  }
  function startKind(kind) {
    var ids;
    if (kind === 'exam') { ids = examPick().map(function (q) { return q.id; }); if (prefs.shuffle) ids = shuffle(ids); }
    else if (kind === 'study') {
      var pool = studyPool();
      if (prefs.count && prefs.count < pool.length) pool = shuffle(pool).slice(0, prefs.count);
      else if (prefs.shuffle) pool = shuffle(pool);
      ids = pool.map(function (q) { return q.id; });
    }
    else if (kind === 'mistakes') ids = shuffle(Object.keys(wrong).filter(function (id) { return QMAP[id] && QMAP[id].exam === examId; })).slice(0, 30);
    else ids = bank().questions.filter(function (q) { return bm[q.id]; }).map(function (q) { return q.id; });
    newSession(kind, ids);
  }
  function finish(timeUp) {
    if (!sess || sess.finished) return;
    sess.finished = true; sess.end = Date.now(); sess.timeUp = !!timeUp; sess.idx = 0;
    sess.ids.forEach(function (id, i) { var a = sess.ans[i]; if (a === null) return; if (a === QMAP[id].a) delete wrong[id]; else wrong[id] = 1; });
    hist.unshift({ ts: sess.end, exam: sess.exam, kind: sess.kind, score: scoreOf(sess), total: sess.ids.length, secs: Math.round((sess.end - sess.start) / 1000), up: !!timeUp });
    hist = hist.slice(0, 60); save('ip_hist', hist); save('ip_wrong', wrong); persist();
    confirmFinish = false; view = 'result'; render(); window.scrollTo(0, 0);
  }
  function remaining() { return sess && sess.deadline ? Math.round((sess.deadline - Date.now()) / 1000) : null; }

  /* ---------- rendering ---------- */
  var VC = { exam: 'var(--accent)', study: 'var(--blue)', mistakes: 'var(--warn)', bookmarks: 'var(--violet)' };
  function kindName(k) { return t(k === 'exam' ? 'kExam' : k === 'study' ? 'kStudy' : k === 'mistakes' ? 'kMis' : 'kBm'); }
  function header() {
    var h = '<header class="top" id="top"><div class="wrap"><div class="top-row">' +
      '<button class="brand" data-a="home" aria-label="' + esc(t('home')) + '"><span class="mark">IT</span><span class="brand-name">Imtihon<br>Tayyorlov</span></button>' +
      '<span class="spacer"></span>' +
      '<div class="seg" role="group" aria-label="Til / Язык"><button data-a="lang" data-i="ru" aria-pressed="' + (prefs.lang === 'ru') + '">RU</button><button data-a="lang" data-i="uz" aria-pressed="' + (prefs.lang === 'uz') + '">UZ</button></div>' +
      '<button class="icon-btn" data-a="theme" aria-label="' + esc(t('theme')) + '" title="' + esc(t('theme')) + '"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg></button></div>';
    if (view === 'quiz' && sess) {
      var n = sess.ids.length, ans = sess.ans.filter(function (a) { return a !== null; }).length;
      h += '<div class="quizbar" style="--vc:' + VC[sess.kind] + '"><span class="chip vc">' + esc(L(EXAMS[sess.exam].short || EXAMS[sess.exam].name).split(' ·')[0]) + '</span><span class="chip">' + esc(sess.finished ? t('review') : kindName(sess.kind)) + '</span>' +
        '<div class="progress"><span class="num" style="font-size:.9rem;color:var(--fg-2)">' + (sess.idx + 1) + ' / ' + n + '</span><div class="bar"><i style="width:' + (ans / n * 100) + '%"></i></div></div>';
      if (sess.finished) h += '<button class="btn sm" data-a="toRes">' + esc(t('backRes')) + '</button>';
      else h += '<span class="timer" id="timer">0:00</span><button class="btn sm primary" data-a="finishAsk">' + esc(t('finish')) + '</button>';
      h += '</div>';
    }
    return h + '</div></header>';
  }

  function renderHome() {
    var h = '<div class="wrap"><section class="hero"><h1>' + esc(t('heroT')) + '</h1><p>' + esc(t('heroP')) + '</p><div class="stairs" aria-hidden="true"><i></i><i></i><i></i><i></i></div></section>';
    h += banner();
    h += '<section class="tgrid" aria-label="' + esc(t('tracks')) + '">';
    CFG.tracks.forEach(function (tr) {
      var soon = tr.status !== 'active';
      h += '<article class="tcard' + (soon ? ' soon' : '') + '" style="--vc:' + (soon ? 'var(--line)' : 'var(--accent)') + '"><h2>' + esc(L(tr.name)) + (soon ? ' <span class="chip">' + esc(t('soon')) + '</span>' : '') + '</h2><p>' + esc(L(tr.desc)) + '</p>';
      if (!soon) {
        h += '<div class="exams">';
        tr.exams.forEach(function (ex) { var b = BANKS[ex.id]; h += '<button class="btn" data-a="openExam" data-i="' + ex.id + '"><span>' + esc(L(ex.name)) + '</span><span class="num">' + (b ? nQ(b.questions.length) : '') + ' →</span></button>'; });
        h += '</div>';
      }
      h += '</article>';
    });
    h += '</section><p class="note">' + esc(t('note')) + '</p></div>';
    return h;
  }
  function banner() {
    if (!sess || !EXAMS[sess.exam]) return '';
    return '<div class="banner"><span><b>' + esc(sess.finished ? t('lastRes') : t('unfinished')) + '</b> · ' + esc(L(EXAMS[sess.exam].name).split(' ·')[0]) + ' · ' + esc(kindName(sess.kind)) + ' · ' + sess.ans.filter(function (a) { return a !== null; }).length + '/' + sess.ids.length + '</span><span class="spacer"></span>' +
      '<button class="btn sm primary" data-a="' + (sess.finished ? 'toRes' : 'resume') + '">' + esc(sess.finished ? t('seeLast') : t('resume')) + '</button></div>';
  }
  function seg(action, cur, items) {
    return '<div class="seg" role="group">' + items.map(function (o) { return '<button type="button" data-a="' + action + '" data-i="' + o[0] + '" aria-pressed="' + (String(cur) === String(o[0])) + '">' + esc(o[1]) + '</button>'; }).join('') + '</div>';
  }
  function renderPrep() {
    var ex = exam(), b = bank(), s = stats(b), study = prefs.mode === 'study';
    var h = '<div class="wrap"><nav class="crumbs" aria-label="breadcrumb"><button data-a="home">' + esc(t('home')) + '</button><span>›</span><b>' + esc(L(ex.name)) + '</b></nav>';
    h += '<div class="statline"><span class="total num">' + s.n + '<small>' + esc(t('total')) + '</small></span><span class="chip src-exam num">' + s.exam + ' ' + esc(t('srcExamL')) + '</span><span class="chip src-sim num">' + s.sim + ' ' + esc(t('srcSimL')) + '</span><span class="chip num">' + s.p + ' ' + esc(t('practice')) + '</span><span class="chip num">' + s.t + ' ' + esc(t('theory')) + '</span></div>';
    h += banner();
    var pool = studyPool(), mixP = Math.min(ex.mix.practice, b.questions.filter(function (q) { return q.p && poolOk(q, prefs.pool); }).length), mixT = Math.min(ex.mix.theory, b.questions.filter(function (q) { return !q.p && poolOk(q, prefs.pool); }).length);
    var poolHint = prefs.pool === 'exam' ? t('poolExam') : prefs.pool === 'similar' ? t('poolSim') : t('poolAll');
    h += '<section class="settings wide">' +
      '<div><p class="label">' + esc(t('mode')) + '</p>' + seg('mode', prefs.mode, [['study', t('study')], ['exam', t('exam')]]) + '<p class="hint">' + esc(study ? t('studyD') : t('examD')) + '</p></div>' +
      '<div><p class="label">' + esc(t('pool')) + '</p>' + seg('pool', prefs.pool, [['all', t('pAll')], ['exam', t('pExam')], ['similar', t('pSim')]]) + '<p class="hint">' + esc(poolHint) + '</p></div>' +
      '<div><p class="label">' + esc(t('timer')) + '</p>' + seg('timer', prefs.timer, [[1, t('h1')], [1.5, t('h15')], [2, t('h2')], [0, t('none')]]) + '<p class="hint">' + esc(prefs.timer ? t('timerD') : t('timerN')) + '</p></div>' +
      '<div><p class="label">' + esc(t('shuffleL')) + '</p><button class="switch" data-a="shuffle" aria-pressed="' + prefs.shuffle + '"><span class="track"></span><span>' + esc(t('shuffle')) + '</span></button><p class="hint">' + esc(t('shuffleD')) + '</p></div>';
    if (study) {
      h += '<div><p class="label">' + esc(t('count')) + '</p>' + seg('count', prefs.count, [[10, '10'], [20, '20'], [30, '30'], [0, t('all')]]) + '</div>';
      var tc = {}; b.questions.forEach(function (q) { if (poolOk(q, prefs.pool)) tc[q.t] = (tc[q.t] || 0) + 1; });
      h += '<div class="span"><p class="label">' + esc(t('topics')) + '</p><div class="tchips">' + Object.keys(tc).map(function (k) { return '<button class="tchip" data-a="topic" data-i="' + k + '" aria-pressed="' + (prefs.topics.indexOf(k) >= 0) + '">' + esc(L(b.topics[k])) + '<small class="num">' + tc[k] + '</small></button>'; }).join('') + '</div><p class="hint" style="min-height:0">' + esc(t('topicsD')) + '</p></div>';
    }
    h += '<div class="span row" style="align-items:center">';
    if (study) {
      var shown = prefs.count && prefs.count < pool.length ? prefs.count : pool.length;
      h += '<button class="btn primary" data-a="startKind" data-i="study"' + (pool.length ? '' : ' disabled') + '>' + esc(t('start')) + '</button><span class="best">' + esc(pool.length ? t('selected') + ': ' : t('none0')) + (pool.length ? '<b class="num">' + shown + '</b>' : '') + '</span>';
    } else {
      var tot = mixP + mixT;
      h += '<button class="btn primary" data-a="startKind" data-i="exam"' + (tot ? '' : ' disabled') + '>' + esc(t('start')) + '</button><span class="best"><b class="num">' + mixP + '</b> ' + esc(t('practice')) + ' + <b class="num">' + mixT + '</b> ' + esc(t('theory')) + ' = <b class="num">' + tot + '</b>';
      var be = bestExam(b); h += ' · ' + esc(t('best')) + ': ' + (be ? '<b class="num">' + be.score + '/' + be.total + '</b>' : esc(t('never'))) + '</span>';
    }
    h += '</div></section>';
    var wn = countIn(wrong, b), bn = countIn(bm, b);
    h += '<section class="extras"><div class="panel"><h3>' + esc(t('mis')) + (wn ? ' · <span class="num">' + wn + '</span>' : '') + '</h3><p>' + esc(wn ? t('misP') : t('misNone')) + '</p><button class="btn" data-a="startKind" data-i="mistakes"' + (wn ? '' : ' disabled') + '>' + esc(t('start')) + '</button></div>' +
      '<div class="panel"><h3>' + esc(t('bmT')) + (bn ? ' · <span class="num">' + bn + '</span>' : '') + '</h3><p>' + esc(bn ? t('bmP') : t('bmNone')) + '</p><button class="btn" data-a="startKind" data-i="bookmarks"' + (bn ? '' : ' disabled') + '>' + esc(t('start')) + '</button></div>' +
      '<div class="panel"><h3>' + esc(t('submitT')) + '</h3><p>' + esc(t('submitP')) + '</p><button class="btn" data-a="submit">' + esc(t('submitT')) + '</button></div>';
    var hh = hist.filter(function (r) { return r.exam === ex.id; });
    h += '<div class="panel"><h3>' + esc(t('histT')) + '</h3>';
    if (!hh.length) h += '<p>' + esc(t('histNone')) + '</p>';
    else {
      h += '<div class="scroll-x"><table class="hist"><thead><tr><th>' + esc(t('thDate')) + '</th><th>' + esc(t('thKind')) + '</th><th>' + esc(t('thScore')) + '</th><th>' + esc(t('thTime')) + '</th></tr></thead><tbody>';
      hh.slice(0, 6).forEach(function (r) { h += '<tr class="num"><td>' + fmtDate(r.ts) + '</td><td>' + esc(kindName(r.kind)) + '</td><td><b>' + r.score + '/' + r.total + '</b></td><td>' + fmtTime(r.secs) + '</td></tr>'; });
      h += '</tbody></table></div>';
    }
    return h + '</div></section><p class="note">' + esc(t('note')) + '</p></div>';
  }

  function tableHtml(tb) {
    var h = '<div class="tbl"><div class="tbl-name">' + esc(tb.n) + '</div><div class="tbl-scroll"><table><thead><tr>' + tb.c.map(function (c) { return '<th>' + esc(c) + '</th>'; }).join('') + '</tr></thead><tbody>';
    tb.r.forEach(function (r) { h += '<tr>' + r.map(function (v) { return v === null ? '<td class="nul">NULL</td>' : typeof v === 'number' ? '<td class="num">' + v + '</td>' : '<td>' + esc(v) + '</td>'; }).join('') + '</tr>'; });
    return h + '</tbody></table></div></div>';
  }
  function navHtml() {
    var review = sess.finished, study = sess.mode === 'study';
    var h = '<button class="btn navtoggle" data-a="navtoggle" aria-expanded="' + navOpen + '"><span>' + esc(t('mapShort')) + '</span><span aria-hidden="true">' + (navOpen ? '−' : '+') + '</span></button>';
    h += '<div class="navbox' + (navOpen ? '' : ' closed') + '"><p class="label">' + esc(t('map')) + '</p><div class="grid">';
    sess.ids.forEach(function (id, i) {
      var a = sess.ans[i], q = QMAP[id], cls = 'gq';
      if (a !== null) cls += (review || study) ? (a === q.a ? ' ok' : ' bad') : ' ans'; else if (review) cls += ' bad';
      if (bm[id]) cls += ' bm'; if (i === sess.idx) cls += ' cur';
      h += '<button class="' + cls + '" data-a="go" data-i="' + i + '" aria-label="' + esc(t('q')) + ' ' + (i + 1) + '"' + (i === sess.idx ? ' aria-current="true"' : '') + '>' + (i + 1) + '</button>';
    });
    return h + '</div><div class="legend">' + (review || study ? '<span><i class="o"></i>' + esc(t('lOk')) + '</span><span><i class="b"></i>' + esc(t('lBad')) + '</span>' : '<span><i class="a"></i>' + esc(t('lAns')) + '</span>') + '<span><i class="f"></i>' + esc(t('lBm')) + '</span></div></div>';
  }
  function renderQuiz() {
    var i = sess.idx, q = QMAP[sess.ids[i]], review = sess.finished, study = sess.mode === 'study';
    var chosen = sess.ans[i], reveal = review || (study && chosen !== null), ord = sess.ord[i], letters = 'ABCD', bs = EXAMS[sess.exam] && BANKS[sess.exam];
    var h = '<div class="wrap quiz" style="--vc:' + VC[sess.kind] + '"><div><article class="qcard">';
    h += '<div class="qmeta"><span class="qno">' + esc(t('q')) + ' ' + (i + 1) + '</span><span class="chip ' + (q.src === 'exam' ? 'src-exam' : 'src-sim') + '">' + esc(q.src === 'exam' ? t('srcExam') : t('srcSim')) + '</span><span class="chip">' + esc(q.p ? t('typeP') : t('typeT')) + '</span><span class="chip">' + esc(bs && bs.topics[q.t] ? L(bs.topics[q.t]) : q.t) + '</span>' +
      (q.author ? '<span class="chip">' + esc(t('author')) + ': ' + esc(q.author) + '</span>' : '') + '<span class="chip" title="' + esc(t('diff')) + '"><span class="dots" aria-hidden="true"><i class="' + (q.d >= 1 ? 'on' : '') + '"></i><i class="' + (q.d >= 2 ? 'on' : '') + '"></i><i class="' + (q.d >= 3 ? 'on' : '') + '"></i></span>' + esc(t('d' + q.d)) + '</span></div>';
    h += '<p class="qtext">' + esc(L(q.q)) + '</p>';
    if (q.code) h += '<pre class="code" aria-label="SQL"><code>' + hl(q.code) + '</code></pre>';
    if (q.tables && q.tables.length) h += '<div class="tables" role="group" aria-label="' + esc(t('tables')) + '">' + q.tables.map(tableHtml).join('') + '</div>';
    h += '<div class="opts" role="radiogroup" aria-label="' + esc(t('q')) + ' ' + (i + 1) + '">';
    ord.forEach(function (orig, pos) {
      var raw = q.o[orig], cls = 'opt', mk = '', mono = q.p || (!Array.isArray(raw) && /[A-Z]{3,}/.test(raw));
      if (reveal) { cls += ' lock'; if (orig === q.a) { cls += ' ok'; mk = '✓'; } else if (orig === chosen) { cls += ' bad'; mk = '✗'; } else cls += ' dim'; }
      else if (orig === chosen) cls += ' sel';
      h += '<button class="' + cls + '" role="radio" aria-checked="' + (orig === chosen) + '" data-a="pick" data-i="' + orig + '"' + (reveal ? ' aria-disabled="true"' : '') + '><span class="ltr">' + letters[pos] + '</span><span class="txt' + (mono ? ' mono' : '') + '">' + esc(L(raw)) + '</span><span class="mk" aria-hidden="true">' + mk + '</span></button>';
    });
    h += '</div>';
    if (reveal) {
      var okk = chosen === q.a, cpos = ord.indexOf(q.a);
      h += '<div class="fb ' + (chosen === null ? 'miss' : okk ? 'ok' : 'bad') + '" role="status"><h4>' + esc(chosen === null ? t('miss') : okk ? t('ok') : t('bad')) + '</h4>';
      if (!okk) h += '<p class="corr">' + esc(t('corr')) + ': <b>' + letters[cpos] + '</b> · ' + esc(L(q.o[q.a])) + '</p>';
      h += '<div class="expl-l">' + esc(t('expl')) + '</div><p class="expl">' + esc(L(q.e)) + '</p></div>';
    }
    var last = i === sess.ids.length - 1;
    h += '<div class="qactions"><button class="btn" data-a="prev"' + (i === 0 ? ' disabled' : '') + '>← ' + esc(t('prev')) + '</button><button class="btn bmbtn" data-a="bookmark" aria-pressed="' + !!bm[q.id] + '">' + esc(bm[q.id] ? t('saved') : t('save')) + '</button><span class="grow"></span>';
    if (last) h += review ? '<button class="btn primary" data-a="toRes">' + esc(t('toRes')) + '</button>' : '<button class="btn primary" data-a="finishAsk">' + esc(t('finish')) + '</button>';
    else h += '<button class="btn primary" data-a="next">' + esc(t('next')) + ' →</button>';
    h += '</div><p class="hintkeys">' + esc(t('keys')) + '</p></article></div><aside class="side">' + navHtml() + '</aside></div>';
    if (confirmFinish) {
      var un = sess.ans.filter(function (a) { return a === null; }).length;
      h += '<div class="overlay" role="dialog" aria-modal="true" aria-labelledby="dlgT"><div class="dialog"><h3 id="dlgT">' + esc(t('confT')) + '</h3><p>' + esc(un ? (prefs.lang === 'ru' ? 'Без ответа: ' + un + ' из ' + sess.ids.length + '.' : 'Javobsiz: ' + un + ' ta (jami ' + sess.ids.length + ').') : t('conf0')) + '</p>' +
        '<div class="row"><button class="btn" data-a="finishNo">' + esc(t('confBack')) + '</button><button class="btn primary" data-a="finishYes">' + esc(t('finish')) + '</button></div></div></div>';
    }
    return h;
  }
  function pctClass(p) { return p >= .8 ? '' : p >= .5 ? 'mid' : 'low'; }
  function bar(name, c, n) { var p = n ? c / n : 0; return '<div class="rb"><span class="nm">' + esc(name) + '</span><span class="tr"><i class="' + pctClass(p) + '" style="width:' + Math.round(p * 100) + '%"></i></span><span class="v">' + c + '/' + n + '</span></div>'; }
  function renderResult() {
    var n = sess.ids.length, sc = scoreOf(sess), pct = Math.round(sc / n * 100), secs = Math.round((sess.end - sess.start) / 1000), tp = BANKS[sess.exam].topics;
    var topics = {}, types = { p: [0, 0], t: [0, 0] };
    sess.ids.forEach(function (id, i) { var q = QMAP[id], ok = sess.ans[i] === q.a, e = topics[q.t] || (topics[q.t] = [0, 0]); e[1]++; if (ok) e[0]++; var ty = q.p ? types.p : types.t; ty[1]++; if (ok) ty[0]++; });
    var rows = Object.keys(topics).sort(function (a, b) { var pa = topics[a][0] / topics[a][1], pb = topics[b][0] / topics[b][1]; return pa - pb || topics[b][1] - topics[a][1]; });
    var wc = sess.ids.filter(function (id, i) { return sess.ans[i] !== QMAP[id].a; }).length;
    var h = '<div class="wrap res" style="--vc:' + VC[sess.kind] + '"><section class="score"><div class="big num">' + sc + '<small> / ' + n + '</small></div><div class="facts"><span><b>' + pct + '%</b> · ' + esc(L(EXAMS[sess.exam].name).split(' ·')[0]) + ' · ' + esc(kindName(sess.kind)) + '</span>' +
      '<span>' + esc(t('spent')) + ': <b class="num">' + fmtTime(secs) + '</b>' + (sess.timeUp ? ' · <b style="color:var(--warn)">' + esc(t('timeUp')) + '</b>' : '') + '</span></div></section>';
    h += '<section class="panel"><h3>' + esc(t('byType')) + '</h3><div class="rbars">' + (types.p[1] ? bar(t('typeP'), types.p[0], types.p[1]) : '') + (types.t[1] ? bar(t('typeT'), types.t[0], types.t[1]) : '') + '</div></section>';
    h += '<section class="panel"><h3>' + esc(t('byTopic')) + '</h3><div class="rbars">' + rows.map(function (k) { return bar(L(tp[k] || k), topics[k][0], topics[k][1]); }).join('') + '</div></section>';
    h += '<section class="panel"><h3>' + esc(t('map')) + '</h3><div class="grid">' + sess.ids.map(function (id, i) { var ok = sess.ans[i] === QMAP[id].a; return '<button class="gq ' + (ok ? 'ok' : 'bad') + (bm[id] ? ' bm' : '') + '" data-a="review" data-i="' + i + '" aria-label="' + esc(t('q')) + ' ' + (i + 1) + '">' + (i + 1) + '</button>'; }).join('') + '</div></section>';
    h += '<div class="row"><button class="btn" data-a="review" data-i="0">' + esc(t('reviewAll')) + '</button>' + (wc ? '<button class="btn" data-a="reviewWrong">' + esc(t('reviewWrong')) + '</button><button class="btn primary" data-a="retryWrong">' + esc(t('retryWrong')) + '</button>' : '') +
      '<button class="btn" data-a="again">' + esc(t('again')) + '</button><button class="btn" data-a="backExam">' + esc(t('back')) + '</button><button class="btn" data-a="home">' + esc(t('home')) + '</button></div></div>';
    return h;
  }

  /* ---- submit-a-question form ---- */
  var sub = { type: 'p', seen: true, correct: 0 };
  function userName() { var u = authUser && authUser.user; var m = (u && u.user_metadata) || {}; return m.full_name || m.name || m.user_name || (u && u.email) || ''; }
  function renderSubmit() {
    var ex = exam(), tg = (CFG.site && CFG.site.telegram) || '', online = window.Backend && Backend.enabled();
    var h = '<div class="wrap"><nav class="crumbs"><button data-a="home">' + esc(t('home')) + '</button><span>›</span><button data-a="backExam">' + esc(L(ex.name).split(' ·')[0]) + '</button><span>›</span><b>' + esc(t('submitT')) + '</b></nav>';
    if (online && !authUser) {
      return h + '<div class="form"><p style="margin:0;color:var(--fg-2)">' + esc(t('submitP')) + '</p><p style="margin:0">' + esc(t('loginNeed')) + '</p><div class="row"><button class="btn primary" data-a="signin" data-i="google">' + esc(t('google')) + '</button><button class="btn" data-a="signin" data-i="github">' + esc(t('github')) + '</button></div></div></div>';
    }
    h += '<form class="form" id="subform" autocomplete="off"><p style="margin:0;color:var(--fg-2)">' + esc(t('submitP')) + '</p>';
    if (online) h += '<p class="hint" style="margin:0;min-height:0">' + esc(t('signedAs')) + ': <b>' + esc(userName()) + '</b> · <button type="button" class="linkbtn" data-a="signout">' + esc(t('signOut')) + '</button></p>';
    h += '<div class="field"><span class="lab">' + esc(t('fType')) + '</span>' + seg('stype', sub.type, [['p', t('typeP')], ['t', t('typeT')]]) + '</div>' +
      '<div class="field"><label for="f-text">' + esc(t('fText')) + '</label><textarea id="f-text" name="text" maxlength="2000"></textarea></div>';
    if (sub.type === 'p') h += '<div class="field"><label for="f-code">' + esc(t('fCode')) + '</label><textarea id="f-code" class="mono" name="code" spellcheck="false" maxlength="4000"></textarea></div>' +
      '<div class="field"><label for="f-tables">' + esc(t('fTables')) + '</label><textarea id="f-tables" class="mono" name="tables" spellcheck="false" maxlength="4000" placeholder="Student: id, name&#10;1, Иван&#10;2, Анна"></textarea></div>';
    h += '<div class="field"><span class="lab">' + esc(t('fOpts')) + '</span>';
    'ABCD'.split('').forEach(function (l, i) { h += '<div class="optrow"><span class="ltr">' + l + '</span><input type="text" id="f-o' + i + '" name="o' + i + '" maxlength="300"><input type="radio" name="correct" value="' + i + '" aria-label="' + l + '"' + (sub.correct === i ? ' checked' : '') + '></div>'; });
    h += '</div><div class="field"><label for="f-exp">' + esc(t('fExpl')) + '</label><textarea id="f-exp" name="exp" maxlength="2000"></textarea></div>' +
      '<label class="check"><input type="checkbox" id="f-seen" name="seen"' + (sub.seen ? ' checked' : '') + '> ' + esc(t('fSeen')) + '</label>';
    if (online) h += '<div class="field"><label for="f-author">' + esc(t('fAuthor')) + '</label><input type="text" id="f-author" name="author" maxlength="60"></div><label class="check"><input type="checkbox" id="f-show" name="showname"> ' + esc(t('fShowName')) + '</label>' +
      '<div class="hp" aria-hidden="true"><label>Website<input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>';
    h += '<div class="row"><button type="submit" class="btn primary"' + (sending ? ' disabled' : '') + '>' + esc(sending ? t('sending') : online ? t('fSendBtn') : t('fMake')) + '</button></div>';
    if (subMsg) h += '<p class="hint" style="color:var(--bad);min-height:0">' + esc(subMsg) + '</p>';
    if (subOk) h += '<p class="msg-ok">' + esc(subOk) + '</p>';
    if (subOut && !online) {
      h += '<div class="field"><span class="lab">' + esc(t('fSend')) + '</span><div class="outbox" id="outbox">' + esc(subOut) + '</div></div><div class="row"><button type="button" class="btn" data-a="copyOut">' + esc(t('fCopy')) + '</button>' +
        (tg ? '<a class="btn" href="https://t.me/' + esc(tg) + '" target="_blank" rel="noopener">' + esc(t('fOpenBot')) + '</a>' : '') + '</div>' + (tg ? '' : '<p class="hint" style="min-height:0">' + esc(t('fNoBot')) + '</p>');
    }
    return h + '</form></div>';
  }
  function readForm(f) {
    var v = function (n) { return (f.elements[n] && f.elements[n].value || '').trim(); };
    var c = parseInt((f.querySelector('input[name=correct]:checked') || { value: 0 }).value, 10); sub.correct = c; sub.seen = f.elements.seen.checked;
    return { text: v('text'), code: sub.type === 'p' ? v('code') : '', tables: sub.type === 'p' ? v('tables') : '', options: [0, 1, 2, 3].map(function (i) { return v('o' + i); }), correct: c, explanation: v('exp'), seen: sub.seen, type: sub.type, lang: prefs.lang, author: v('author'), showName: !!(f.elements.showname && f.elements.showname.checked), hp: v('website') };
  }
  function makeSubmission(f) {
    var d = readForm(f), opts = d.options.filter(Boolean);
    subOk = '';
    if (!d.text || opts.length < 2) { subMsg = t('fNeed'); subOut = ''; return; }
    subMsg = '';
    var out = 'Yangi savol / Новый вопрос (' + examId + ')\nTur: ' + (d.type === 'p' ? 'amaliy / практика' : 'nazariy / теория') + '\nImtihonda tushgan: ' + (d.seen ? 'ha / да' : "yo'q / нет") + '\n\nSavol:\n' + d.text + '\n';
    if (d.type === 'p') { if (d.code) out += '\nSQL:\n' + d.code + '\n'; if (d.tables) out += '\nJadvallar:\n' + d.tables + '\n'; }
    out += '\n'; 'ABCD'.split('').forEach(function (l, i) { out += l + ') ' + d.options[i] + '\n'; });
    out += "\nTo'g'ri javob: " + 'ABCD'[d.correct] + '\n'; if (d.explanation) out += '\nIzoh:\n' + d.explanation + '\n';
    subOut = out;
  }
  function sendSubmission(f) {
    var d = readForm(f); subOk = ''; subOut = '';
    if (d.hp) { subOk = t('fSent'); render(); return; }                       // honeypot filled: pretend success
    if (d.text.length < 5 || d.options.some(function (o) { return !o; })) { subMsg = t('fNeed4'); render(); return; }
    subMsg = ''; sending = true; render();
    var payload = { type: d.type, text: d.text, code: d.code, tables: d.tables, options: d.options, correct: d.correct, explanation: d.explanation, seen: d.seen, lang: d.lang };
    var author = d.showName && d.author ? d.author : null;
    Backend.submit(examId, payload, author).then(function (r) {
      sending = false;
      if (r && r.error) { var m = String(r.error.message || ''); subMsg = /daily_limit/.test(m) ? t('eLimit') : /blocked/.test(m) ? t('eBlocked') : /invalid_payload|check/.test(m) ? t('eInvalid') : t('eGeneric'); }
      else { subOk = t('fSent'); sub.correct = 0; }
      var fm = document.getElementById('subform'); var keep = !!subMsg;
      if (fm && !keep) fm.reset();
      render();
    }, function () { sending = false; subMsg = t('eGeneric'); render(); });
  }

  var lastFocus = null;
  function render() {
    var ae = document.activeElement;
    lastFocus = ae && ae.dataset && ae.dataset.a ? ae.dataset.a + '|' + (ae.dataset.i || '') : null;
    var draft = null;
    if (view === 'submit') { var f = document.getElementById('subform'); if (f) draft = Array.prototype.map.call(f.elements, function (e) { return [e.name, e.type === 'checkbox' || e.type === 'radio' ? e.checked : e.value, e.value]; }); }
    document.documentElement.lang = prefs.lang === 'ru' ? 'ru' : 'uz';
    if ((view === 'quiz' || view === 'result') && !sess) view = 'home';
    if ((view === 'prep' || view === 'submit') && !examId) view = 'home';
    var body = view === 'quiz' ? renderQuiz() : view === 'result' ? renderResult() : view === 'prep' ? renderPrep() : view === 'submit' ? renderSubmit() : renderHome();
    app.innerHTML = header() + body;
    if (draft) { var nf = document.getElementById('subform'); if (nf) draft.forEach(function (d) { var els = nf.querySelectorAll('[name="' + d[0] + '"]'); Array.prototype.forEach.call(els, function (e) { if (e.type === 'checkbox') e.checked = d[1]; else if (e.type === 'radio') { if (d[1] && e.value === d[2]) e.checked = true; } else if (d[0]) e.value = d[1]; }); }); }
    var hd = document.getElementById('top'); if (hd) document.documentElement.style.setProperty('--hdr', hd.offsetHeight + 'px');
    if (lastFocus) { var p = lastFocus.split('|'); var el = app.querySelector('[data-a="' + p[0] + '"][data-i="' + p[1] + '"]') || (p[1] === '' ? app.querySelector('[data-a="' + p[0] + '"]') : null); if (el) el.focus({ preventScroll: true }); }
    tick();
  }
  function tick() {
    if (view !== 'quiz' || !sess || sess.finished) return;
    var el = document.getElementById('timer'); if (!el) return;
    var r = remaining();
    if (r === null) { el.textContent = fmtTime((Date.now() - sess.start) / 1000); el.className = 'timer'; return; }
    if (r <= 0) { finish(true); return; }
    el.textContent = fmtTime(r); el.className = 'timer' + (r <= 60 ? ' crit' : r <= 300 ? ' low' : '');
  }
  setInterval(tick, 1000);

  /* ---------- actions ---------- */
  function setHash(h) { try { if (h) { if (location.hash !== '#' + h) location.hash = h; } else if (location.hash) history.replaceState(null, '', location.pathname + location.search); } catch (e) { /* ignore */ } }
  function go(i) { if (!sess || i < 0 || i >= sess.ids.length) return; sess.idx = i; if (!sess.finished) persist(); render(); window.scrollTo({ top: 0 }); }
  function wrongIdx() { return sess.ids.map(function (id, i) { return sess.ans[i] !== QMAP[id].a ? i : -1; }).filter(function (i) { return i >= 0; }); }
  var actions = {
    home: function () { view = 'home'; confirmFinish = false; setHash(''); render(); window.scrollTo(0, 0); },
    openExam: function (id) { examId = id; view = 'prep'; setHash(id); render(); window.scrollTo(0, 0); },
    backExam: function () { if (sess && !examId) examId = sess.exam; view = 'prep'; setHash(examId); render(); window.scrollTo(0, 0); },
    lang: function (i) { prefs.lang = i; save('ip_prefs', prefs); render(); },
    theme: function () { prefs.theme = prefs.theme === 'dark' ? 'light' : 'dark'; save('ip_prefs', prefs); document.documentElement.setAttribute('data-theme', prefs.theme); },
    mode: function (i) { prefs.mode = i; if (i === 'exam' && !prefs.timer) prefs.timer = 1.5; if (i === 'study') prefs.timer = 0; save('ip_prefs', prefs); render(); },
    pool: function (i) { prefs.pool = i; prefs.topics = []; save('ip_prefs', prefs); render(); },
    timer: function (i) { prefs.timer = parseFloat(i); save('ip_prefs', prefs); render(); },
    count: function (i) { prefs.count = parseInt(i, 10); save('ip_prefs', prefs); render(); },
    topic: function (i) { var k = prefs.topics.indexOf(i); if (k >= 0) prefs.topics.splice(k, 1); else prefs.topics.push(i); save('ip_prefs', prefs); render(); },
    shuffle: function () { prefs.shuffle = !prefs.shuffle; save('ip_prefs', prefs); render(); },
    startKind: function (i) { startKind(i); },
    resume: function () { if (!sess) return; examId = sess.exam; view = 'quiz'; if (remaining() !== null && remaining() <= 0) { finish(true); return; } render(); window.scrollTo(0, 0); },
    toRes: function () { if (!sess) return; if (!sess.finished) { confirmFinish = true; render(); return; } view = 'result'; render(); window.scrollTo(0, 0); },
    pick: function (i) { if (!sess || sess.finished) return; var k = sess.idx, orig = parseInt(i, 10); if (sess.mode === 'study' && sess.ans[k] !== null) return; sess.ans[k] = (sess.mode === 'exam' && sess.ans[k] === orig) ? null : orig; persist(); render(); },
    go: function (i) { go(parseInt(i, 10)); }, prev: function () { go(sess.idx - 1); }, next: function () { go(sess.idx + 1); },
    bookmark: function () { var id = sess.ids[sess.idx]; if (bm[id]) delete bm[id]; else bm[id] = 1; save('ip_bm', bm); render(); },
    navtoggle: function () { navOpen = !navOpen; render(); },
    finishAsk: function () { confirmFinish = true; render(); }, finishNo: function () { confirmFinish = false; render(); }, finishYes: function () { finish(false); },
    review: function (i) { view = 'quiz'; sess.idx = parseInt(i, 10); render(); window.scrollTo(0, 0); },
    reviewWrong: function () { var w = wrongIdx(); view = 'quiz'; sess.idx = w.length ? w[0] : 0; render(); window.scrollTo(0, 0); },
    retryWrong: function () { var w = wrongIdx(); if (!w.length) return; examId = sess.exam; newSession('mistakes', shuffle(w.map(function (i) { return sess.ids[i]; }))); },
    again: function () { examId = sess.exam; startKind(sess.kind === 'exam' ? 'exam' : sess.kind === 'study' ? 'study' : sess.kind); },
    submit: function () { view = 'submit'; subOut = ''; subMsg = ''; subOk = ''; render(); window.scrollTo(0, 0); },
    stype: function (i) { sub.type = i; render(); },
    signin: function (p) { save('ip_after', { exam: examId, view: 'submit' }); Backend.signIn(p); },
    signout: function () { Backend.signOut().then(function () { authUser = null; render(); }); },
    copyOut: function () {
      var el = document.getElementById('outbox'); if (!el) return;
      function sel() { var r = document.createRange(); r.selectNodeContents(el); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); }
      try { navigator.clipboard.writeText(subOut).then(function () { var b = app.querySelector('[data-a=copyOut]'); if (b) b.textContent = t('fCopied'); }, sel); } catch (e) { sel(); }
    }
  };
  app.addEventListener('click', function (e) { var el = e.target.closest ? e.target.closest('[data-a]') : null; if (!el || el.disabled) return; var f = actions[el.dataset.a]; if (f) f(el.dataset.i); });
  app.addEventListener('submit', function (e) {
    if (e.target.id !== 'subform') return;
    e.preventDefault();
    if (window.Backend && Backend.enabled()) { if (!sending) sendSubmission(e.target); return; }
    makeSubmission(e.target); render(); var ob = document.getElementById('outbox'); if (ob) ob.scrollIntoView({ block: 'nearest' });
  });
  document.addEventListener('keydown', function (e) {
    if (view !== 'quiz' || !sess || confirmFinish || e.ctrlKey || e.metaKey || e.altKey) return;
    var k = e.key;
    if (k >= '1' && k <= '4') actions.pick(String(sess.ord[sess.idx][parseInt(k, 10) - 1])); else if (k === 'ArrowRight') go(sess.idx + 1); else if (k === 'ArrowLeft') go(sess.idx - 1);
  });
  window.addEventListener('hashchange', function () {
    var h = location.hash.replace('#', '');
    if (view === 'quiz') return;
    if (h && EXAMS[h]) { if (examId !== h || view !== 'prep') { examId = h; view = 'prep'; render(); } }
    else if (!h && view !== 'home') { view = 'home'; render(); }
  });

  /* ---------- boot ---------- */
  function J(u) { return fetch(u).then(function (r) { if (!r.ok) throw new Error(u); return r.json(); }); }
  function withTimeout(p, ms) { return Promise.race([p, new Promise(function (res) { setTimeout(res, ms); })]); }
  function mergeApproved() {
    if (!(window.Backend && Backend.enabled())) return Promise.resolve();
    return Promise.all(Object.keys(EXAMS).map(function (id) {
      return Backend.approved(id).then(function (r) {
        if (!r || r.error || !r.data) return;
        r.data.forEach(function (row) {
          var q = row.data || {}; if (!q.q || !q.o || q.o.length !== 4 || typeof q.a !== 'number') return;
          q.id = 'u-' + row.id; q.exam = id; q.src = q.src === 'exam' ? 'exam' : 'similar'; q.t = BANKS[id].topics[q.t] ? q.t : 'basic'; q.d = q.d || 2; q.p = q.p ? 1 : 0;
          if (!QMAP[q.id]) { BANKS[id].questions.push(q); QMAP[q.id] = q; }
        });
      }).catch(function () { /* backend offline: keep local questions */ });
    }));
  }
  document.documentElement.setAttribute('data-theme', prefs.theme);
  J('data/tracks.json').then(function (cfg) {
    CFG = cfg; var jobs = [];
    cfg.tracks.forEach(function (tr) { tr.exams.forEach(function (ex) { EXAMS[ex.id] = ex; jobs.push(J(ex.bank).then(function (b) { BANKS[ex.id] = b; b.exam = ex.id; b.questions.forEach(function (q) { q.exam = ex.id; QMAP[q.id] = q; }); })); }); });
    return Promise.all(jobs);
  }).then(function () {
    var online = window.Backend && Backend.init(CFG.site);
    if (!online) return;
    Backend.onAuth(function (s) { authUser = s; if (view === 'submit') render(); });
    return withTimeout(Promise.all([Backend.session().then(function (s) { authUser = s; }, function () {}), mergeApproved()]), 4000);
  }).then(function () {
    if (sess && (!EXAMS[sess.exam] || !sess.ids.every(function (id) { return QMAP[id]; }))) sess = null;
    var h = location.hash.replace('#', '');
    if (h && EXAMS[h]) { examId = h; view = 'prep'; }
    var after = load('ip_after', null);
    if (after && authUser && EXAMS[after.exam]) { examId = after.exam; view = after.view === 'submit' ? 'submit' : 'prep'; save('ip_after', null); }
    render();
  }).catch(function () {
    app.innerHTML = '<div class="wrap"><p class="empty" style="margin-top:40px">' + esc(t('loadErr')) + '</p></div>';
  });
})();
