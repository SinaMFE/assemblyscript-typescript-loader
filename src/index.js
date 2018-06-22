"use strict";
import fs from "fs";
import path from "path";
import asc from "assemblyscript/cli/asc.js";
import loaderUtils from "loader-utils";
import schema from "./options.bytes.json";
import schema4file from "./options.file.json";
import ts from "typescript";
import validateOptions from "schema-utils";

let wasmFooterPath = __dirname + "/wasmFooter.js";
let wasmFooter = fs.readFileSync(wasmFooterPath, "utf-8");

function transpile2Wasm(source, wasm) {
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
function transpile2Js(source) {
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
function createCompatibleModuleInBundle(transpiledJs, transpiledWasm) {
    var module = `
    function createWebAssemblyModulePromise (deps) {
      var p = new Promise(function(resolve){
        var compatibleModule;
                if (typeof WebAssembly !== 'undefined') {
                    ${transpiledWasm}
                    compatibleModule = WebAssemblyModule;

                }
                else {
                    ${transpiledJs}
                    compatibleModule = function() {};          compatibleModule.prototype.exports = exports;
                }
        resolve(compatibleModule().exports);;
      });
      return p
    }
    module.exports = createWebAssemblyModulePromise
    `;
    return module;
}

function createCompatibleModuleOutBundle(publicPath) {
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
function mkDirsSync(dirname) {
    if (fs.existsSync(dirname)) {
      return true;
    } else {
      if (mkDirsSync(path.dirname(dirname))) {
        fs.mkdirSync(dirname);
        return true;
      }
    }
  }
export default function loader(source) {
    var innerCallback = this.async();
    const options = loaderUtils.getOptions(this) || {};
    validateOptions(schema, options, "AssemblyScript-TypeScript Buffer Loader");
    if (this.cacheable) {
        this.cacheable();
    }
    var me = this;
    var targetPath = this._compiler.outputPath;
    var buildTempPath = path.join(this._compiler.context, "/temp/assembly/");
    targetPath = path.join(
        buildTempPath,
        path.parse(this.resourcePath).name + ".wasm"
    );
    mkDirsSync(buildTempPath);
    asc.main(
        [
            path.relative(process.cwd(), this.resourcePath),
            "-o",
            path.relative(process.cwd(), targetPath),
            "--optimize",
            "--validate",
            "--sourceMap"
        ],
        function(err) {
            if (err) throw err;
            var distStates = fs.statSync(targetPath);
            var distFile = fs.readFileSync(targetPath);
            // Options `dataUrlLimit` is backward compatibility with first loader versions
            var limit =
                options.limit ||
                (me.options && me.options.url && me.options.url.dataUrlLimit);
            if (limit) {
                limit = parseInt(limit, 10);
            }
            // var mimetype = options.mimetype || options.minetype || mime.lookup(this.resourcePath)
            if (!limit || distStates.size < limit) {
                me.addDependency(wasmFooterPath);
                var jsModule = transpile2Js(source);
                var wasmModule = transpile2Wasm(source, new Buffer(distFile));
                return innerCallback(
                    null,
                    createCompatibleModuleInBundle(jsModule, wasmModule)
                );
            } else {
                validateOptions(
                    schema4file,
                    options,
                    "AssemblyScript-TypeScript File Loader"
                );
                const url = loaderUtils.interpolateName(me, options.name, {
                    me,
                    content: distFile
                });
                var filePath = me.resourcePath;
                let outputPath = url;

                if (options.outputPath) {
                    if (typeof options.outputPath === "function") {
                        outputPath = options.outputPath(url);
                    } else {
                        outputPath = path.posix.join(options.outputPath, url);
                    }
                }

                if (options.useRelativePath) {
                    const filePath = this.resourcePath;

                    const issuerContext =
                        context ||
                        (me._module &&
                            me._module.issuer &&
                            me._module.issuer.context);

                    const relativeUrl =
                        issuerContext &&
                        path
                            .relative(issuerContext, filePath)
                            .split(path.sep)
                            .join("/");

                    const relativePath =
                        relativeUrl && `${path.dirname(relativeUrl)}/`;
                    // eslint-disable-next-line no-bitwise
                    if (~relativePath.indexOf("../")) {
                        outputPath = path.posix.join(
                            outputPath,
                            relativePath,
                            url
                        );
                    } else {
                        outputPath = path.posix.join(relativePath, url);
                    }
                }

                var publicPath = `__webpack_public_path__ + ${JSON.stringify(
                    url
                )}`;
                if (options.publicPath !== undefined) {
                    // support functions as publicPath to generate them dynamically
                    publicPath = JSON.stringify(
                        typeof options.publicPath === "function"
                            ? options.publicPath(url)
                            : options.publicPath + url
                    );
                }
                if (options.emitFile === undefined || options.emitFile) {
                    me.emitFile(outputPath, distFile);
                }
                innerCallback(null, createCompatibleModuleOutBundle(publicPath));
                return;
            }
        }
    );
}
