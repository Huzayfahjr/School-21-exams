// Converts the authored question files into data/sql-exam-t.json (the question bank).
const fs = require('fs');
const path = require('path');
const DATA = require('./load.js')();
let e = 0, s = 0;
const questions = [];
DATA.VARIANTS.forEach(v => v.q.forEach(q => {
  const o = Object.assign({}, q); delete o.chk;
  if (v.id === 1) { o.src = 'exam'; o.id = 'sqlt-e' + String(++e).padStart(2, '0'); }
  else { o.src = 'similar'; o.id = 'sqlt-s' + String(++s).padStart(2, '0'); }
  questions.push(o);
}));
const bank = { exam: 'sql-exam-t', topics: DATA.TOPICS, questions };
fs.writeFileSync(path.join(__dirname, '..', 'data', 'sql-exam-t.json'), JSON.stringify(bank));
console.log('questions:', questions.length, 'exam:', e, 'similar:', s);
