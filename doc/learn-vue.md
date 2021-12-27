## 项目是怎么跑起来的
### 项目属于多页应用，这里面有很多子项目（`pages/`）
- 在 webpack 配置的 entry 里可以看到这些子项目入口（有的是列举出所有的入口 js 文件，有的是通过遍历 `src/pages` 得到所有入口），entry 的 base 路径可以由 context 字段指定
- 对于每一个 page，都有对应的 `HtmlWebpackPlugin` 指定它的模板，并注入它需要的 chunks （对应每一个 entry 打包出的 js）
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

### 网页版显示的逻辑
- 项目 xpc 和 xh5 都部署在同一个域名下，本地运行 xpc 项目，所有的请求都会走代理，所以即便是 xh5 的页面也可以被访问到。
- 请求 `/web?old=1` (走代理) 后端会返回 html 扫码登录页面，这里面有一个 `/static/vue/login.js?_dt=xxxxx`，里面有登录和加载网页版首页的逻辑，这样就会展示出 xh5 中的页面，其中的 iframe 可以嵌套任意 xpc 或 xh5 中的页面（只要有路由支持），这个 iframe 的链接自然也可以被单独访问。
- 如果某个接口 404，就是它的路径没有配置代理。

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
`devtool` option controls if and how source maps are generated.

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
It will create an interactive treemap visualization of the contents of all your bundles.
```js
// https://www.npmjs.com/package/webpack-bundle-analyzer
// npm install --save-dev webpack-bundle-analyzer
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin()
  ]
}
```

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

## Vue Loader 相关
- `vue-loader` 会解析单文件形式的 Vue 组件。应该将 `vue-loader` 和 `vue-template-compiler` 一起安装，而且 `vue-template-compiler` 的版本要和 vue 保持同步。同时需要添加 `VueLoaderPlugin` 插件，它的职责是将你定义过的其它规则复制并应用到 `.vue` 文件里相应语言的块，比如 `['vue-style-loader', 'css-loader', 'sass-loader']` 处理普通的 `.scss` 文件和 `*.vue` 文件中的 `<style lang="scss">`
- `vue-loader` 会把 template 中遇到的资源 URL 转换为 webpack 模块请求；处理 scoped style 的样式只作用于当前组件中的元素，如果希望 scoped 样式影响到更深的子组件，可以使用 `::v-deep`

## Vuex 相关
- Vuex store，主要包括 state，mutations，actions；从 store 中读取状态是在 computed 中返回某个 state，触发变化是在组件的 methods 中 commit mutation。在创建 Vue 实例时，注入一个 store 实例，从而在所有子组件可以访问 `this.$store`
- 提交 mutation 是更改状态的唯一方法，并且这个过程是同步的（类似于 reducer），action (接收一个 store，可以解构) 提交 mutation，`store.dispatch` 返回一个 Promise 可以组合下一个 action
- 不想在组件内重复的写 `this.$store.state.xx`，`this.$store.commit`，`this.$store.dispatch`，使用 `mapState`, `mapMutations`, `mapActions` 辅助函数把 store 中同名的状态或操作映射到组件内，相当于在组件内直接定义了这些计算属性和方法，比如 `this.incrementBy(amount)` 映射为 `this.$store.dispatch('incrementBy', amount)`
- 可以把 store 分割成多个 module，每个 module 拥有自己的 state，mutations，actions，创建 Vuex.Store 时传入 modules 配置。可以给每个 module 添加 `namespaced: true` 使其成为带命名空间的模块，此时在组件内需将 module 的名字作为第一个参数传递给 `mapState`, `mapActions`，这样所有的映射都会自动将这个 module 作为上下文（也可以用 `createNamespacedHelpers('some/nested/module')` 函数，它会返回绑定在给定命名空间上的 `mapState`, `mapActions`）
- 如果 store 文件太大，可以将 mutations，actions 以及每个 module 分割到单独的文件

## HTTP 请求相关
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

## 静态资源文件上传七牛
使用 [Qiniu](https://www.npmjs.com/package/qiniu) 作为 webpack 打包过程中的一个插件负责静态文件上传，自定义 QiniuPlugin 的参考：https://github.com/mengsixing/qiniu-upload-plugin/blob/master/lib/qiniuUploadPlugin.js

如果是静态上传页面，参考 https://github.com/liujunyang/qiniu-practice, https://www.cnblogs.com/2050/p/3913184.html

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
### computed and watch
Computed properties are a calculated result of its dependent values (data properties, props). They are used whenever you have some data and need to transform it before using it in the template. In this case, creating a computed property is the best thing because **it’s cached**. They should not have any side effects and they have to be synchronous.

Watch properties are just a mechanism to detect changes in properties, allowing you to perform custom logic. It runs when the thing you're watching changes, like a listener. In general, the gist is: Try to use computed properties and if they won’t work, use a watcher.

Filters (pipe in template) are removed from Vue 3.0 and no longer supported. Instead, we recommend replacing them with method calls or computed properties.

> 1. Filters are not bound to the component instance, so `this` inside a filter function is `undefined`.
> 2. Filters are JavaScript functions, therefore they can take arguments `{{ message | filterA(arg1, arg2) }}`. Here `filterA` takes three arguments: `message, arg1, arg2`. 

### props
- HTML attribute names are case-insensitive, so browsers will interpret any uppercase characters as lowercase. That means kebab-cased in DOM templates and camelCase in JavaScript.
- Passing a Boolean: Including the prop with no value will imply `true` (presence of any value are casted to `true`, absence means `false`).
- For optional props, `null` will bypass the type check. Because when you specify a prop with a type but without `required: true`, you are essentially saying "this prop may not be present, but if it is present, it should be of type String." And `null` is the value expressing "this type is not present".
- If the prop is an array or object, mutating the object or array itself inside the child component will affect parent state.

### $nextTick
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

## Electron 桌面端项目
### Learn Node
https://nodejs.dev/learn

### Knowledge
Electron inherits its multi-process architecture from Chromium.
- Each Electron app has a single **main process**, which acts as the application's entry point. The main process runs in a Node.js environment, and adds native APIs to interact with the user's operating system. Each instance of the `BrowserWindow` class creates an application window that loads a web page in a separate renderer process. You can interact with this web content from the main process using the window's `webContents` object.
- Each Electron app spawns a separate **renderer process** for each open `BrowserWindow`. The renderer has no direct access to require or other Node.js APIs. In order to directly use them, you must use the bundler toolchains like webpack.
- **Preload scripts** contain code that executes in a renderer process before its web content begins loading. These scripts run within the renderer context, but are granted more privileges by having access to Node.js APIs.
- IPC stands for inter-process communication. Electron uses IPC to send serialized JSON messages between the main and renderer processes.

`process.platform` returns a string identifying the operating system platform on which the Node.js process is running: `darwin`, `linux`, `win32`.
> Darwin is the part of OS X that is the actual operating system, which forms the core set of components upon which Mac OS X and iOS are based. To give an analogy, Darwin would be the equivalent of Linux (and the GNU utilities) while Mac OS X would be the equivalent of Ubuntu or another distribution (a kernel, the basic userspace utilities, a GUI layer and a bunch of "built-in" applications).

`ASAR` stands for Atom Shell Archive Format. An asar archive is a simple `tar`-like format that concatenates files into a single file. The ASAR format was created primarily to improve performance on Windows when reading large quantities of small files (e.g. when loading your app's JavaScript dependency tree from `node_modules`).
