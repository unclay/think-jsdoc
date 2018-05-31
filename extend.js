const fs = require('fs');
const path = require('path');
const assert = require('assert');
const helper = require('think-helper');

const defaults = {
  oneWatcher: true, // 只有一个watcher
};

/**
 * @options
 *  - oneWatcher {boolean} default:true
*/
module.exports = (Application, appOptions = {}) => {
  return class extends Application {
    constructor(options = {}) {
      options = Object.assign(defaults, options);
      super(options);
      assert(options.ROOT_PATH, 'options.ROOT_PATH must be set');
      if (!options.DOC_PATH) {
        let docPath = path.join(options.ROOT_PATH, appOptions.OUT_PAth || 'docs/markdown');
        if (!options.docTranspiler && !helper.isDirectory(docPath)) {
          docPath = path.join(options.ROOT_PATH, 'src');
        }
        options.DOC_PATH = docPath;
      }
      this.options = Object.assign(this.options, options);
    }
    startWatcher() {
      if (!this.options.oneWatcher) {
        console.log('More than one watcher');
        super.startWatcher();
        this._newWater();
      } else {
        const Watcher = this.options.watcher;
        if (!Watcher) return;
        const instance = new Watcher({
          srcPath: path.join(this.options.ROOT_PATH, 'src'),
          diffPath: this.options.DOC_PATH
        }, fileInfo => {
          this._watcherDocCallBack(fileInfo);
          return this._watcherCallBack(fileInfo);
        });
        instance.watch();
      }
    }
    _newWater() {
      const Watcher = this.options.watcher;
      if (!Watcher) return;
      const instance = new Watcher({
        srcPath: path.join(this.options.ROOT_PATH, 'src'),
        diffPath: this.options.DOC_PATH
      }, fileInfo => this._watcherDocCallBack(fileInfo));
      instance.watch();
    }
    _watcherDocCallBack(fileInfo) {
      let docTranspiler = this.options.docTranspiler;
      if (docTranspiler) {
        if (!helper.isArray(docTranspiler)) {
          docTranspiler = [docTranspiler];
        }
        const ret = docTranspiler[0]({
          srcPath: fileInfo.path,
          outPath: this.options.DOC_PATH,
          file: fileInfo.file,
          options: docTranspiler[1]
        });
        if (helper.isError(ret)) {
          console.error(ret.stack);
          this.notifier(ret);
          return false;
        }
        if (think.logger) {
          think.logger.info(`doc transpile file ${fileInfo.file} success`);
        }
      }
    }
  };
};
