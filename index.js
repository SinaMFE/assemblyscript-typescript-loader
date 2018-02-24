'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
var assemblyscript_1 = require('assemblyscript')
var ts = require('typescript')
var fs = require('fs')
var path = require('path')
const asc = require('assemblyscript/bin/asc.js')
var wasmFooterPath = __dirname + '/wasmFooter.js'
var wasmFooter = fs.readFileSync(wasmFooterPath, 'utf-8')
function _interopRequireDefault (obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _loaderUtils = require('loader-utils')

var _loaderUtils2 = _interopRequireDefault(_loaderUtils)
function mkdirsSync (dirname) {
  if (fs.existsSync(dirname)) {
    return true
  } else {
    if (mkdirsSync(path.dirname(dirname))) {
      fs.mkdirSync(dirname)
      return true
    }
  }
}

var loaderUtils = require('loader-utils')
var validateOptions = require('schema-utils')

var mime = require('mime')

function AssemblyScriptLiveLoader (source) {
  var options4me =  loaderUtils.getOptions(this) || {};
  var innerCallback = this.async()
  validateOptions(require('./options'), options4me, 'URL Loader')
  if (this.cacheable) {
    this.cacheable()
  }
  var me=this;
  var targetPath = this._compiler.outputPath;

  targetPath = path.join(targetPath, '/static/' + path.parse(this.resourcePath).name + '.wasm');
  mkdirsSync(path.join( this._compiler.outputPath, '/static/'));
  asc.main([
    path.relative(process.cwd(), this.resourcePath),
    // "./src/view/index/ass/test.ts",
    '-o', path.relative(process.cwd(), targetPath),
    '--optimize',
    '--validate',
    '--sourceMap'
  ], function (err) {
    if (err)
      throw err
    var distStates = fs.statSync(targetPath)
    var distFile = fs.readFileSync(targetPath); 
    // Options `dataUrlLimit` is backward compatibility with first loader versions
    var limit = options4me.limit || (this.options && this.options.url && this.options.url.dataUrlLimit)
    if(limit) {
        limit = parseInt(limit, 10)
    }
    // var mimetype = options.mimetype || options.minetype || mime.lookup(this.resourcePath)
    if(!limit || distStates.size < limit) {
        me.addDependency(wasmFooterPath)
        var jsModule = createJsModule(source)
        var wasmModule = createWasmModule(source,new Buffer(distFile))
        return innerCallback(null,createCompatibleModule(jsModule, wasmModule));
    }
    else{
        var _options = require('./options.file.json');
var _schemaUtils = require('schema-utils');
        
        var _options2 = _interopRequireDefault(_options);
var _schemaUtils2 = _interopRequireDefault(_schemaUtils);
        (0, _schemaUtils2.default)(_options2.default, options4me, 'File Loader');
        
        // var context = options4me.context || this.rootContext || this.options && this.options.context;
        var url = _loaderUtils2.default.interpolateName(me, options4me.name, {
            me,
            content:distFile,
            regExp: options4me.regExp
        });
        var outputPath = '';

        if (options4me.outputPath) {
          // support functions as outputPath to generate them dynamically
          outputPath = typeof options4me.outputPath === 'function' ? options4me.outputPath(url) : options4me.outputPath;
        }
      
        var filePath = me.resourcePath;
      
        if (options4me.useRelativePath) {
          var issuerContext = this._module && this._module.issuer && this._module.issuer.context || context;
      
          var relativeUrl = issuerContext && _path2.default.relative(issuerContext, filePath).split(_path2.default.sep).join('/');
      
          var relativePath = relativeUrl && `${_path2.default.dirname(relativeUrl)}/`;
          // eslint-disable-next-line no-bitwise
          if (~relativePath.indexOf('../')) {
            outputPath = _path2.default.posix.join(outputPath, relativePath, url);
          } else {
            outputPath = relativePath + url;
          }
      
          url = relativePath + url;
        } else if (options4me.outputPath) {
          // support functions as outputPath to generate them dynamically
          outputPath = typeof options4me.outputPath === 'function' ? options4me.outputPath(url) : options4me.outputPath + url;
          url = outputPath;
        } else {
          outputPath = url;
        }
        var publicPath = `__webpack_public_path__ + ${JSON.stringify(url)}`;
        if (options4me.publicPath !== undefined) {
          // support functions as publicPath to generate them dynamically
          publicPath = JSON.stringify(typeof options4me.publicPath === 'function' ? options4me.publicPath(url) : options4me.publicPath + url);
        }
        if (options4me.emitFile === undefined || options4me.emitFile) {
          me.emitFile(outputPath, distFile);
        }
        innerCallback(null,createCompatibleModule4File(publicPath));
        return;
    }
  })
}
exports.default = AssemblyScriptLiveLoader

function createWasmModule (source, wasm) {
  var length = wasm.length
  var buffer = []
  for (var i = 0; i < length; i += 1) {
    buffer.push(wasm[i])
  }
  var module = 'var buffer = new ArrayBuffer(' + wasm.length + ');\n        var uint8 = new Uint8Array(buffer);\n        uint8.set([' + buffer.join(',') + ']);\n        ' + wasmFooter
  return module
}
function createJsModule (source) {
  var compilerOptions = {
    compilerOptions: {
      target: ts.ScriptTarget.ES5,
      module: ts.ModuleKind.CommonJS,
      alwaysStrict: false
    }
  }
  var transpiled = ts.transpileModule(source, compilerOptions)
  return transpiled.outputText
}
function createCompatibleModule (jsModule,wasmModule) {
  var module = `
  var p = new Promise(function(resolve){
    var compatibleModule;
            if (typeof WebAssembly !== 'undefined') {
                ${wasmModule}  
                compatibleModule = WebAssemblyModule;
            } 
                    else {          
                ${jsModule}
                compatibleModule = function() {};          compatibleModule.prototype.exports = exports;  
            }
    resolve(compatibleModule().exports);; 
  });
  module.exports =p;`
  return module;
}

function createCompatibleModule4File (publicPath) {
    return `
    var f=fetch(${publicPath}).then(function(response){
        return response.arrayBuffer();
    }).then(function(binary){
            var module = new WebAssembly.Module(binary);
            var instance = new WebAssembly.Instance(module, { env: { abort: function() {} } });
            return instance.exports;
    });
    module.exports =f;
        `;
  }