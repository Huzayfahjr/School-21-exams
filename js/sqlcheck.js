/* Helpers for the admin panel: parse "text tables", run SQL in PGlite, and guess which option matches the result. */
(function (root) {
  'use strict';
  function splitCells(line) {
    if (line.indexOf('|') >= 0) return line.split('|').map(function (x) { return x.trim(); }).filter(function (x, i, a) { return !(x === '' && (i === 0 || i === a.length - 1)); });
    if (line.indexOf('\t') >= 0) return line.split('\t').map(function (x) { return x.trim(); });
    var out = [], cur = '', q = '', i, ch;
    for (i = 0; i < line.length; i++) {
      ch = line[i];
      if (q) { cur += ch; if (ch === q) q = ''; }
      else if (ch === "'" || ch === '"') { q = ch; cur += ch; }
      else if (ch === ',') { out.push(cur.trim()); cur = ''; }
      else cur += ch;
    }
    out.push(cur.trim());
    return out;
  }
  function val(x) {
    if (/^null$/i.test(x)) return null;
    if (/^-?\d+(\.\d+)?$/.test(x)) return Number(x);
    var m = x.match(/^(['"])(.*)\1$/); return m ? m[2] : x;
  }
  /* "Student: id, name" then rows "1, Иван"; tables separated by a blank line */
  function parseTables(text) {
    var tables = [], errs = [];
    String(text || '').replace(/\r/g, '').split(/\n\s*\n/).forEach(function (blk) {
      var lines = blk.split('\n').map(function (l) { return l.trim(); }).filter(Boolean);
      if (!lines.length) return;
      var m = lines[0].match(/^([A-Za-z_][\w]*)\s*[:(]\s*(.+?)\)?$/);
      if (!m) { errs.push('Jadval sarlavhasi noto\'g\'ri: ' + lines[0]); return; }
      var cols = splitCells(m[2]).map(function (c) { return c.replace(/[^\w]/g, ''); }), rows = [];
      lines.slice(1).forEach(function (l) {
        var cells = splitCells(l).map(val);
        if (cells.length !== cols.length) errs.push(m[1] + ': qator ustunlar soniga mos emas: ' + l);
        else rows.push(cells);
      });
      tables.push({ n: m[1], c: cols, r: rows });
    });
    return { tables: tables, errors: errs };
  }
  function lit(v) { return v === null ? 'NULL' : typeof v === 'number' ? String(v) : "'" + String(v).replace(/'/g, "''") + "'"; }
  function setupSql(tables) {
    var out = [];
    tables.forEach(function (t) {
      var types = t.c.map(function (_, i) { var v = t.r.map(function (r) { return r[i]; }).filter(function (x) { return x !== null; })[0]; return typeof v === 'number' ? 'numeric' : 'text'; });
      out.push('CREATE TABLE ' + t.n + ' (' + t.c.map(function (c, i) { return c + ' ' + (types[i] === 'numeric' ? 'int' : 'text'); }).join(', ') + ');');
      t.r.forEach(function (r) { out.push('INSERT INTO ' + t.n + ' VALUES (' + r.map(lit).join(', ') + ');'); });
    });
    return out.join('\n');
  }
  function run(db, tables, code) {
    return db.exec('DROP SCHEMA IF EXISTS q CASCADE; CREATE SCHEMA q; SET search_path = q;')
      .then(function () { return setupSql(tables).length ? db.exec(setupSql(tables)) : null; })
      .then(function () { return db.exec(code, { rowMode: 'array' }); })
      .then(function (out) {
        var last = out[out.length - 1] || { rows: [], fields: [] };
        return { rows: last.rows, fields: last.fields.map(function (f) { return f.name; }) };
      })
      .catch(function (e) { return { err: String(e && e.message || e) }; });
  }
  function key(vals) { return vals.map(function (v) { return v === null || v === undefined ? 'null' : String(v); }).join('').toLowerCase().replace(/[^\p{L}\p{N}]/gu, ''); }
  /* returns indexes of options that agree with the result (advisory only) */
  function guess(res, opts) {
    var t = opts.map(function (o) { return String(o).toLowerCase(); }), ix = [];
    function hit(re) { t.forEach(function (x, i) { if (re.test(x)) ix.push(i); }); return ix; }
    if (res.err) return hit(/ошибк|xato|error|syntax/);
    if (!res.rows.length) return hit(/не вернет|не вернёт|qaytarmaydi|пуст|bo'sh|empty|no rows/);
    var rcs = t.map(function (x) { var m = x.match(/r\s*=\s*(\d+)\D+c\s*=\s*(\d+)/); return m ? [+m[1], +m[2]] : null; });
    if (rcs.some(Boolean)) { rcs.forEach(function (r, i) { if (r && r[0] === res.rows.length && r[1] === res.fields.length) ix.push(i); }); return ix; }
    var first = key(res.rows[0]), all = key([].concat.apply([], res.rows));
    t.forEach(function (x, i) { var k = key([x]); if (k && (k === first || k === all)) ix.push(i); });
    return ix;
  }
  var api = { parseTables: parseTables, setupSql: setupSql, run: run, guess: guess };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.SqlCheck = api;
})(typeof window !== 'undefined' ? window : this);
