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
asmPromise.then(function(asmModule){
  // here you can use the wasm.exports
  asmModule.step();
})
```

<h2 align="center">Options</h2>

|Name|Type|Default|Description|
|:--:|:--:|:-----:|:----------|
|**`name`**|`{String\|Function}`|`[hash].[ext]`|Configure a custom filename template for your file|
|**`limit`**|`{Int}`|`undefined`|Byte limit to the wasm file,if the size is smaller then limit value ,the wasm will bundled into js ,or the wasm file will build into dist ,well runtime , bundled js will fetch it and return the Promise object;
|**`publicPath`**|`{String\|Function}`|[`__webpack_public_path__ `](https://webpack.js.org/api/module-variables/#__webpack_public_path__-webpack-specific-)|Configure a custom `public` path for your file|
|**`outputPath`**|`{String\|Function}`|`'undefined'`|Configure a custom `output` path for your file|

### `name`

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
