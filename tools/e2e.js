const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const errs = [];
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  p.on('pageerror', e => errs.push('PAGEERR ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|net::|Failed to load resource/.test(m.text())) errs.push('CONSOLE ' + m.text()); });
  await p.goto('http://localhost:8765/index.html');
  await p.waitForSelector('.tcard');
  await p.screenshot({ path: 'tools/s-home.png' });
  await p.click('[data-a=openExam]');
  console.log('hash:', await p.evaluate(() => location.hash));
  console.log('stat:', (await p.textContent('.statline')).replace(/\s+/g, ' '));
  await p.screenshot({ path: 'tools/s-prep.png', fullPage: true });
  // study with topic filter
  await p.click('[data-a=topic][data-i=join]');
  console.log('selected:', (await p.textContent('.settings .span.row')).replace(/\s+/g, ' '));
  await p.click('[data-a=count][data-i="0"]');
  await p.click('[data-a=startKind][data-i=study]');
  const n = await p.textContent('.progress .num'); console.log('study progress label:', n);
  await p.click('[data-a=bookmark]');
  await p.click('[data-a=pick][data-i="0"]');
  await p.screenshot({ path: 'tools/s-study.png' });
  // finish early
  await p.click('[data-a=finishAsk]'); await p.click('[data-a=finishYes]');
  await p.waitForSelector('.score');
  console.log('result:', (await p.textContent('.score')).replace(/\s+/g, ' '));
  await p.click('[data-a=backExam]');
  // exam mode, pool exam
  await p.click('[data-a=mode][data-i=exam]');
  console.log('exam line:', (await p.textContent('.settings .span.row')).replace(/\s+/g, ' '));
  await p.click('[data-a=startKind][data-i=exam]');
  console.log('exam n:', await p.textContent('.progress .num'), 'timer', await p.textContent('#timer'));
  await p.click('[data-a=pick][data-i="1"]');
  console.log('exam feedback shown?', (await p.$('.fb')) !== null);
  await p.screenshot({ path: 'tools/s-exam.png' });
  await p.click('[data-a=finishAsk]'); await p.click('[data-a=finishYes]');
  await p.waitForSelector('.score'); await p.screenshot({ path: 'tools/s-result.png', fullPage: true });
  // submit form
  await p.click('[data-a=backExam]');
  await p.click('[data-a=submit]');
  await p.click('[data-a=stype][data-i=t]');
  await p.fill('#f-text', 'Test savol?'); await p.fill('#f-o0', 'Bir'); await p.fill('#f-o1', 'Ikki');
  await p.click('input[name=correct][value="1"]');
  await p.click('[data-a=stype][data-i=p]');
  console.log('draft kept:', await p.inputValue('#f-text'), await p.inputValue('#f-o1'), await p.isChecked('input[name=correct][value="1"]'));
  await p.click('button[type=submit]');
  console.log('out:', (await p.textContent('#outbox')).slice(0, 80).replace(/\n/g, ' | '));
  await p.screenshot({ path: 'tools/s-submit.png', fullPage: true });
  // mistakes persisted
  await p.click('[data-a=backExam]');
  console.log('mistakes panel:', (await p.textContent('.extras .panel')).replace(/\s+/g, ' ').slice(0, 80));
  // mobile
  const m = await b.newContext({ viewport: { width: 390, height: 800 }, deviceScaleFactor: 2 });
  const mp = await m.newPage(); mp.on('pageerror', e => errs.push('M ' + e.message));
  await mp.goto('http://localhost:8765/index.html#sql-exam-t'); await mp.waitForSelector('.statline');
  console.log('hash deep link prep:', await mp.$('.statline') !== null);
  await mp.screenshot({ path: 'tools/s-m-prep.png', fullPage: true });
  console.log('mobile sw/iw:', await mp.evaluate(() => document.documentElement.scrollWidth + '/' + innerWidth));
  console.log('errors:', errs.length ? errs : 'none');
  await b.close();
})();
