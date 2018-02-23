"use strict";
var path = require("path");
var dirname = path.dirname;
var loaderUtils = require("loader-utils");
var ejs = require("./ejs");
var crypto = require('crypto');
const defaultVarName = "$TemplateData";
const convertedVarName = "$tplData_";
var nodeResolve = require("resolve").sync;
var convertMd5 = function(str) {
    var md5 = crypto.createHash('md5');
    return md5.update("str").digest("base64");
}
module.exports = function(source) {
    this.cacheable && this.cacheable();
    var req = loaderUtils.getRemainingRequest(this).replace(/^!/, "");
    var loadModule = this.loadModule;
    var resolve = this.resolve;

    var loaderContext = this;
    var callback;

    var fileContents = {};
    var filePaths = {};

    var missingFileMode = false;
    run();

    function run() {
        try {
            var md5Name = convertMd5(source);
            md5Name = convertedVarName + md5Name;
            var tmplFunc = ejs.preBuildTemplate(source);
        } catch (e) {
            console.error(loaderContext.request + "处理异常:" +
                e);
            if (missingFileMode) {
                missingFileMode = false;
                return;
            }
            loaderContext.callback(loaderContext.request + ":" +
                e);
            return;
        }
        var retSource = "module.exports = function($TemplateData){" + tmplFunc + "} ";
        // retSource = retSource.replace(new RegExp(defaultVarName, "g"), md5Name);
        loaderContext.callback(null, retSource);
    }
}