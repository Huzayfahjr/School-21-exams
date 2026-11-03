const fs = require('fs');
module.exports = function () {
  const src = ['data1.js','data2.js','data3.js'].map(f => fs.readFileSync(__dirname + '/' + f, 'utf8')).join('\n');
  return new Function(src + '\nreturn DATA;')();
};
