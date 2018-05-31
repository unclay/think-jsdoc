const Parser = require('./parser');

module.exports = (fileInfo) => {
  const parser = new Parser(fileInfo);
  parser.createDoc();
};
