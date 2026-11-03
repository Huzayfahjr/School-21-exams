import { PGlite } from '/home/claude/sqlquiz/node_modules/@electric-sql/pglite/dist/index.js';
import { createRequire } from 'module';
import fs from 'fs';
const require = createRequire(import.meta.url);
const SC = require('../js/sqlcheck.js');
const bank = JSON.parse(fs.readFileSync(new URL('../data/sql-exam-t.json', import.meta.url)));
const db = new PGlite();
let ok = 0, amb = 0, bad = 0, n = 0;
for (const q of bank.questions.filter(q => q.p)) {
  n++;
  const res = await SC.run(db, q.tables, q.code);
  const opts = q.o.map(o => Array.isArray(o) ? o[0] : o);
  const g = SC.guess(res, opts);
  const good = g.length === 1 && g[0] === q.a;
  if (good) ok++; else if (g.includes(q.a)) { amb++; console.log('AMBIG', q.id, g); } else { bad++; console.log('MISS', q.id, 'guess', g, 'marked', q.a, JSON.stringify(res).slice(0, 120)); }
}
console.log({ n, exactMatch: ok, ambiguous: amb, miss: bad });
// text table parser
const p = SC.parseTables("Student: id, name\n1, Иван\n2, 'Анна'\n\nHobby (id | student_id | hobby)\n10 | 1 | Хоккей\n20 | NULL | Музыка");
console.log(JSON.stringify(p));
const r = await SC.run(db, p.tables, 'SELECT s.name, h.hobby FROM Student s LEFT JOIN Hobby h ON s.id=h.student_id ORDER BY 1');
console.log(JSON.stringify(r));
