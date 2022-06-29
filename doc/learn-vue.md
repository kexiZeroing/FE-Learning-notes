## 项目是怎么跑起来的
### 项目属于多页应用，这里面有很多子项目（`pages/`）
- 目录结构参考 http://vuejs-templates.github.io/webpack/
- 在 webpack 配置的 entry 里可以看到这些子项目入口（有的是列举出所有的入口 js 文件，有的是通过遍历 `src/pages` 得到所有入口），entry 的 base 路径可以由 context 字段指定
- 对于每一个 page，都有对应的 `HtmlWebpackPlugin` 指定它的模板，并注入它需要的 chunks （对应每一个 entry 打包出的 js），本地直接通过 `localhost/xx.html` 访问，线上通过配置 nginx 路由映射访问 `try_files $uri /static/xx.html`
  - 指定 `chunks` 是因为项目是多 entry 会生成多个编译后的 js 文件，chunks 决定使用哪些 js 文件，如果没有指定默认会全部引用
  - `inject` 值为 true，表明 chunks js 会被注入到 html 文件的 body 底部（默认会在 head 中以 script defer 标签引入）
  - 使用 `mini-css-extract-plugin` 产出的 CSS 文件会在 head 中以 link 标签引入
  - html 模板可以使用 ejs 语法，如果不指定模板，默认的模板可以在 node_modules 中找到这个插件，里面有一个 `default_index.ejs`
  - production 情况下，`minify` 选项是默认存在的（会使用 html-minifier-terser 插件，去掉空格、注释等），如果想定制化选项，可以自己传 minify 对象，它不会和默认选项合并在一起
- 每一个 page 里的 js 文件（入口文件）会创建该子项目的 Vue 实例，指定对应的 component, router, store, 同时会把 `jQuery`, `request`, `API`, `i18n` 这些对象挂载在 window 对象上，子组件不需要引用，直接使用。
- 每一个 page 有对应的 `router/`，这是子项目的路由，而且每个路由加载的 component 都是异步获取，在访问该路由时按需加载
- webpack 打包时（`dist/`）会 emit 出所有 HtmlWebpackPlugin 生成的 html 文件（这也是浏览器访问的入口），相对每个 entry 打包出的 js 文件（filename, `js/[name].[chunkhash].js`），所有异步加载的组件 js（chunkFilename, `js/[id].[chunkhash].js'`）
- 图片、音乐、字体等资源的打包处理使用 `url-loader` 结合 `limit` 的设置，生成 `img/[name].[hash:7].[ext]` 这样的文件。
- `performance` 属性用来设置当打包资源和入口文件超过一定的大小给出的提示，可以分别设置它们的上限和哪些文件被检查。
- webpack 设置请求代理 proxy，默认情况下假设前端是 localhost:3000，后端是 localhost:8082，那么后端通过 request.getHeader("Host") 获取的依旧是 localhost:3000。如果设置了 `changeOrigin: true`，那么后端才会看到的是 localhost:8082, 代理服务器会根据请求的 target 地址修改 Host（这个在浏览器里看请求头是看不到改变的）。
- 老项目（vue 1.x + webpack 1.x）是纯单页应用，单一的入口文件 `index.js`，里面有路由的配置，需要的模块懒加载。这里面也有很多独立的宣传页，结合 `HtmlWebpackPlugin` 生成纯静态页面。

### 本地 build 与上线 build
1. 公共组件库 C 需要先 build，再 `npm link` 映射到全局的 node_modules，然后被其他项目 `npm link C` 引用。
2. 项目 A 的上线脚本中会先进入组件库 C，执行 `npm build` 和 `npm link`，之后再进入项目 A 本身，执行 `npm link C`，`npm build` 等项目本身的构建。
3. 项目 C 会在本地构建（静态资源传七牛），远程仓库中包括 `server-static` 存放 build 后的静态文件，它的上线脚本里并不含构建过程，只是在拷贝仓库中的 `server-static` 目录。因为源文件中会有对组件库的引用 `import foo from 'C/dist/foo.js`，本地 build 时组件库已经被打包进去。

### 网页版显示的逻辑
- 项目 xpc 和 xh5 都部署在同一个域名下，本地运行 xpc 项目，所有的请求都会走代理，所以即便是 xh5 的页面也可以被访问到。
- 请求 `/web?old=1` (走代理) 后端会返回 html 扫码登录页面，这里面有一个 `/static/vue/login.js?_dt=xxxxx`，里面有登录和加载网页版首页的逻辑，这样就会展示出 xh5 中的页面，其中的 iframe 可以嵌套任意 xpc 或 xh5 中的页面（只要有路由支持），这个 iframe 的链接自然也可以被单独访问。
- xh5 发起的第一次页面请求是走服务器，后端返回一个模板 html，这里面有一个 app 元素是 Vue 挂载的地方，前端通过一个老的 vue router API `router.start(App, 'app')` 创建 vue 实例并进行挂载（https://github.com/vuejs/vue-router/blob/1.0/docs/en/api/start.md），这之后才会被前端路由接管。而且这个 html 里面有只能在手机端访问 xh5 项目（根据 ua），否则会跳到 web 端的逻辑。
- xh5 项目的路由在 production 环境下设置 `/v/index` 作为 root。
- 如果某个接口 404，就是它的路径没有配置代理。

```py
# urls.py
from xxx import v_views as foo

# django syntax
urlpatterns = [
  url(r'^v/index', foo.index),
  url(r'^web', foo.web),
]

# view.py
response = render_to_response('bar/baz.html', context)

# Import FE scripts in templates/bar/baz.html
# <script src="/static/qux.js?_dt={{timestamp}}"></script>
```

```js
// qux.js
var isInIframe = window.frames.length !== parent.frames.length;
var ua = window.navigator.userAgent;
      
if (!isInIframe && !ua.toLowerCase().match(/micromessenger|android|iphone/i)) {
  window.location.href = '/web/?next=' + window.location.pathname;
} 
```

### 登录逻辑
- 二维码登录使用 websocket 连接，message 中定义不同的 `op` 代表不同的操作，比如 requestlogin 会返回微信生成的二维码(ticket), 扫码成功返回类型是 loginsuccess，并附带 OpenID, UnionID, Name, UserID, Auth 等信息，前端拿到这些信息可以请求后端登录接口，拿到 sessionid，并被种在 cookie 里。
- 账密登录，前端使用 [JSEncrypt](http://travistidwell.com/jsencrypt/) 给密码加密并请求后端登录接口，成功的话后端会把 sessionid 种在 cookie 里。

> 常规的扫码登录原理（涉及 PC 端、手机端、服务端）：
> 1. PC 端携带设备信息向服务端发起生成二维码的请求，生成的二维码中封装了 uuid 信息，并且跟 PC 设备信息关联起来，二维码有失效时间。PC 端轮询检查是否已经扫码登录。
> 2. 手机（已经登录过）进行扫码，将手机端登录的信息凭证（token）和二维码 uuid 发送给服务端，此时的手机一定是登录的，不存在没登录的情况。服务端生成一个一次性 token 返回给移动端，用作确认时候的凭证。
> 3. 移动端携带上一步的临时 token 确认登录，服务端校对完成后，会更新二维码状态，并且给 PC 端一个正式的 token ，后续 PC 端就是持有这个 token 访问服务端。

> 常规的密码存储：
> 如果直接对密码进行散列后存储，那么黑客可以对一个已知密码进行散列，然后通过对比散列值可以知道使用特定密码的用户有哪些。密码加盐可以一定程度上解决这一问题，salt 值是由系统随机生成的，并且只有系统知道，即便两个用户使用了同一个密码，由于系统为它们生成的 salt 值不同，他们的散列值也是不同的。将 salt 值和用户密码连接到一起，对连接后的值进行散列，把这个散列值和它对应的 salt 值都要存到数据库中，用于登录时校验匹配。

### 微信网页授权
申请公众号/小程序的时候，都有一个 APPID 作为当前账号的标识，**OpenID** 就是用户在某一公众平台下的标识（用户微信号和公众平台的 APPID 两个数据加密得到的字符串）。如果开发者拥有多个应用，可以通过获取用户基本信息中的 **UnionID** 来区分用户的唯一性，因为同一用户，在同一微信开放平台下的不同应用，UnionID 应是相同的，代表同一个人，当然前提是各个公众平台需要先绑定到同一个开放平台。OpenID 同一用户同一应用唯一，UnionID 同一用户不同应用唯一，获取用户的 OpenID 是无需用户同意的，获取用户的基本信息则需要用户同意。

向用户发起授权申请，即打开如下页面：
https://open.weixin.qq.com/connect/oauth2/authorize?appid=APPID&redirect_uri=REDIRECT_URI&response_type=code&scope=SCOPE&state=STATE#wechat_redirect

1. `appid` 是公众号的唯一标识。
2. `redirect_uri` 替换为回调页面地址，用户授权完成后，微信会帮你重定向到该地址，并携带相应的参数如 `code`，回调页面所在域名必须与后台配置一致。
3. `scope` 根据业务需要选择 `snsapi_base` 或 `snsapi_userinfo`。其中 `snsapi_base` 为静默授权，不弹出授权页面，直接跳转，只能获取用户的 `openid`，而 `snsapi_userinfo` 会弹出授权页面，需要用户同意，但无需关注公众号，可在授权后获取用户的基本信息。
4. `state` 不是必须的，重定向后会带上 `state` 参数，开发者可以填写 a-zA-Z0-9 的参数值，最多 128 字节。
5. 如果用户同意授权，页面将跳转至 `redirect_uri/?code=CODE&state=STATE`，`code` 作为换取 `access_token` 的票据，每次用户授权带上的 `code` 不一样。
6. 获取 `code` 后，请求 https://api.weixin.qq.com/sns/oauth2/access_token?appid=APPID&secret=SECRET&code=CODE&grant_type=authorization_code 获取 `access_token` 和 `openid` (未关注公众号时，用户访问公众号的网页，也会产生一个唯一的 openid)。
7. 如果网页授权作用域为 `snsapi_userinfo`，则此时可以请求 https://api.weixin.qq.com/sns/userinfo?access_token=ACCESS_TOKEN&openid=OPENID&lang=zh_CN 拉取用户信息。
8. 公众号的 `secret` 和获取到的 `access_token` 安全级别都非常高，必须只保存在服务器，不允许传给客户端。后续刷新 `access_token` 以及通过 `access_token` 获取用户信息等步骤，也必须从服务器发起。

> 微信公众平台接口测试帐号申请: https://mp.weixin.qq.com/debug/cgi-bin/sandbox?t=sandbox/login

### 唤起小程序
微信外网页通过小程序链接 URL Scheme，微信内通过微信开放标签，且微信内不会直接拉起小程序，需要手动点击按钮跳转。这是官方提供的一个例子 https://postpay-2g5hm2oxbbb721a4-1258211818.tcloudbaseapp.com/jump-mp.html 可以用手机浏览器查看效果，直接跳转小程序。
  - 使用微信开放标签 `<wx-open-launch-weapp>`，提供要跳转小程序的原始 ID 和路径，标签内插入自定义的 html 元素。开放标签会被渲染成一个 iframe，所以外部的样式是不会生效的。另外在开放标签上模拟 click 事件也不生效，即不可以在微信内不通过点击直接跳转小程序。可以监听 `<wx-open-launch-weapp>` 元素的 `launch` 事件，用户点击跳转按钮并对确认弹窗进行操作后触发。
  - 通过[服务端接口](https://developers.weixin.qq.com/miniprogram/dev/api-backend/open-api/url-scheme/urlscheme.generate.html)或在小程序管理后台的「工具」入口可以获取打开小程序任意页面的 URL Scheme。适用于从短信、邮件、微信外网页等场景打开小程序。

### 后端模板
有些 url 请求是后端直出页面返回 html，通过类似 `render_to_response(template, data)` 的方法，将数据打到模板 html 中，模板里会引用 `course_meta/static/js` 路径下的 js 文件，这些 js 使用 require 框架，导入需要的其他 js 文件或 tpl 模板，再结合业务逻辑使用 underscore 的 template 方法（`_.template(xx)`）可以将 tpl 渲染为 html，然后被 jquery `.html()` 方法插入到 DOM 中。

### 本地 build 脚本
1. 使用 [ora](https://www.npmjs.com/package/ora) 做 spinner，提示 building for production...
2. 使用 [rimraf](https://www.npmjs.com/package/rimraf) 删除打包路径下的资源 (`rimraf` command is an alternative to the Linux command `rm -rf`)
3. 调用 `webpack()` 传入配置 `webpack.prod.conf` 和一个回调函数，**webpack stats 对象** 作为回调函数的参数，可以通过它获取到 webpack 打包过程中的信息，使用 `process.stdout.write(stats.toString(...))` 输出到命令行中 (`console.log` in Node is just `process.stdout.write` with formatted output)
4. 使用 [chalk](https://www.npmjs.com/package/chalk) 在命令行中显示一些提示信息

### 关于 Vue 不同的构建版本
Vue npm 包有不同的 Vue.js 构建版本，可以在 `node_modules/vue/dist` 中看到它们，这里大致包括完整版、编译器（编译template）、运行时（创建 Vue 实例/渲染/处理虚拟 DOM）、UMD 版本（通过 `<script>` 标签直接用在浏览器中）、CommonJS 版本（用于很老的打包工具）、ES Module 版本（有两个，分别用于现代打包工具和浏览器 `<script type="module">` 直接导入）。如果要用完整版，则需要在打包工具里配置一个 resolve.alias 别名 `'vue$': 'vue/dist/vue.esm.js`，这样引入的 Vue 是基于构建工具使用的版本。

```js
// 需要编译器
new Vue({
  template: '<div>{{ hi }}</div>'
})

// 不需要编译器
new Vue({
  render (h) {
    return h('div', this.hi)
  }
})
```


## webpack 配置
Webpack 5 Crash Course: https://www.youtube.com/watch?v=IZGNcSuwBZs 

### export a function
Besides exporting a single configuration object, you can export a function from your webpack config. The function will be invoked with two arguments `env` and `argv` (i.e. webpack --env production)
```js
module.exports = function(env, argv) {
  return {
    mode: env.production ? 'production' : 'development',
    // ...
  };
};
```

### filename 和 chunkFilename
- `filename` 是对应于 entry 里面的输入文件，经过打包后输出文件的名称。`chunkFilename` 指未被列在 entry 中，却又需要被打包出来的 chunk 文件的名称，一般是要懒加载的代码。
- `output.filename` 的输出文件名是 `[name].[chunkhash].js`，`[name]` 根据 entry 的配置推断为 index，所以输出为 `index.[chunkhash].js`。`output.chunkFilename` 默认使用 `[id].js`, 会把 `[name]` 替换为 chunk 文件的 id 号。
- `chunkhash` 根据不同的入口文件构建对应的 chunk，生成对应的哈希值，来源于同一个 chunk，则 hash 值就一样。

### resolve
- extensions 数组，在 import 不带文件后缀时，webpack 会自动带上后缀去尝试访问文件是否存在，默认值 `['.js', '.json', '.wasm']`
- mainFiles 设置解析目录时要使用的文件名，默认值 `['index']`
- alias 配置别名，把导入路径映射成一个新的导入路径，比如 `"@": path.join(__dirname, 'src')`
- modules 数组，tell webpack what directories should be searched when resolving modules, 默认值 `['node_modules']`，即从 node_modules 目录下寻找。

### dev server 监听
1. In the context of servers, `0.0.0.0` means "all IP addresses on the local machine". If a host has two IP addresses, `192.168.1.1` and `10.1.2.1`, and a server running on the host listens on `0.0.0.0`, it will be reachable at both of those IPs.
2. Want to access webpack-dev-server from the mobile in local network: run webpack-dev-server with `--host 0.0.0.0`, which lets the server listen for requests from the network, not just localhost.
3. Chrome won't access `http://0.0.0.0:8089` (tried Safari can open). It's not the IP, it just means it is listening on all the network interfaces, so you can use any IP the host has.

### webpack in development
There are different options available in webpack that help you automatically compile your code whenever it changes: `watch mode`, `webpack-dev-server`, `webpack-dev-middleware`.
- `webpack --watch` doesn't exit the command line and the files will be recompiled whenever they change (每一次都生成新的 dist), but you have to refresh your browser in order to see the changes.
- `webpack-dev-server` doesn't write any output files after compiling. Instead, it keeps bundle files in memory and serves them as if they were real files mounted at the server's root path.
- `webpack-dev-middleware` is an express-style development middleware that will emit files processed by webpack to a server. This is used in `webpack-dev-server` internally.

### output path and devServer path
- `output.path` 是 build 打包后的产出目录
- `output.publicPath` 是 index.html 内对资源的引用路径，按照“域名 + publicPath + filename”引用文件
- `devServer.publicPath` 是本地开启服务的路径（资源存在的路径）The bundled files will be available in the browser under this path.
- `devServer.contentBase` It's only needed if you want to serve static files (that you don't want to run them through the bundle but they need to be available for the app.) It is recommended to use an absolute path. For example, set `contentBase: path.join(__dirname, 'movies')` and use  `<video src="/movies/foo.mp4">` in the html.
- devServer 的设置既可以通过 webpack config 文件，也可以通过 CLI 给 `webpack serve` 加参数。设置开启热更新 HMR (hot)、指定端口 (port)、serve 的文件开启 gzip 压缩 (compress)、设置代理解决开发中的跨域问题 (proxy) 等。

### devtool 选项配置 source map 
`devtool` option controls if and how source maps are generated, e.g., `devtool: 'source-map'`

- 省略 devtool 选项即不生成 source map
- `eval` 会把每个 module 封装到 eval 里包裹起来执行，并且会在每个 module 末尾追加注释 `// #sourceURL=webpack://...`
- `source-map` 会生成一个单独的 sourceMap 文件，在 bundle 最后添加 `// #sourceMappingURL=xxx.js.map` （sourceMap 文件不应该部署到服务器，只用于错误报告工具）
- `hidden-source-map` 生成 sourceMap 文件，但不会在 bundle 末尾添加引用注释（不想为浏览器开发工具暴露你的 sourceMap）
- `inline-source-map` 不生成单独的文件，sourceMap 作为 DataUrl 的形式被内嵌进了 bundle 中，使得 bundle 文件会变得很大
- `cheap-source-map` 和使用 source-map 生成的结果差不多，但它生成的 map 文件内容比 source-map 生成的要少，没有列信息

### css-loader
- `css-loader` 用来解析 `@import`, `url()`, `@media`, 比如 `url()` 会被转为 `require()`
- 默认情况下，`css-loader` 生成使用 esModule 语法的模块，这样在引入图片时需要用 `url().default`（也可以用 `import xxx from 'xx.jpg'` 相当于是 default import），或者可以给 `css-loader` 设置 `esModule: false` 改为产出 commonJS 模块。
- 在生产环境下推荐使用 `mini-css-extract-plugin` 将 CSS 从 bundle 中分离出来，CSS 和 JS 可以被并行加载。对于开发（包括 webpack-dev-server），可以使用 `style-loader`，它会用多个标签将 CSS 插入到 DOM 中，响应会更快。但不要同时使用 `style-loader` 和 `mini-css-extract-plugin`。

### ts-loader and @babel/preset-typescript
- `ts-loader` converts typescript (es6) to javascript (es6), internally call `tsc` to convert everything to `.js` files. Type-safety at build time but no polyfills.
- `@babel/preset-typescript` does code transforms, the build step becomes fast as it skips the type-checking step and just strips out the all the TypeScript type-annotations – converting it to vanilla JS. No type-safety at build time.
- Type check first, then run webpack `"build": "tsc && webpack"`

### Load images
Webpack goes through all the `imported` and `required` files in your project, and for all those files which have a `.png|.jpg|.gif` extension, it uses as an input to the webpack `file-loader`. For each of these files, the file loader emits the file in the output directory and resolves the correct URL to be referenced. Note that this config only works for webpack 4, and Webpack 5 has deprecated the `file-loader`. If you are using webpack 5 you should change `'file-loader'` to `'asset/resource'`.

By default, `file-loader` renames each file it process to a filename with random characters. Then it puts the file in the root of the output folder. We can change both the file name of the processed files and the output folder. We do that in an `options` section.
```js
module: {
  rules: [
    {
      test: /\.png$/,
      loader: 'file-loader',
      options: {
        name: '[name].[ext]', // keeps the original file names
        outputPath: 'images'  // outputs all processed files in a subfolder called images
      }
    }
  ]
}
```

Webpack 4 also has the concept `url-loader`. It first base64 encodes the file and then inlines it. It will become part of the bundle. That means it will not output a separate file like `file-loader` does. If you are using webpack 5, then `url-loader` is deprecated and instead, you should use `asset/inline`.

### extract-text-webpack-plugin
- 打包样式，一种是使用 `style-loader` 将生成的 style 标签并且插入到 head 里，另一种是使用  `extract-text-webpack-plugin`，将样式文件单独打包并指定生成的 filename，它需要同时配置 loader 和 plugin 两个地方。
- Since webpack v4 the `extract-text-webpack-plugin` should not be used for css. Use `mini-css-extract-plugin` instead.
- 插件 plugin 其实是一个 Class，需要引入类，然后 `new` 使用。

### copy-webpack-plugin
- `copy-webpack-plugin` 用来把那些已经在项目目录中的文件（比如 `public/`）拷贝到打包后的产出中（比如 `dist/`），这些文件不需要 build，不需要 webpack 的处理。
- 拷贝的目标路径有默认值是 webpack 打包产出的 output 路径。另外可以使用 `ignore: ["**/file.*", "**/ignored-directory/**"]` 这样的语法忽略一些文件不进行拷贝。

### webpack.DefinePlugin
- The DefinePlugin allows you to create global constants which can be configured at compile time. 比如前端本身是访问不到 `process.env` 的，通过该插件定义全局常量后，在前端的 js 代码中可以利用类似 `process.env.NODE_ENV` 的值区分环境。
- 这个插件的替换只是对 bundle 代码的处理，并不影响 node 代码，比如 webpack config 文件中依然访问不到这些常量，仍然需要在执行命令时设置环境变量，默认直接 console `process.env` 中是没有 `NODE_ENV` 属性的。
- 通过它定义的常量，是文本直接替换，因此字符串值需要包含实际的引号，使用 `'"production"'` 或者 `JSON.stringify('production')`

### webpack-merge
For the start script, which runs `webpack-dev-server`, we will use `webpack.dev.js`, and for the build script, which runs `webpack`, we will use `webpack.prod.js`. While we separate the production and development configurations, we'll still maintain a "common" configuration `webpack.common.js` to keep things DRY. In order to merge these configurations together, we'll use a utility called `webpack-merge`. It provides a merge function that concatenates arrays and merges objects creating a new object.

### webpack-bundle-analyzer
It will create an interactive treemap visualization of the contents of all your bundles when you build the application.
```js
// https://github.com/webpack-contrib/webpack-bundle-analyzer
// npm install --save-dev webpack-bundle-analyzer
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin()
  ]
}
```

### Code split vendors
Your dependencies usually do not change as often as your production code. With code splitting, you can split your dependencies into a separate bundle. This bundle can be cached by your user’s browser for longer periods than your production code bundle.

With the [SplitChunksPlugin](https://webpack.js.org/plugins/split-chunks-plugin) we can split up a chunk into smaller chunks. *(A chunk is code which will break apart from main bundle and form it’s own file known as chunk file.)* This plugin is pretty smart and out-of-the-box it will split chunks where the plugin thinks it makes sense. Everything under `optimization.splitChunks` is the configuration for `SplitChunksPlugin`.

## 路由相关
- 使用 `vue-router 3.x`，由于 VueRouter 是 default export 只有一个，所以在引入时可以任意起名字。
- 创建 Vue 时配置 router 参数传入一个 Router 实例。构建 Router 实例，路由有两种模式 hash 和 history，这里在 prod 使用 history mode，dev 使用 hash mode，`fallback` 属性的含义是当浏览器不支持 `history.pushState` 是否回退到 hash 模式，默认为 true。
- 嵌套路由配置 children，组件内 `this.$route` 可以访问到 params, query, hash，匹配多个路由时优先级就按照路由的定义顺序
- 每一个 route 有名字，在跳转时可以指定该 name，如果需要带上 params 和 query 对象 (`<router-link>` 的 `to` 属性和调用`this.$router.push` 或 `this.$router.replace` 传递参数是一回事）
- 配置路由懒加载，可以写成 `component: () => import('xx.vue')`，也可以写成 `resolve => require(['xx.vue'], resolve)`，这里 resolve 就是 promise 的 resolve 回调，组件加载成功后调用。因为 webpack 支持多种模块规范语法，所以有不同写法。
- 关于路由 guard 函数，可以在整个路由对象上定义 `beforeEach` 和 `afterEach`，也可以在组件内定义 `beforeRouteEnter`, `beforeRouteUpdate`, `beforeRouteLeave`，这些函数都有 `to`, `from`, `next` 三个参数，可以帮助判断是从哪个路由进入的或者要离开时给出弹窗提示
- 定义路由时配置 meta 字段，在所有可以访问到它对应的 `to` 或 `from` 参数中（Route 对象）读取该字段
- 创建路由时可以提供一个 `scrollBehavior` 方法返回滚动位置，`scrollBehavior (to, from, savedPosition) {}`，其中第三个参数 `savedPosition` 当且仅当通过浏览器的 前进/后退 按钮触发时才可用
- 组件中监听 `$route(to, from)` 的变化，可以利用 `to.matched` 的数据构造面包屑，它是一个数组，里面有匹配到的每一层嵌套路由

### View is not refreshing when params id is changing
1. To react to params changes in the same component, you can simply watch the `$route` object.
  ```js
    watch: {
      $route(to, from) { 
        if(to !== from) { location.reload(); } 
      } 
    }
  ```
2. The reloading part is not truly useful since we don't want to reload the page. You can easily achieve that with `<router-view :key="$route.path" />`. The unique key tells Vue to use a different instance of the component instead of reusing the existing one whenever the route changes.

## Vue Loader 相关
- `vue-loader` 会解析单文件形式的 Vue 组件。应该将 `vue-loader` 和 `vue-template-compiler` 一起安装，而且 `vue-template-compiler` 的版本要和 vue 保持同步。同时需要添加 `VueLoaderPlugin` 插件，它的职责是将你定义过的其它规则复制并应用到 `.vue` 文件里相应语言的块，比如 `['vue-style-loader', 'css-loader', 'sass-loader']` 处理普通的 `.scss` 文件和 `*.vue` 文件中的 `<style lang="scss">`
- `vue-loader` 会把 template 中遇到的资源 URL 转换为 webpack 模块请求；处理 scoped style 的样式只作用于当前组件中的元素，如果希望 scoped 样式影响到更深的子组件，可以使用 `::v-deep`

## Vuex 相关
- Vuex store，主要包括 state，mutations，actions；从 store 中读取状态是在 computed 中返回某个 state，触发变化是在组件的 methods 中 commit mutation。在创建 Vue 实例时，注入一个 store 实例，从而在所有子组件可以访问 `this.$store`
- 提交 mutation 是更改状态的唯一方法，并且这个过程是同步的（类似于 reducer），action (接收一个 store，可以解构) 提交 mutation，`store.dispatch` 返回一个 Promise 可以组合下一个 action
- 不想在组件内重复的写 `this.$store.state.xx`，`this.$store.commit`，`this.$store.dispatch`，使用 `mapState`, `mapMutations`, `mapActions` 辅助函数把 store 中同名的状态或操作映射到组件内，相当于在组件内直接定义了这些计算属性和方法，比如 `this.incrementBy(amount)` 映射为 `this.$store.dispatch('incrementBy', amount)`
- 可以把 store 分割成多个 module，每个 module 拥有自己的 state，mutations，actions，创建 Vuex.Store 时传入 modules 配置。可以给每个 module 添加 `namespaced: true` 使其成为带命名空间的模块，此时在组件内需将 module 的名字作为第一个参数传递给 `mapState`, `mapActions`，这样所有的映射都会自动将这个 module 作为上下文（也可以用 `createNamespacedHelpers('some/nested/module')` 函数，它会返回绑定在给定命名空间上的 `mapState`, `mapActions`）
- 如果 store 文件太大，可以将 mutations，actions 以及每个 module 分割到单独的文件
- `createPersistedState` 插件用来持久化存储 Vuex 的状态，默认使用 localStorage 存储，默认 key 是 vuex，可以传参修改默认的配置，然后在 `new Vuex.Store` 时传入这个 plugin

## HTTP 请求相关
首先明确一个认识，很多同学以为 GET 的请求数据在 URL 中，而 POST 不是，所以以为 POST 更安全。不是这样的，整个请求的 HTTP URL PATH 会全部封装在 HTTP 的协议头中。只要是 HTTPS，就是安全的。所谓的 POST 更安全，只能说明该同学并不理解 HTTP 协议。使用规范的方式，可以大大减少跨团队的沟能成本。最差的情况下，也是需要做到“读写分离”的，就是说，至少要有两个动词，GET 表示是读操作，POST 表示是写操作。

### 使用 vue-resource
- [vue-resource](https://github.com/pagekit/vue-resource) 是一个轻量级的用于处理 HTTP 请求的插件，通过 `Vue.use` 使用自定义的插件。
- 全局对象使用 `Vue.http.get()`，在一个组件内使用 `this.$http.get()`
- 可以定义 inteceptor 在请求发送前和接收响应前做一些处理，比如设置业务相关的请求头、添加 CSRF token、请求加 loading 状态、query 参数加时间戳等。
  ```js
  Vue.http.interceptors.push((request, next) => {
    // 请求发送前的处理逻辑（比如判断传入的 request.no_loading 是否显示 loading）
    // if (request.method === 'GET') {...}
    // if (request.method === 'POST') {...}
    next((response) => {
      // 请求结果返回给 successCallback 或 errorCallback 之前，根据 `response.ok` 或 `response.status` 加一些处理逻辑 
      // ...
      return response
    })
  });
  ```

### 自己对 axios 封装
- 通过 `axios.defaults.headers['xyz'] = 'abc'` 这样的方式添加需要的请求头
- 统一对 query 参数做处理
- 加 csrf token，加业务 header
- 根据不同的错误码做页面跳转

```js
export default {
  get(url, params) {
    // 统一加请求头，处理 queryString 等
    return axios
      .get(url)
      .then(function(response) {
          return response
      })
      .then(handleResponse)    // 统一处理 redirect, 赋值 location.href 
      .catch(errorResponseGet) // 统一处理错误码 4xx, 5xx
  },

  post(url, params) {
    // ...
  }
}
```

### API 版本
API 版本可以放在两个地方:
- 在 url 中指定 API 的版本，例如 https://example.com/api/v1，这样不同版本的协议解析可以放在不同的服务器上，不用考虑协议兼容性，开发方便，升级也不受影响。
- 放在 HTTP header 中，url 显得干净，符合 RESTful 惯例，毕竟版本号不属于资源的属性。缺点是需要解析头部，判断返回。

### URI 连字符
- URI 中尽量使用连字符 `-` 代替下划线 `_` 的使用，连字符用来分割 URI 中出现的单词，提高 URI 的可读性。下划线会和链接的样式冲突重叠。
- URI 是对大小写敏感的，为了避免歧义，我们尽量用小写字符。但主机名（Host）和协议名（Scheme）对大小写是不敏感的。

## 静态资源文件上传七牛
使用 [Qiniu](https://www.npmjs.com/package/qiniu) 作为 webpack 打包过程中的一个插件负责静态文件上传，自定义 QiniuPlugin 的参考：https://github.com/mengsixing/qiniu-upload-plugin/blob/master/lib/qiniuUploadPlugin.js

如果是静态上传页面，参考 https://github.com/liujunyang/qiniu-practice, https://www.cnblogs.com/2050/p/3913184.html

域名接入：选择一个自己已备案的域名，绑定到七牛的云存储空间。域名接入 CDN 后，系统会自动分配一个 CNAME 域名，需要将加速域名指向分配的 CNAME 地址，配置生效后，即可享受 CDN 加速服务。

```js
// build 脚本使用自定义的 QiniuPlugin
const publicPath = 'https://x.y.z/';
const assetsSubDirectory = 'a/b/';
webpackConfig.output.publicPath = publicPath + assetsSubDirectory;

webpackConfig.plugins.push(
  new QiniuPlugin({
    publicPath: publicPath,
    assetsSubDirectory: assetsSubDirectory,
    accessKey: '...',
    secretKey: '...',
    bucket: 'xxx',
    zone: 'Zone_z1',
  })
)
```

## Vue 语法
Updates, tips & opinions from the maintainers of Vue.js: https://blog.vuejs.org

### computed and watch
Computed properties are a calculated result of its dependent values (data properties, props). They are used whenever you have some data and need to transform it before using it in the template. In this case, creating a computed property is the best thing because **it’s cached**. They should not have any side effects and they have to be synchronous.

Watch properties are just a mechanism to detect changes in properties, allowing you to perform custom logic. It runs when the thing you're watching changes, like a listener. In general, the gist is: Try to use computed properties and if they won’t work, use a watcher.

> The trickiest part of using a watcher is that sometimes it doesn't seem to trigger correctly. Usually, this is because you're trying to watch an Array or an Object but didn't set `deep` to true, which will let Vue know to look inside the array or object.

Filters (pipe in template) are removed from Vue 3.0 and no longer supported. Instead, we recommend replacing them with method calls or computed properties.

> 1. Filters are not bound to the component instance, so `this` inside a filter function is `undefined`.
> 2. Filters are JavaScript functions, therefore they can take arguments `{{ message | filterA(arg1, arg2) }}`. Here `filterA` takes three arguments: `message, arg1, arg2`. 

### props
- HTML attribute names are case-insensitive, so browsers will interpret any uppercase characters as lowercase. That means kebab-cased in DOM templates and camelCase in JavaScript.
- Passing a Boolean: Including the prop with no value will imply `true` (presence of any value are casted to `true`, absence means `false`).
- For optional props, `null` will bypass the type check. Because when you specify a prop with a type but without `required: true`, you are essentially saying "this prop may not be present, but if it is present, it should be of type String." And `null` is the value expressing "this type is not present".
- If the prop is an array or object, mutating the object or array itself inside the child component will affect parent state.

### $nextTick
In Vue, a tick is a single DOM update cycle. Vue will collect all updates made in the same tick, and at the end of a tick it will update what is rendered into the DOM based on these updates.

The key concept to understand is that the DOM is updated asynchronously. **When you change a value in Vue, the change is not immediately rendered to the DOM**. Instead, Vue queues a DOM update and then, on a timer, updates the DOM. Most of the time we don’t need to care about this, but it can be tricky when you want to do something that depends on the post-update DOM state. In order to wait until Vue has finished updating the DOM after a data change, you can use `Vue.nextTick(callback)` immediately after the data is changed. The callback will be called after the DOM has been updated.

### $parent and $refs
`$parent` property can be used to access the parent instance from a child. This can be tempting to reach for as a lazy alternative to passing data with a prop. In most cases, reaching into the parent makes your application more difficult to debug and understand, especially if you mutate data in the parent.

Sometimes you might need to directly access a child component. To achieve this you can assign a reference `ref="xxx"` to the child component and use `this.$refs.xxx` to access the child instance.

### slot
In Vue 2.6.0, we introduced a new unified syntax (the `v-slot` directive) for named and scoped slots. It replaces the `slot` and `slot-scope` attributes syntax (`<template slot="header" slot-scope="slotProps">`), which will continue to be supported in all future 2.x releases, but are officially deprecated and will eventually be removed in Vue 3.

There are times when it’s useful to have multiple slots. `<slot>` element has a special attribute `name` and without `name` implicitly has the name “default” (`<slot name="header"></slot>`). To provide content to named slots, we can use the `v-slot` directive on a `<template>` (`<template v-slot:header>`). Any content not wrapped in a `<template>` using `v-slot` is assumed to be for the default slot.

It’s useful for slot content to have access to data only available in the child component. We can bind an attribute to the `<slot>` element which called slot props. Now, in the parent scope, we can use `v-slot` with a value to define a name for the slot props we’ve been provided (`<template v-slot="slotProps">` or `<template v-slot:default="slotProps">`).

### the `is` attribute
1. The typical situation of using `is` attribute is to switch between several possible components (dynamic components). `<component :is="currentComponent"></component>` and the currentComponent can be the name of a registered component.

2. Some HTML elements have restrictions on what elements can appear inside them. The `is` attribute offers a workaround: `<tr is="blog-post-row"></tr>` is a valid TR row in `<table>` that will be correctly replaced by the custom component.

### keep-alive
`<keep-alive>` is a wrapper element that surrounds dynamic components. The most common example is a Tab system where the content switches to a different component depending on which tab is open. `keep-alive` stores a cached reference to your component when it’s not active. This means that Vue does not have to create a new instance every single time you switch components (lifecycle `mounted()` gets called only once). Some cases where you might want to cache the state like user input, reading progress, making lots of API calls in your component and you only want to make them once. There are two unique hooks `activated()` and `deactivated()` to help observe when a kept alive component is toggled - as the component remains mounted, but is not in use.

### `.sync`
The `.sync` modifier for props is just a syntax sugar that automatically expands into an additional `v-on` listener: `<comp :bar.sync="foo">` expands to `<comp :bar="foo" @update:bar="v => foo = v">`. The `.sync` was added after we had added `v-model` for components and found that people often could use that `v-model` logic for more than one prop. So they essentially do the same thing.

### watch $route
When the user navigates from `/user/foo` to `/user/bar`, the same component instance will be reused. Since both routes render the same component, this is more efficient than destroying the old instance and then creating a new one. However, this also means that the lifecycle hooks of the component will not be called. To react to params changes in the same component, you can watch the `$route` object using `watch: { $route(to, from) {...} }`

### force Vue to re-render a component
You can use `forceUpdate` on the component instance itself as well as globally:
```js
// Globally
import Vue from 'vue';
Vue.forceUpdate();

// Using the component instance
export default {
  methods: {
    methodThatForcesUpdate() {
      this.$forceUpdate();  // force the view to re-render
    }
  }
}
```

The best way to force Vue to re-render a component is to set a `:key` on the component. When you need the component to be re-rendered, you just change the value of the key and Vue knows that it should get rid of the old component and create a new one. (`key` is one of special attributes reserved by Vue. It can't be passed as a prop, same as `ref` or `is`.)

```js
export default {
  data() {
    return {
      componentKey: 0,
    };
  },
  methods: {
    forceRerender() {
      this.componentKey += 1;
    }
  }
}
```

### Vue.extend
It creates a subclass of the base Vue constructor. The argument should be an object containing component options. You can use `Vue.extend()` to create component definition (called "component constructor" in old documentation). `Vue.component()`, on the other hand, is to associate a given constructor with a name so Vue can pick it up in templates. When directly passing in options to `Vue.component()`, it calls `Vue.extend()` under the hood.

```js
// define
var MyComponent = Vue.extend({
  template: '<div>A custom component</div>'
})

// register, then use <my-component> in template
Vue.component('my-component', MyComponent)
```

### Plugins and Vue.use 
Plugins usually add global-level functionality to Vue (e.g., add some component options by global mixin, add some Vue instance methods by attaching them to `Vue.prototype`.) Use plugins by calling `Vue.use()` method and this has to be done before calling `new Vue()`. The plugin can be object or function and if it is an object, it must expose an `install` method. `Vue.use` automatically prevents you from using the same plugin more than once, so calling it multiple times on the same plugin will install the plugin only once.

### el and vm.$el
`el` provides the Vue instance an existing DOM element to mount on. It can be a CSS selector string or an actual HTMLElement. The provided element merely serves as a mounting point and the mounted element will be replaced with Vue-generated DOM. After the instance is mounted, the resolved element will be accessible as `vm.$el`. If this option is available at instantiation, the instance will immediately enter compilation; otherwise, the user will have to explicitly call `vm.$mount()`. If no argument is provided to `$mount()`, the template will be rendered as an off-document element, and you will have to use native DOM API to insert it into the document.

```js
var MyComponent = Vue.extend({
  template: '<div>Hello</div>'
})

// create and mount to #app (will replace #app)
new MyComponent().$mount('#app')

// the above is the same as
new MyComponent({ el: '#app' })

// add plugins to this extended component if needed, similar to the options in `new Vue({..})`
new MyComponent({i18n, router}).$mount()

// or, render off-document and append afterwards
var component = new MyComponent().$mount()
document.getElementById('app').appendChild(component.$el)
```

### 组件间通信
1. props 和 $emit
2. 通过 `$parent` 拿到父组件的实例，然后调用父组件的方法。同样也可以调用子组件 `$children` 的方法。
3. 将 `$dispatch` 挂载到 Vue 原型上方便调用，`$dispatch` 的原理是一直递归找父组件，然后执行父组件中的方法。
    ```js
    Vue.prototype.$dispatch = function(eventName, newValue) {
      let parent = this.$parent
      while (parent) {
        parent.$emit(eventName, newValue)
        parent = parent.$parent
      }
    }
    ```
4. `.sync` 语法糖，注意在子组件中调用 `$emit(fn)` 的时候, `fn` 的名字一定是 `update:xxx` 这样的格式。
    ```html
    <Son @update:number="newValue => number = newValue" :number="number" />
    // 等价于
    <Son :number.sync="number" />
    ```
5. 在子组件中可以通过 `v-bind="$attrs"` 将父组件传递下来的数据传递给孙组件，而孙组件可以通过 `$attrs` 来接收。对于方法，在子组件中可以通过 `v-on="$listeners"` 将全部事件传递给孙组件。
    ```html
    // Parent.vue
    <Son :number="number" @change="change" @say="say" :count="count" />
    // Son.vue
    <Grandson v-bind="$attrs" v-on="$listeners" />
    // Grandson.vue
    {{ $attrs }}

    mounted() {
      console.log(this.$listeners)
    }
    ```
6. Vue 组件通信的语法糖和相关 api 太多，可以直接选择用 Vuex 处理。

### ref() and reactive() in Vue 3
- `reactive()` only takes objects, not JS primitives.
- `ref()` is calling `reactive()` behind the scenes.
- `ref()` has a `.value` property for reassigning, `reactive()` does not have this and therefore cannot be reassigned.

```js
// use `ref()` for primitives and is good for objects that need to be reassigned
const blogPosts = ref([]); 
getBlogPosts() {
  blogPosts.value = await fetchBlogPosts();
}

// `reactive()` requires reassigning a property instead of the whole object
const blog = reactive({ posts: [] });
getBlogPosts() {
  blog.posts = await fetchBlogPosts();
}
```


## Electron 桌面端项目
https://github.com/dengyaolong/geektime-electron  
https://nodejs.dev/learn  
https://simulatedgreg.gitbooks.io/electron-vue/content/en/  

--- 

1. Node.js API，Electron Native API，释放前端想象力，大胆使用 Chrome 支持的 API
2. 当渲染进程 `nodeIntegration` 为 ture 时可以直接在窗口的 devTools 中使用 Node API，比如 `require(xx)`, `process.versions.electron`, `process.versions.node` 等
3. 窗口对象要挂载在一个全局变量上，否则会被垃圾回收掉，窗口就消失了
4. IPC 进程间通信（`ipcMain`, `ipcRenderer` 都是 `EventEmitter` 对象）
    ```js
    // 从渲染进程到主进程
    // callback 写法
    ipcRenderer.send
    ipcMain.on

    // promise 写法
    ipcRenderer.invoke
    ipcMain.handle

    // 从主进程到渲染进程
    webContents.send
    ipcRenderer.on

    // 渲染进程与渲染进程之间，需要 webContents.id
    ipcRenderer.sendTo
    localStorage, sessionStorage, indexedDB
    ```
5. 窗口加载区分线上环境还是开发环境，使用 [electron-is-dev](https://www.npmjs.com/package/electron-is-dev)
    ```js
    if (isDev) {
      win.loadURL('http://localhost:3000')
    } else {
      win.loadFile(path.resolve(__dirname, '../renderer/pages/main/index.html'))
    }
   ```
6. 桌面应用的关于窗口 [about-window](https://www.npmjs.com/package/about-window)
7. 用户点击窗口关闭按钮时（响应窗口的 close 事件），app 应该只是隐藏（`win.hide()`），只有点击「退出应用」时（响应 app 的 `before-quit` 事件）才是真正的关闭窗口（手动调用 `win.close()`，窗口被置为 null）
    ```js
    let willQuitApp = false
    win.on('close', (e) => {
      if(willQuitApp) {
        win = null
      } else {
        e.preventDefault()
        win.hide()
      }
    })
    ```
8. 主进程管理菜单和托盘 (Menu and Tray)，如果需要在渲染进程中响应 contextMenu 事件，需要借助 remote 模块引入 Menu 来展示右键菜单
9. Mac 软件图标 icns 格式 (1024 * 1024 PNG 图片 -> `sips` 命令生成不同尺寸的图片 -> `iconutil` 命令转为 icns 格式)，Windows 使用 ico 格式图标
10. 自动更新机制的处理：服务端（比如使用 Koa）需要分别接收 Mac 和 Windows 的请求，query 中带有当前版本信息，检查版本是否有更新，返回包括新包地址的新版本信息，无更新返回 HTTP 204；客户端引入 autoUpdater 模块，使用 `autoUpdater.checkForUpdates()` 检查更新，设置服务端地址（`app.getVersion()` 取当前版本），监听更新下载完毕事件 `update-downloaded` 给用户展示 dialog 提醒用户更新 (`autoUpdater.quitAndInstall()`)

### 桌面端的本地构建过程
1. 调用 `greeting()` 方法，根据终端窗口的宽度 `process.stdout.columns` 显示不同样式的问候语。
2. 使用 `Promise.all()` 同时启动主进程和渲染进程的构建，两者分别有自己的 webpack 配置文件 `webpack.main.config` 和 `webpack.renderer.config`
3. 对于渲染进程，使用类似 web 端的 webpack 配置，设置入口文件、产出位置、需要的 loaders 和 plugins，并根据是否为 production 环境补充引入一些 plugin，在 npm 脚本打包的时候可以通过 `cross-env BUILD_ENV=abc` 设置一些环境变量。创建一个 WebpackDevServer，传入 webpack 配置，设置代理，监听某一端口，其实这就是启动一个本地服务，使用浏览器也可以访问构建后的页面，这里只是用 electron 的壳子把它加载进来。对于主进程，也使用了 webpack，设置入口文件用来打包产出。
4. 利用 webpack 编译的 hooks 在构建完成后会打印日志，`logStats()` 函数接收进程名 (Main or Renderer) 和具体输出的内容。
5. 在主进程和渲染进程都构建完成后，即主进程有一个打包后的 `main.js` 且渲染进程本地服务可以访问，这个时候启动 electron，即通常项目的 npm 脚本会执行 `electron .`，这里是通过 Node API，使用 `child_process.spawn()` 的方式启动 electron 并传入需要的参数，然后对 electron 进程的 stdout 和 stderr 监听，打印对应的日志。

### 状态持久化存储
Electron doesn't have a built-in way to persist user preferences and other data. [electron-store](https://github.com/sindresorhus/electron-store) handles that for you, so you can focus on building your app. The data is saved in a JSON file in `app.getPath('userData')`.
- `appData`, which by default points to `~/Library/Application Support` on macOS.
- `userData` (storing your app's configuration files), which by default is the appData directory appended with your app's name.

Advantages over `localStorage`:
- localStorage only works in the browser process.
- localStorage is not very fault tolerant, so if your app encounters an error and quits unexpectedly, you could lose the data.
- localStorage only supports persisting strings. This module supports any JSON supported type.
- The API of this module is much nicer. You can set and get nested properties. You can set default initial config.

### Knowledge
Each Electron app has a single **main process**, which acts as the application's entry point. The main process runs in a Node.js environment, and adds native APIs to interact with the user's operating system. Each instance of the `BrowserWindow` class creates an application window that loads a web page in a separate renderer process. You can interact with this web content from the main process using the browserWindow's `webContents` object.

Each Electron app spawns a separate **renderer process** for each open `BrowserWindow`. The renderer has no direct access to require or other Node.js APIs. (enable `nodeIntegration` and disable `contextIsolation` in `webPreferences` to use Node)

**Preload scripts** contain code that executes in a renderer process before its web content begins loading. These scripts run within the renderer context, but are granted more privileges by having access to Node.js APIs (no matter whether `nodeIntegration` is turned on or off.)

Asar (Atom Shell Archive Format) is a simple extensive archive format, it works like tar that concatenates all files together without compression, while having random access support. The ASAR format was created primarily to improve performance when reading large quantities of small files.

`@electron/remote` is an Electron module that bridges JavaScript objects from the main process to the renderer process. This lets you access main-process-only objects as if they were available in the renderer process. https://github.com/electron/remote/blob/main/README.md

`{ webSecurity: false }` no longer controls CORS (for v9+). The `webSecurity` option controls the web security inside blink *(Blink is the name of the rendering engine used by Chromium)*, but recently the control of CORS has been moved out of blink and thus the option no longer controls CORS. --> Set `Access-Control-Allow-Origin` header in server/nginx.