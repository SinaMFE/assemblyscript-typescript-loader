[![npm][npm]][npm-url]
[![node][node]][node-url]
[![deps][deps]][deps-url]
[![tests][tests]][tests-url]



assemblyscript-typescript-loader
=================


Loader for webpack to compile typescript with [AssemblyScript](https://github.com/AssemblyScript/assemblyscript) and bundle it to wasm or btyes string


<h2 align="center">Install</h2>

```bash
npm i assemblyscript-typescript-loader --save
```

<h2 align="center"><a href="#">Usage</a></h2>

**webpack.config.js**
```js
module.exports = {
  module: {
    rules: [
      {
            test: /\.ts?$/,
            loader: 'assemblyscript-typescript-loader',
            include:/assemblyscript/,//to avoid a conflict with other ts file who use 'ts-load',so you can division them with prop 'include'
            options: {
                limit: 1000,
                name: `static/assembly/[name].[hash:8].wasm`
            }
        }
    ]
  }
}

**assemblyscript/moduleEntry.ts**

```ts

var w: u32, // width
    h: u32, // height
    s: u32; // total size

/** Initializes width and height. */
export function init(w_: u32, h_: u32): void {
  w = w_;
  h = h_;
  s = w * h;
}

/** Performs one step. */
export function step(): void {
  var hm1 = h - 1,
      wm1 = w - 1;
  for (var y: u32 = 0; y < h; ++y) {
    var ym1 = select<u32>(hm1, y - 1, y == 0),
        yp1 = select<u32>(0, y + 1, y == hm1);
    for (var x: u32 = 0; x < w; ++x) {
      var xm1 = select<u32>(wm1, x - 1, x == 0),
          xp1 = select<u32>(0, x + 1, x == wm1);
      var n = (
        load<u8>(ym1 * w + xm1) + load<u8>(ym1 * w + x) + load<u8>(ym1 * w + xp1) +
        load<u8>(y   * w + xm1)                         + load<u8>(y   * w + xp1) +
        load<u8>(yp1 * w + xm1) + load<u8>(yp1 * w + x) + load<u8>(yp1 * w + xp1)
      );
      if (load<u8>(y * w + x)) {
        if (n < 2 || n > 3)
          store<u8>(s + y * w + x, 0);
      } else if (n == 3)
        store<u8>(s + y * w + x, 1);
    }
  }
}

```
**file.js**
```js
import asmPromise from "./assemblyscript/moduleEntry.ts";
asmPromise().then(function(asmModule){
  // here you can use the wasm.exports
  asmModule.step();
})
```

<h2 align="center">Options</h2>

[The loader supports some of the AS options here](https://github.com/AssemblyScript/assemblyscript/wiki/Using-the-compiler)

|Name|Type|Default|Description|
|:--:|:--:|:-----:|:----------|
|**`name`**|`{String\|Function}`|`[hash].[ext]`|Configure a custom filename template for your file|
|**`limit`**|`{Int}`|`undefined`|Byte limit to the wasm file,if the size is smaller then limit value ,the wasm will bundled into js ,or the wasm file will build into dist ,well runtime , bundled js will fetch it and return the Promise object;
|**`publicPath`**|`{String\|Function}`|[`__webpack_public_path__ `](https://webpack.js.org/api/module-variables/#__webpack_public_path__-webpack-specific-)|Configure a custom `public` path for your file|
|**`outputPath`**|`{String\|Function}`|`'undefined'`|Configure a custom `output` path for your file|
|inherited options from AS |
|**`optimize`**|`{String}`|`'-0'`|-O     Uses defaults. Equivalent to -O2s<br>-O0    Equivalent to --optimizeLevel 0<br>-O1    Equivalent to --optimizeLevel 1<br>-O2    Equivalent to --optimizeLevel 2<br>-O2s   Equivalent to --optimizeLevel 2 but with --shrinkLevel 1<br>-O2z   Equivalent to --optimizeLevel 2 but with --shrinkLevel 2<br>-O3    Equivalent to --optimizeLevel 3<br>-Oz    Equivalent to -O but with --shrinkLevel 2 and same as -O2z<br>-O3s   Equivalent to -O3 with --shrinkLevel 1<br>-O3z   Equivalent to -O3 with --shrinkLevel 2|
|**`optimizeLevel`**|`{Int}`|``| How much to focus on optimizing code. [0-3]|
|**`shrinkLevel`**|`{Int}`|``|How much to focus on shrinking code size. [0-2, s=1, z=2]|
|**`validate`**|`{Boolean}`|`false`|Validates the module using Binaryen. Exits if invalid.|
|**`sourceMap`**|`{Boolean}`|`false`|Enables source map generation. Optionally takes the URL used to reference the source map from the binary file.|
|**`debug`**|`{Boolean}`|`false`|Enables debug information in emitted binaries.|
|**`noTreeShaking`**|`{Boolean}`|`false`|Disables compiler-level tree-shaking, compiling everything.|
|**`noAssert`**|`{Boolean}`|`false`|Replaces assertions with just their value without trapping.|
|**`noEmit`**|`{Boolean}`|`false`|Performs compilation as usual but does not emit code.|
|**`importMemory`**|`{Boolean}`|`false`|Imports the memory instance provided by the embedder.|
|**`memoryBase`**|`{Int}`|`0`|Sets the start offset of compiler-generated static memory.|
|**`importTable`**|`{Boolean}`|`0`|Imports the function table instance provided by the embedder.|
|**`noLib`**|`{Boolean`|`false`|Does not include the shipped standard library.|
|**`lib`**|`{String}`|`0`|Adds one or multiple paths to custom library components and uses exports of all top-level files at this path as globals.|
|**`use`**|`{String}`|``|Aliases a global object under another name, e.g., to switch the default 'Math' implementation used: --use Math=JSMath|
|**`trapMode`**|`{String}`|``|Sets the trap mode to use. <br>allow  Allow trapping operations. This is the default.<br> clamp  Replace trapping operations with clamping semantics. <br>js     Replace trapping operations with JS semantics.|
|**`runPasses`**|`{String}`|``|Specifies additional Binaryen passes to run after other <br> optimizations, if any. See: Binaryen/src/passes/pass.cpp|
|**`enable`**|`{String}`|``|Enables additional (experimental) WebAssembly features.<br>sign-extension  Enables sign-extension operations<br>mutable-global  Enables mutable global imports and exports<br>bulk-memory     Enables fast bulk memory operations|
|**`transform`**|`{String}`|``|Specifies the path to a custom transform to 'require'.|
|**`measure`**|`{Int}`|`0`|Prints measuring information on I/O and compile times.|
|~~`binaryFile`~~|`{String}`|``|Specifies the binary output file (.wasm).|
|~~`textFile`~~|`{String}`|``|Specifies the text output file (.wat).|
|~~`asmjsFile`~~|`{String}`|``|Specifies the asm.js output file (.js).|
|~~`idlFile`~~|`{String}`|``|Specifies the WebIDL output file (.webidl).|
|~~`tsdFile`~~|`{String}`|``|Specifies the TypeScript definition output file (.d.ts).|
|~~`noColors`~~|`{Int}`|`0`|Disables terminal colors.|
### `{name}`

You can configure a custom filename template for your file using the query parameter `name`. For instance, to copy a file from your `context` directory into the output directory retaining the full directory structure, you might use

#### `{String}`

**webpack.config.js**
```js
{
  loader: 'assemblyscript-typescript-loader',
  options: {
    name: '[path][name].wasm'
  }
}
```

#### `{Function}`

**webpack.config.js**
```js
{
  loader: 'assemblyscript-typescript-loader',
  options: {
    name (file) {
      if (env === 'development') {
        return '[path][name].wasm'
      }
      return '[hash].wasm'
    }
  }
}
```
#### `placeholders`

|Name|Type|Default|Description|
|:--:|:--:|:-----:|:----------|
|**`[ext]`**|`{String}`|`file.extname`|The extension of the resource|
|**`[name]`**|`{String}`|`file.basename`|The basename of the resource|
|**`[path]`**|`{String}`|`file.dirname`|The path of the resource relative to the `context`|
|**`[hash]`**|`{String}`|`md5`|The hash of the content, hashes below for more info|
|**`[N]`**|`{String}`|``|The `n-th` match obtained from matching the current file name against the `regExp`|

#### `hashes`

`[<hashType>:hash:<digestType>:<length>]` optionally you can configure

|Name|Type|Default|Description|
|:--:|:--:|:-----:|:----------|
|**`hashType`**|`{String}`|`md5`|`sha1`, `md5`, `sha256`, `sha512`|
|**`digestType`**|`{String}`|`hex`|`hex`, `base26`, `base32`, `base36`, `base49`, `base52`, `base58`, `base62`, `base64`|
|**`length`**|`{Number}`|`9999`|The length in chars|

By default, the path and name you specify will output the file in that same directory and will also use that same URL path to access the file.


### `publicPath`

**webpack.config.js**
```js
{
  loader: 'assemblyscript-typescript-loader',
  options: {
    name: '[path][name].wasm',
    publicPath: 'assembly/'
  }
}
```

### `outputPath`

**webpack.config.js**
```js
{
  loader: 'assemblyscript-typescript-loader',
  options: {
    name: '[path][name].wasm',
    outputPath: 'assembly/'
  }
}
```




[npm]: https://img.shields.io/npm/v/assemblyscript-typescript-loader.svg
[npm-url]: https://npmjs.com/package/assemblyscript-typescript-loader

[node]: https://img.shields.io/node/v/assemblyscript-typescript-loader.svg
[node-url]: https://nodejs.org

[deps]: https://david-dm.org/SinaMFE/assemblyscript-typescript-loader.svg
[deps-url]: https://david-dm.org/SinaMFE/assemblyscript-typescript-loader

[tests]: http://img.shields.io/travis/SinaMFE/assemblyscript-typescript-loader.svg
[tests-url]: https://travis-ci.org/SinaMFE/assemblyscript-typescript-loader

[cover]: https://img.shields.io/codecov/c/github/SinaMFE/assemblyscript-typescript-loader.svg
[cover-url]: https://codecov.io/gh/SinaMFE/assemblyscript-typescript-loader

[chat]: https://badges.gitter.im/webpack/webpack.svg
[chat-url]: https://gitter.im/webpack/webpack
