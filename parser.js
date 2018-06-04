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
    this.transOptions = options.options || {};
    delete options.options;
    this.options = Object.assign(defaults, options);
  }
  createDoc() {
    if (!this._match(this.options.file)) {
      return;
    }
    const filename = path.resolve(this.options.srcPath, this.options.file);
    const outputFilename = path.resolve(this.options.outPath, this.options.file.replace('.js', '.md'));

    let fileContent = fs.readFileSync(filename, { encoding: 'binary' });
    fileContent = iconv.decode(fileContent, 'utf8');
    fileContent = fileContent.replace(/\r\n/g, '\n');
    fileContent = fileContent.replace(/\n/g, '\uffff');

    let block = (fileContent || '').match(language.docBlocksRegExp);
    if (block) {
      const arr = [];
      for (let item of block) {
        item = item.replace(language.docBlockItemRegExp, '');
        item = item.replace(/\uffff/g, '\n');
        item = item.replace(language.inlineRegExp, '');
        arr.push(item);
      }
      
      const res = helper.mkdir(path.dirname(outputFilename));
      assert(res, 'You don\'t have right to create file in the doc path!');

      fs.writeFileSync(outputFilename, arr.join('\n'), 'utf-8');
    }
  }
  _match(filePath) {
    if (!this.transOptions.match) {
      return true;
    }
    if (helper.isRegExp(this.transOptions.match)) {
      return this.transOptions.match.test(filePath);
    }
    if (helper.isFunction(this.transOptions.match)) {
      return this.transOptions.match(filePath);
    }
    return true;
  }
};
