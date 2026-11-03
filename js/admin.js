/* Admin panel: review submitted questions, check SQL in the browser, edit, approve / reject / block. */
(function () {
  'use strict';
  var app = document.getElementById('app');
  var CFG = null, TOPICS = {}, EXAMS = {}, dbp = null;
  var st = { phase: 'load', user: null, tab: 'pending', list: [], counts: { pending: 0 }, sel: null, ed: null, msg: '', msgBad: false, check: '', busy: false, exp: '' };

  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function cl() { return Backend.client(); }
  function fmt(ts) { var d = new Date(ts); return String(d.getDate()).padStart(2, '0') + '.' + String(d.getMonth() + 1).padStart(2, '0') + ' ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); }
  function say(m, bad) { st.msg = m; st.msgBad = !!bad; }
  function L2(x) { return Array.isArray(x) ? x : [x, x]; }

  /* ---------- data ---------- */
  function loadTopics(examId) {
    if (TOPICS[examId]) return Promise.resolve();
    return fetch(EXAMS[examId].bank).then(function (r) { return r.json(); }).then(function (b) { TOPICS[examId] = b.topics; }).catch(function () { TOPICS[examId] = {}; });
  }
  function refresh() {
    var c = cl(), p;
    if (st.tab === 'approved') p = c.from('questions').select('*').order('created_at', { ascending: false }).limit(200);
    else p = c.from('submissions').select('*').eq('status', st.tab).order('created_at', { ascending: false }).limit(100);
    return Promise.all([p, c.from('submissions').select('id', { count: 'exact', head: true }).eq('status', 'pending')]).then(function (r) {
      if (r[0].error) { say('Yuklashda xato: ' + r[0].error.message, true); st.list = []; } else st.list = r[0].data || [];
      st.counts.pending = r[1].count || 0;
      render();
    });
  }
  function select(id) {
    var it = st.list.filter(function (x) { return x.id === id; })[0]; if (!it) return;
    st.sel = it; st.check = ''; st.msg = '';
    if (st.tab === 'approved') { st.ed = null; render(); return; }
    var p = it.payload || {}, lang = p.lang === 'ru' ? 'ru' : 'uz', ex = it.exam;
    var ed = { exam: ex, src: p.seen ? 'exam' : 'similar', t: 'basic', d: 2, p: p.type === 'p' ? 1 : 0, code: p.code || '', tables: p.tables || '', a: p.correct || 0, note: it.admin_note || '', author: it.author || '',
      qru: '', quz: '', eru: '', euz: '' };
    ed['q' + lang] = p.text || ''; ed['e' + lang] = p.explanation || '';
    [0, 1, 2, 3].forEach(function (i) { ed['o' + i + 'ru'] = ''; ed['o' + i + 'uz'] = ''; ed['o' + i + lang] = (p.options || [])[i] || ''; });
    st.ed = ed;
    loadTopics(ex).then(function () { if (!TOPICS[ex].basic) ed.t = Object.keys(TOPICS[ex])[0] || 'basic'; render(); });
  }

  /* ---------- SQL check (PGlite in the browser) ---------- */
  function getDb() {
    if (dbp) return dbp;
    var url = (CFG.site && CFG.site.pgliteUrl) || 'https://cdn.jsdelivr.net/npm/@electric-sql/pglite@0.5.12/dist/index.js';
    dbp = import(new URL(url, location.href).href).then(function (m) { return new m.PGlite(); });
    dbp.catch(function () { dbp = null; });
    return dbp;
  }
  function tableHtml(tb) {
    return '<div class="tbl"><div class="tbl-name">' + esc(tb.n) + '</div><div class="tbl-scroll"><table><thead><tr>' + tb.c.map(function (c) { return '<th>' + esc(c) + '</th>'; }).join('') + '</tr></thead><tbody>' +
      tb.r.map(function (r) { return '<tr>' + r.map(function (v) { return v === null ? '<td class="nul">NULL</td>' : typeof v === 'number' ? '<td class="num">' + v + '</td>' : '<td>' + esc(v) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div></div>';
  }
  function showCheck(html) { st.check = html; var el = document.getElementById('checkout'); if (el) el.innerHTML = html; }
  function doCheck() {
    var ed = st.ed; if (!ed || !ed.p) return;
    if (!ed.code.trim()) { showCheck('<p class="hint" style="color:var(--bad)">SQL kod bo\'sh.</p>'); return; }
    var pt = SqlCheck.parseTables(ed.tables);
    if (pt.errors.length) { showCheck('<p class="hint" style="color:var(--bad)">' + pt.errors.map(esc).join('<br>') + '</p>'); return; }
    showCheck('<p class="hint">PostgreSQL yuklanmoqda (birinchi marta ~17 MB)…</p>');
    getDb().then(function (db) {
      showCheck('<p class="hint">Bajarilmoqda…</p>');
      return SqlCheck.run(db, pt.tables, ed.code).then(function (res) {
        var opts = [0, 1, 2, 3].map(function (i) { return ed['o' + i + 'ru'] || ed['o' + i + 'uz'] || ''; });
        var g = SqlCheck.guess(res, opts), marked = Number(ed.a), L = 'ABCD', h;
        if (res.err) h = '<div class="fb bad"><h4>PostgreSQL xatosi</h4><p class="expl">' + esc(res.err) + '</p></div>';
        else h = '<div class="scroll-x">' + tableHtml({ n: 'natija (' + res.rows.length + ' qator)', c: res.fields.length ? res.fields : ['—'], r: res.rows.slice(0, 20) }) + '</div>';
        var verdict;
        if (g.length === 1 && g[0] === marked) verdict = '<div class="fb ok"><h4>Mos keldi</h4><p class="expl">Belgilangan javob (' + L[marked] + ') natijaga mos.</p></div>';
        else if (g.length === 0) verdict = '<div class="fb miss"><h4>Avtomatik solishtirib bo\'lmadi</h4><p class="expl">Hech bir variant natijaga o\'xshamadi. Natijani o\'zingiz ko\'rib chiqing.</p></div>';
        else verdict = '<div class="fb bad"><h4>Mos kelmadi</h4><p class="expl">Natijaga mos variant: ' + g.map(function (i) { return L[i]; }).join(', ') + '. Belgilangan: ' + L[marked] + '.</p></div>';
        showCheck(h + verdict);
      });
    }).catch(function (e) { showCheck('<p class="hint" style="color:var(--bad)">PostgreSQL yuklanmadi: ' + esc(e && e.message || e) + '</p>'); });
  }

  /* ---------- build / save ---------- */
  function bi(ru, uz) { ru = (ru || '').trim(); uz = (uz || '').trim(); if (!ru && !uz) return ''; if (!ru) ru = uz; if (!uz || uz === ru) return ru; return [ru, uz]; }
  function buildQuestion(ed) {
    var q = bi(ed.qru, ed.quz); if (!q) throw new Error('Savol matni bo\'sh.');
    var o = [0, 1, 2, 3].map(function (i) { return bi(ed['o' + i + 'ru'], ed['o' + i + 'uz']); });
    if (o.some(function (x) { return !x; })) throw new Error('To\'rtala variant to\'ldirilishi kerak.');
    var d = { src: ed.src, t: ed.t, d: Number(ed.d), p: Number(ed.p), q: q, o: o, a: Number(ed.a), e: bi(ed.eru, ed.euz) };
    if (d.p) {
      if (ed.code.trim()) d.code = ed.code.trim();
      var pt = SqlCheck.parseTables(ed.tables); if (pt.errors.length) throw new Error(pt.errors[0]);
      if (pt.tables.length) d.tables = pt.tables;
    }
    if (ed.author) d.author = ed.author;
    return d;
  }
  function act(fn) {
    if (st.busy) return; st.busy = true;
    Promise.resolve().then(fn).catch(function (e) { say(e.message || String(e), true); }).then(function () { st.busy = false; render(); });
  }
  function approve() {
    act(function () {
      var data = buildQuestion(st.ed), it = st.sel;
      return cl().from('questions').insert({ exam: it.exam, data: data, submission_id: it.id }).then(function (r) {
        if (r.error) throw new Error(r.error.message);
        return cl().from('submissions').update({ status: 'approved', admin_note: st.ed.note || null }).eq('id', it.id);
      }).then(function (r) { if (r.error) throw new Error(r.error.message); st.sel = null; st.ed = null; say('Tasdiqlandi va saytga qo\'shildi.'); return refresh(); });
    });
  }
  function reject() {
    act(function () {
      var it = st.sel;
      return cl().from('submissions').update({ status: 'rejected', admin_note: (st.ed && st.ed.note) || null }).eq('id', it.id).then(function (r) {
        if (r.error) throw new Error(r.error.message); st.sel = null; st.ed = null; say('Rad etildi.'); return refresh();
      });
    });
  }
  function block() {
    act(function () {
      var it = st.sel;
      return cl().from('blocked').upsert({ user_id: it.user_id, reason: (st.ed && st.ed.note) || null }).then(function (r) {
        if (r.error) throw new Error(r.error.message);
        return cl().from('submissions').update({ status: 'rejected', admin_note: 'blocked' }).eq('id', it.id);
      }).then(function () { st.sel = null; st.ed = null; say('Foydalanuvchi bloklandi, savol rad etildi.'); return refresh(); });
    });
  }
  function del() {
    act(function () {
      var it = st.sel;
      return cl().from('questions').delete().eq('id', it.id).then(function (r) { if (r.error) throw new Error(r.error.message); st.sel = null; say('Savol o\'chirildi.'); return refresh(); });
    });
  }
  function exportAll() {
    act(function () {
      return cl().from('questions').select('*').order('created_at', { ascending: true }).then(function (r) {
        if (r.error) throw new Error(r.error.message);
        var by = {}; (r.data || []).forEach(function (row) { var q = Object.assign({}, row.data); q.id = 'u-' + row.id; (by[row.exam] = by[row.exam] || []).push(q); });
        st.exp = JSON.stringify(by, null, 2); say('Eksport tayyor: ' + (r.data || []).length + ' ta savol.');
      });
    });
  }
  function copyText(text, done) {
    function fallback() { var ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); done(true); } catch (e) { done(false); } ta.remove(); }
    try { navigator.clipboard.writeText(text).then(function () { done(true); }, fallback); } catch (e) { fallback(); }
  }
  function claudePrompt() {
    var ed = st.ed, o = [0, 1, 2, 3].map(function (i) { return 'ABCD'[i] + ') ' + (ed['o' + i + 'ru'] || ed['o' + i + 'uz']); }).join('\n');
    return 'Quyidagi School 21 SQL imtihon savolini tekshir. Aytib ber: 1) belgilangan javob (' + 'ABCD'[ed.a] + ') to\'g\'rimi (SQL bo\'lsa PostgreSQL bo\'yicha hisobla), 2) savol yoki variantlarda xato/noaniqlik bormi, 3) ruscha va o\'zbekcha (lotin) toza matn va qisqa izoh yoz.\n\n' +
      'Tur: ' + (ed.p ? 'amaliy' : 'nazariy') + '\nSavol: ' + (ed.qru || ed.quz) + '\n' + (ed.code ? '\nSQL:\n' + ed.code + '\n' : '') + (ed.tables ? '\nJadvallar:\n' + ed.tables + '\n' : '') + '\n' + o + '\n';
  }

  /* ---------- views ---------- */
  function sel(name, cur, items) { return '<select data-f="' + name + '">' + items.map(function (i) { return '<option value="' + esc(i[0]) + '"' + (String(cur) === String(i[0]) ? ' selected' : '') + '>' + esc(i[1]) + '</option>'; }).join('') + '</select>'; }
  function editorHtml() {
    var ed = st.ed, it = st.sel, tp = TOPICS[it.exam] || {}, h = '';
    var tabs = '';
    h += '<div class="panel"><p class="hint" style="min-height:0;margin:0 0 8px">' + esc(it.exam) + ' · ' + fmt(it.created_at) + ' · foydalanuvchi ' + esc(String(it.user_id).slice(0, 8)) + (it.author ? ' · ism: ' + esc(it.author) : '') + (it.payload && it.payload.seen ? ' · imtihonda tushgan' : '') + ' · til: ' + esc((it.payload || {}).lang) + '</p>';
    h += '<div class="afields"><label>Manba' + sel('src', ed.src, [['exam', 'Imtihondan'], ['similar', 'O\'xshash']]) + '</label><label>Tur' + sel('p', ed.p, [[1, 'Amaliy'], [0, 'Nazariy']]) + '</label><label>Mavzu' + sel('t', ed.t, Object.keys(tp).map(function (k) { return [k, L2(tp[k])[1]]; })) + '</label><label>Qiyinlik' + sel('d', ed.d, [[1, 'oson'], [2, 'o\'rtacha'], [3, 'qiyin']]) + '</label></div>';
    if (ed.p) {
      h += '<div class="field"><label>SQL kod</label><textarea class="mono" data-f="code" spellcheck="false">' + esc(ed.code) + '</textarea></div><div class="field"><label>Jadvallar (matn)</label><textarea class="mono" data-f="tables" spellcheck="false">' + esc(ed.tables) + '</textarea></div>';
      var pt = SqlCheck.parseTables(ed.tables);
      h += '<div class="tables">' + pt.tables.map(tableHtml).join('') + '</div>' + (pt.errors.length ? '<p class="hint" style="color:var(--bad)">' + pt.errors.map(esc).join('<br>') + '</p>' : '');
    }
    h += '<div class="two"><div class="field"><label>Savol (RU)</label><textarea data-f="qru">' + esc(ed.qru) + '</textarea></div><div class="field"><label>Savol (UZ)</label><textarea data-f="quz">' + esc(ed.quz) + '</textarea></div></div>';
    h += '<div class="field"><span class="lab">Variantlar (RU | UZ), to\'g\'risini belgilang. UZ bo\'sh bo\'lsa RU ishlatiladi</span>';
    [0, 1, 2, 3].forEach(function (i) { h += '<div class="optrow2"><span class="ltr">' + 'ABCD'[i] + '</span><input type="text" data-f="o' + i + 'ru" value="' + esc(ed['o' + i + 'ru']) + '"><input type="text" data-f="o' + i + 'uz" value="' + esc(ed['o' + i + 'uz']) + '"><input type="radio" name="a" data-f="a" value="' + i + '"' + (Number(ed.a) === i ? ' checked' : '') + ' aria-label="' + 'ABCD'[i] + '"></div>'; });
    h += '</div><div class="two"><div class="field"><label>Izoh (RU)</label><textarea data-f="eru">' + esc(ed.eru) + '</textarea></div><div class="field"><label>Izoh (UZ)</label><textarea data-f="euz">' + esc(ed.euz) + '</textarea></div></div>';
    h += '<div class="field"><label>Muallif nomi (saytda ko\'rinadi, bo\'sh bo\'lsa ko\'rinmaydi)</label><input type="text" data-f="author" value="' + esc(ed.author) + '"></div><div class="field"><label>Eslatma (rad etish yoki bloklash sababi)</label><input type="text" data-f="note" value="' + esc(ed.note) + '"></div>';
    h += '<div class="row">' + (ed.p ? '<button class="btn" data-a="check">SQL tekshirish</button>' : '') + '<button class="btn" data-a="copy">Claude uchun nusxalash</button></div><div id="checkout">' + st.check + '</div>';
    if (st.tab !== 'approved') h += '<div class="row" style="margin-top:14px"><button class="btn primary" data-a="approve"' + (st.busy ? ' disabled' : '') + '>Tasdiqlash</button><button class="btn" data-a="reject"' + (st.busy ? ' disabled' : '') + '>Rad etish</button><button class="btn danger" data-a="block"' + (st.busy ? ' disabled' : '') + '>Bloklash</button></div>';
    return h + '</div>';
  }
  function listHtml() {
    if (!st.list.length) return '<div class="empty">Bu bo\'limda hozircha hech narsa yo\'q.</div>';
    return st.list.map(function (it) {
      var d = st.tab === 'approved' ? it.data : it.payload, txt = st.tab === 'approved' ? L2(d.q)[1] : d.text;
      var on = st.sel && st.sel.id === it.id;
      return '<button class="litem' + (on ? ' on' : '') + '" data-a="sel" data-i="' + esc(it.id) + '"><span class="lt">' + esc(String(txt || '').slice(0, 110)) + '</span><span class="lm">' + fmt(it.created_at) + ' · ' + (((d.p || d.type === 'p') ? 'amaliy' : 'nazariy')) + (d.seen ? ' · imtihondan' : '') + (st.tab === 'approved' && d.src === 'exam' ? ' · imtihondan' : '') + '</span></button>';
    }).join('');
  }
  function approvedDetail() {
    var d = st.sel.data, h = '<div class="panel"><h3>' + esc(L2(d.q)[1]) + '</h3>' + (d.code ? '<pre class="code"><code>' + esc(d.code) + '</code></pre>' : '') + '<div class="tables">' + (d.tables || []).map(tableHtml).join('') + '</div><ol type="A">' + d.o.map(function (o, i) { return '<li' + (i === d.a ? ' style="color:var(--good);font-weight:600"' : '') + '>' + esc(L2(o)[1]) + '</li>'; }).join('') + '</ol><p class="expl">' + esc(L2(d.e)[1]) + '</p><div class="row"><button class="btn danger" data-a="del">O\'chirish</button></div></div>';
    return h;
  }
  function render() {
    var h = '<header class="top"><div class="wrap"><div class="top-row"><span class="mark">IT</span><span class="brand-name">Admin panel</span><span class="spacer"></span>';
    if (st.user) h += '<span class="hint" style="margin:0;min-height:0">' + esc(st.user.email || '') + '</span><button class="btn sm" data-a="signout">Chiqish</button>';
    h += '</div></div></header><div class="wrap" style="margin-top:18px">';
    if (st.phase === 'load') h += '<p class="hint">Yuklanmoqda…</p>';
    else if (st.phase === 'noconf') h += '<div class="empty">Baza ulanmagan. <code>data/tracks.json</code> ichidagi <code>site.supabase</code> (url va anonKey) ni to\'ldiring. SETUP.md ga qarang.</div>';
    else if (st.phase === 'login') h += '<div class="form"><p style="margin:0">Admin panelga kiring.</p><div class="row"><button class="btn primary" data-a="signin" data-i="google">Google bilan kirish</button><button class="btn" data-a="signin" data-i="github">GitHub bilan kirish</button></div></div>';
    else if (st.phase === 'denied') h += '<div class="form"><p style="margin:0">Bu akkaunt admin emas. Agar bu sizning akkauntingiz bo\'lsa, Supabase SQL Editor\'da quyidagini bajaring:</p><div class="outbox">insert into public.admins (user_id) values (\'' + esc(st.user.id) + '\');</div></div>';
    else {
      h += '<div class="seg" role="group">' + [['pending', 'Kutilmoqda (' + st.counts.pending + ')'], ['approved', 'Tasdiqlangan'], ['rejected', 'Rad etilgan']].map(function (t) { return '<button data-a="tab" data-i="' + t[0] + '" aria-pressed="' + (st.tab === t[0]) + '">' + esc(t[1]) + '</button>'; }).join('') + '</div> <button class="btn sm" data-a="export" style="margin-left:8px">Eksport (JSON)</button>';
      if (st.msg) h += '<p class="' + (st.msgBad ? 'hint' : 'msg-ok') + '" style="' + (st.msgBad ? 'color:var(--bad);' : '') + 'margin:10px 0 0">' + esc(st.msg) + '</p>';
      if (st.exp) h += '<div class="field" style="margin-top:12px"><label>Eksport (savollarni data/ papkaga qo\'shib, zaxira qilib qo\'yish mumkin)</label><textarea class="mono" readonly rows="8">' + esc(st.exp) + '</textarea></div>';
      h += '<div class="adm"><div class="alist">' + listHtml() + '</div><div class="aedit">' + (st.sel ? (st.tab === 'approved' ? approvedDetail() : st.ed ? editorHtml() : '') : '<div class="empty">Chapdan savolni tanlang.</div>') + '</div></div>';
    }
    app.innerHTML = h + '</div>';
  }

  /* ---------- events ---------- */
  app.addEventListener('input', function (e) { var f = e.target.getAttribute && e.target.getAttribute('data-f'); if (f && st.ed && e.target.type !== 'radio' && e.target.tagName !== 'SELECT') st.ed[f] = e.target.value; });
  app.addEventListener('change', function (e) {
    var f = e.target.getAttribute && e.target.getAttribute('data-f'); if (!f || !st.ed) return;
    st.ed[f] = e.target.value; if (f === 'p' || f === 'tables') { st.ed.p = Number(st.ed.p); render(); }
  });
  var A = {
    signin: function (p) { Backend.signIn(p); },
    signout: function () { Backend.signOut().then(function () { st.user = null; st.phase = 'login'; render(); }); },
    tab: function (t) { st.tab = t; st.sel = null; st.ed = null; st.msg = ''; refresh(); },
    sel: select, check: doCheck, approve: approve, reject: reject, block: block, del: del, export: exportAll,
    copy: function () { copyText(claudePrompt(), function (ok) { say(ok ? 'Nusxalandi. Claude\'ga tashlang.' : 'Nusxalab bo\'lmadi.', !ok); var el = document.getElementById('checkout'); if (!ok) render(); else { var m = document.querySelector('.copied'); if (!m && el) el.insertAdjacentHTML('afterbegin', '<p class="msg-ok copied">Nusxalandi. Claude\'ga tashlang.</p>'); } }); }
  };
  app.addEventListener('click', function (e) { var el = e.target.closest ? e.target.closest('[data-a]') : null; if (!el || el.disabled) return; var f = A[el.dataset.a]; if (f) f(el.dataset.i); });

  /* ---------- boot ---------- */
  document.documentElement.setAttribute('data-theme', (function () { try { return JSON.parse(localStorage.getItem('ip_prefs') || '{}').theme || 'dark'; } catch (e) { return 'dark'; } })());
  fetch('data/tracks.json').then(function (r) { return r.json(); }).then(function (cfg) {
    CFG = cfg; cfg.tracks.forEach(function (t) { t.exams.forEach(function (x) { EXAMS[x.id] = x; }); });
    if (!window.Backend || !Backend.init(cfg.site)) { st.phase = 'noconf'; render(); return; }
    Backend.onAuth(function (s) { if (!s && st.phase === 'ok') { st.phase = 'login'; render(); } });
    return Backend.session().then(function (s) {
      if (!s) { st.phase = 'login'; render(); return; }
      st.user = s.user;
      return cl().from('admins').select('user_id').eq('user_id', s.user.id).then(function (r) {
        if (r.error || !r.data || !r.data.length) { st.phase = 'denied'; render(); return; }
        st.phase = 'ok'; render(); return refresh();
      });
    });
  }).catch(function () { st.phase = 'noconf'; render(); });
  render();
})();
