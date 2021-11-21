## 项目是怎么跑起来的
### 项目属于多页应用，这里面有很多子项目（`pages/`）
- 在 webpack 配置的 entry 里可以看到这些子项目入口
- 对于每一个 page，都有对应的 `HtmlWebpackPlugin` 指定它的模板，并注入它需要的 chunks （对应每一个 entry 打包出的 js）
    - 指定 `chunks` 是因为项目是多 entry 会生成多个编译后的 js 文件，chunks 决定使用哪些 js 文件，如果没有指定默认会全部引用
    - `inject` 值为 true，表明 chunks js 会被注入到 html 文件的 body 底部
- 每一个 page 里的 js 文件会创建该子项目的 Vue 实例，指定对应的 component, router, store
- 每一个 page 有对应的 `router/`，这是子项目的路由，而且每个路由加载的 component 都是异步获取，在访问该路由时按需加载
- webpack 打包时（`dist/`）会 emit 出所有 HtmlWebpackPlugin 生成的 html 文件（这也是浏览器访问的入口），相对每个 entry 打包出的 js 文件（filename, `js/[name].[chunkhash].js`），所有异步加载的组件 js（chunkFilename, `js/[id].[chunkhash].js'`） 

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
### filename 和 chunkFilename
- `filename` 是对应于 entry 里面的输入文件，经过打包后输出文件的名称。`chunkFilename` 指未被列在 entry 中，却又需要被打包出来的 chunk 文件的名称，一般是要懒加载的代码。
- `output.filename` 的输出文件名是 `[name].[chunkhash].js`，`[name]` 根据 entry 的配置推断为 index，所以输出为 `index.[chunkhash].js`。`output.chunkFilename` 默认使用 `[id].js`, 会把 `[name]` 替换为 chunk 文件的 id 号。
- `chunkhash` 根据不同的入口文件构建对应的 chunk，生成对应的哈希值，来源于同一个 chunk，则 hash 值就一样。

### resolve
- extensions 数组，在 import 不带文件后缀时，webpack 会自动带上后缀去尝试访问文件是否存在。
- alias 配置别名，把导入路径映射成一个新的导入路径，比如 `"@": path.join(__dirname, 'src')`
- modules 数组，tell webpack what directories should be searched when resolving modules, 默认是去 node_modules 目录下寻找。

### ExtractTextPlugin
- 打包样式，一种是使用 `style-loader` 将生成的 style 标签并且插入到 head 里，另一种是使用  `extract-text-webpack-plugin`，将样式文件单独打包并指定生成的 filename，它需要同时配置 loader 和 plugin 两个地方。
- Since webpack v4 the `extract-text-webpack-plugin` should not be used for css. Use `mini-css-extract-plugin` instead.

### Vue Loader
- `vue-loader` 会解析单文件形式的 Vue 组件。应该将 `vue-loader` 和 `vue-template-compiler` 一起安装，而且 `vue-template-compiler` 的版本要和 vue 保持同步。同时需要添加 `VueLoaderPlugin` 插件，它的职责是将你定义过的其它规则复制并应用到 `.vue` 文件里相应语言的块，比如 `['vue-style-loader', 'css-loader', 'sass-loader']` 处理普通的 `.scss` 文件和 `*.vue` 文件中的 `<style lang="scss">`
- `vue-loader` 会把 template 中遇到的资源 URL 转换为 webpack 模块请求；处理 scoped style 的样式只作用于当前组件中的元素，如果希望 scoped 样式影响到更深的子组件，可以使用 `::v-deep`


## 路由相关
- 使用 `vue-router 3.x`，由于 VueRouter 是 default export 只有一个，所以在引入时可以任意起名字。
- 创建 Vue 时配置 router 参数传入一个 Router 实例。构建 Router 实例，路由有两种模式 hash 和 history，这里在 prod 使用 history mode，dev 使用 hash mode，`fallback` 属性的含义是当浏览器不支持 `history.pushState` 是否回退到 hash 模式，默认为 true。
- 嵌套路由配置 children，组件内 `this.$route` 可以访问到 params, query, hash，匹配多个路由时优先级就按照路由的定义顺序
- 每一个 route 有名字，在跳转时可以指定该 name，如果需要带上 params 和 query 对象 (`<router-link>` 的 `to` 属性和调用`this.$router.push` 或 `this.$router.replace` 传递参数是一回事）
- 配置路由懒加载，可以写成 `component: () => import('xx.vue')`，也可以写成 `resolve => require(['xx.vue'], resolve)`，这里 resolve 就是 promise 的 resolve 回调，组件加载成功后调用。因为 webpack 支持多种模块规范语法，所以有不同写法。
- 关于路由 guard 函数，可以在整个路由对象上定义 `beforeEach` 和 `afterEach`，也可以在组件内定义 `beforeRouteEnter`, `beforeRouteUpdate`, `beforeRouteLeave`，这些函数都有 `to`, `from`, `next` 三个参数，可以帮助判断是从哪个路由进入的或者要离开时给出弹窗提示
- 定义路由时配置 meta 字段，在所有可以访问到它对应的 `to` 或 `from` 参数中（Route 对象）读取该字段
- 创建路由时可以提供一个 `scrollBehavior` 方法返回滚动位置，`scrollBehavior (to, from, savedPosition) {}`，其中第三个参数 `savedPosition` 当且仅当通过浏览器的 前进/后退 按钮触发时才可用


## Vuex 相关
- Vuex store，主要包括 state，mutations，actions；从 store 中读取状态是在 computed 中返回某个 state，触发变化是在组件的 methods 中 commit mutation。在创建 Vue 实例时，注入一个 store 实例，从而在所有子组件可以访问 `this.$store`
- 提交 mutation 是更改状态的唯一方法，并且这个过程是同步的（类似于 reducer），action (接收一个 store，可以解构) 提交 mutation，`store.dispatch` 返回一个 Promise 可以组合下一个 action
- 不想在组件内重复的写 `this.$store.state.xx`，`this.$store.commit`，`this.$store.dispatch`，使用 `mapState`, `mapMutations`, `mapActions` 辅助函数把 store 中同名的状态或操作映射到组件内，相当于在组件内直接定义了这些计算属性和方法，比如 `this.incrementBy(amount)` 映射为 `this.$store.dispatch('incrementBy', amount)`
- 可以把 store 分割成多个 module，每个 module 拥有自己的 state，mutations，actions，创建 Vuex.Store 时传入 modules 配置。可以给每个 module 添加 `namespaced: true` 使其成为带命名空间的模块，此时在组件内需将 module 的名字作为第一个参数传递给 `mapState`, `mapActions`，这样所有的映射都会自动将这个 module 作为上下文（也可以用 `createNamespacedHelpers('some/nested/module')` 函数，它会返回绑定在给定命名空间上的 `mapState`, `mapActions`）
- 如果 store 文件太大，可以将 mutations，actions 以及每个 module 分割到单独的文件

## Vue 语法
### computed and watch
Computed properties are a calculated result of its dependent values (data properties, props). They are used whenever you have some data and need to transform it before using it in the template. In this case, creating a computed property is the best thing because **it’s cached**. They should not have any side effects and they have to be synchronous.

Watch properties are just a mechanism to detect changes in properties, allowing you to perform custom logic. It runs when the thing you're watching changes, like a listener. In general, the gist is: Try to use computed properties and if they won’t work, use a watcher.

Filters (pipe in template) are removed from Vue 3.0 and no longer supported. Instead, we recommend replacing them with method calls or computed properties.

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
