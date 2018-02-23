"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var assemblyscript_1 = require("assemblyscript");
var ts = require("typescript");
var fs = require("fs");
var wasmFooterPath = __dirname + '/wasmFooter.js';
var wasmFooter = fs.readFileSync(wasmFooterPath, 'utf-8');
var path =require("path");
const asc = require("assemblyscript/bin/asc.js");

function AssemblyScriptLiveLoader(source) {
    var jsModule;
    // var wasmModule;
    if (this.cacheable) {
        this.cacheable();
    }
    asc.main([
        path.relative(process.cwd(),this.resourcePath)
        ,
        // "./src/view/index/ass/test.ts",
        "-o", "myModule.wasm",
        "--optimize",
        "--validate",
        "--sourceMap"

      ], function(err) {
        if (err)
          throw err;
      });
    return createCompatibleModule(jsModule, wasmModule);
}
exports.default = AssemblyScriptLiveLoader;
