const fs = require('fs');
const path = require('path');
const assert = require('assert');
const helper = require('think-helper');
const iconv = require('iconv-lite');

const language = require('./languages/defaults');

const defaults = {
};

module.exports = class Parser {
  constructor(options = {}) {
    this.options = Object.assign(defaults, options);
  }
  createDoc() {
    const filename = path.resolve(this.options.srcPath, this.options.file);
    const outputFilename = path.resolve(this.options.outPath, this.options.file.replace('.js', '.md'));

    let fileContent = fs.readFileSync(filename, { encoding: 'binary' });
    fileContent = iconv.decode(fileContent, 'utf8');
    fileContent = fileContent.replace(/\r\n/g, '\n');
    fileContent = fileContent.replace(/\n/g, '\uffff');

    let block = language.docBlocksRegExp.exec(fileContent);
    if (block) {
      block = block[2] || block[1];
      block = block.replace(/\uffff/g, '\n');
      block = block.replace(language.inlineRegExp, '');
      
      const res = helper.mkdir(path.dirname(outputFilename));
      assert(res, 'You don\'t have right to create file in the doc path!');

      fs.writeFileSync(outputFilename, block, 'utf-8');
    }
  }
};
