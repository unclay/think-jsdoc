## think-jsdoc
把js文件的注释提取到md文件中
主要用于生成api文档

## 方案
本扩展只是生成markdown文件，不做其他处理，展示方面可自由选择，本人选用docute配合展示

## 步骤

### 扩展thinkjs类
使thinkjs支持doc watcher

```js
const Application = require('thinkjs');
const jsdocExtend = require('think-jsdoc/extend');

const newApplication = jsdocExtend(Application, {
  OUT_PAth: 'docs' // 生成的文档目录，默认根目录/docs
});
```

### 实例化thinkjs类
```js
const jsdoc = require('think-jsdoc');

const instance = new newApplication({
  ...,
  docTranspiler: [jsdoc, {
    match: /^(controller|config|extend)/i // 只处理controller|config|extend三个目录的文件，支持函数
  }],
  oneWatcher: true // 只实例化一个watcher
});
```

## 解析条件
被解析到md文件里面的注释，必须是 /** 开头，*/ 结尾（前面只有两个*号）