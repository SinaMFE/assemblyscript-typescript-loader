var fs = require("fs");
var path = require("path");
var ts = require("typescript");
var wasmFooterPath = __dirname + "/wasmFooter.js";
var wasmFooter = fs.readFileSync(wasmFooterPath, "utf-8");

function mkdirsSync(dirname) {
  if (fs.existsSync(dirname)) {
    return true;
  } else {
    if (mkdirsSync(path.dirname(dirname))) {
      fs.mkdirSync(dirname);
      return true;
    }
  }
}

function createWasmModule(source, wasm) {
  var length = wasm.length;
  var buffer = [];
  for (var i = 0; i < length; i += 1) {
    buffer.push(wasm[i]);
  }
  var module =
    "var buffer = new ArrayBuffer(" +
    wasm.length +
    ");\n        var uint8 = new Uint8Array(buffer);\n        uint8.set([" +
    buffer.join(",") +
    "]);\n        " +
    wasmFooter;
  return module;
}
function createJsModule(source) {
  var compilerOptions = {
    compilerOptions: {
      target: ts.ScriptTarget.ES5,
      module: ts.ModuleKind.CommonJS,
      alwaysStrict: false
    }
  };
  var transpiled = ts.transpileModule(source, compilerOptions);
  return transpiled.outputText;
}
function createCompatibleModule(jsModule, wasmModule) {
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
    module.exports =p;`;
  return module;
}

function createCompatibleModule4File(publicPath) {
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

module.exports = {
  mkdirsSync,createWasmModule,createJsModule,createCompatibleModule,createCompatibleModule4File
};
