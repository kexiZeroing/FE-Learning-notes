## Notes from reading offical docs

Recently Vue 3 became the new default. With this, we have also seen the release of a brand new Vue docs. Here are some of the exciting developments we could observe in Vue ecosystem:
- We had the first stable release of **Vite** - a new kind of build tool for frontend development. Vite brings a combination of blazing-fast development experience and highly optimized production bundles. It’s also framework agnostic and anyone can use it. Vite is the new recommended choice, while Vue CLI enters maintenance mode.
- Following the naming convention, we have also seen the release of **Vitest** - a new unit-test framework powered by Vite.
- **Pinia** released its first stable version and it is now the recommended library for state management in Vue 3. Introducing a simpler API, proper TypeScript support, and utilizing hot module replacement, it’s a huge step up in the development experience. While Vuex is still compatible with Vue 3, it is now in maintenance mode.
- **Volar** was released as the new official development tooling for our IDEs.
- We also had quite a few libraries from the community, for example **VueUse**, that can run in both Vue 2 and 3 seamlessly.

### Getting Started
In most build-tool-enabled Vue projects, we author Vue components using an HTML-like file format called Single-File Component. SFC is a defining feature of Vue, and is the recommended way to author Vue components if your use case warrants a build setup.

Vue components can be authored in two different API styles: Options API and Composition API.

With Options API, we define a component's logic using an object of options such as `data`, `methods`, and `mounted`. Properties defined by options are exposed on `this` inside functions, which points to the component instance.

With Composition API, we define a component's logic using imported API functions. In SFCs, Composition API is typically used with `<script setup>`. The `setup` attribute is a hint that makes Vue perform compile-time transforms that allow us to use Composition API with less boilerplate. For example, imports and top-level variables / functions declared in `<script setup>` are directly usable in the template.

The Composition API is centered around declaring reactive state variables directly in a function scope, and composing state from multiple functions together to handle complexity. It is more free-form, and requires understanding of how reactivity works in Vue to be used effectively. In return, its flexibility enables more powerful patterns for organizing and reusing logic.

Both API styles are fully capable of covering common use cases. They are different interfaces powered by the exact same underlying system. In fact, the Options API is implemented on top of the Composition API! The fundamental concepts and knowledge about Vue are shared across the two styles.

For learning purposes, go with the style that looks easier to understand to you. You can always pick up the other style later.

### Quick Start
Depending on your use case and preference, you can use Vue with or without a build step.

#### With Build Tools
A build setup allows us to use Vue Single-File Components. The official Vue build setup is based on [Vite](https://vitejs.dev), a frontend build tool that is modern, lightweight and extremely fast.

- You can try Vue with SFCs online on [StackBlitz](https://vite.new/vue). StackBlitz runs the Vite-based build setup directly in the browser.
- To create a build-tool-enabled Vue project on your machine, run `npm init vue@latest`. This command will install and execute [create-vue](https://github.com/vuejs/create-vue), the official Vue project scaffolding tool. You will be presented with prompts for a number of optional features such as TypeScript and testing support. Note that the example components in the generated project are written using the Composition API and `<script setup>`.

#### Without Build Tools
To get started with Vue without a build step, simply copy the following code into an HTML file and open it in the browser. It uses the global build of Vue where all APIs are exposed under the global Vue variable.

```html
<script src="https://unpkg.com/vue@3"></script>

<div id="app">{{ message }}</div>

<script>
  const { createApp } = Vue

  createApp({
    data() {
      return {
        message: 'Hello Vue!'
      }
    }
  }).mount('#app')
</script>
```

### Essentials
Every Vue application starts by creating a new **application instance** with the `createApp` function. The object we are passing into `createApp` is in fact a component. Every app requires a **root component** that can contain other components as its children.

```js
import { createApp } from 'vue'
// import the root component App from a single-file component.
import App from './App.vue'

const app = createApp(App)
```

An application instance won't render anything until its `.mount()` method is called. It expects a "container" argument, which can either be an actual DOM element or a selector string. The content of the app's root component will be rendered inside the container element. Also note that the `.mount()` method returns the root component instance instead of the application instance.

When using Vue without a build step, we can write our root component's template directly inside the mount container. Vue will automatically use the container's `innerHTML` as the template if the root component does not already have a template option.

```html
<div id="app">
  <button @click="count++">{{ count }}</button>
</div>
```
```js
import { createApp } from 'vue'

const app = createApp({
  data() {
    return {
      count: 0
    }
  }
})

app.mount('#app')
```

The application instance exposes a `.config` object that allows us to configure a few app-level options. The application instance also provides a few methods for registering app-scoped assets. For example, registering a component: `app.component('TodoDeleteButton', TodoDeleteButton)`. This makes the `TodoDeleteButton` available for use anywhere in our app. Make sure to apply all app configurations before mounting the app.

#### Template Syntax
All Vue templates are syntactically valid HTML that can be parsed by spec-compliant browsers and HTML parsers. Under the hood, Vue compiles the templates into highly-optimized JavaScript code. Combined with the reactivity system, Vue is able to intelligently figure out the minimal number of components to re-render and apply the minimal amount of DOM manipulations when the app state changes.

The double mustaches interpret the data as plain text, not HTML. In order to output real HTML, you will need to use the `v-html` directive.

> Dynamically rendering arbitrary HTML on your website can be very dangerous because it can easily lead to XSS vulnerabilities. Only use `v-html` on trusted content and never on user-provided content.

Mustaches cannot be used inside HTML attributes. Instead, use a `v-bind` directive. If the bound value is `null` or `undefined`, then the attribute will be removed from the rendered element.

Each binding can only contain one single expression. An expression is a piece of code that can evaluate to a value. A simple check is whether it can be used after `return`. It is possible to call a component-exposed method inside a binding expression.

Template expressions are sandboxed and only have access to a restricted list of globals. The list exposes commonly used built-in globals such as `Math` and `Date`.

```js
const GLOBALS_WHITE_LISTED =
  'Infinity,undefined,NaN,isFinite,isNaN,parseFloat,parseInt,decodeURI,' +
  'decodeURIComponent,encodeURI,encodeURIComponent,Math,Number,Date,Array,' +
  'Object,Boolean,String,RegExp,Map,Set,JSON,Intl,BigInt'
```

A directive's job is to reactively apply updates to the DOM when the value of its expression changes. Modifiers are special postfixes denoted by a dot, which indicate that a directive should be bound in some special way. For example, the `.prevent` modifier tells the `v-on` directive to call `event.preventDefault()` on the triggered event.

#### Reactivity Fundamentals
We can create a reactive object or array with the `reactive()` function. Reactive objects are JavaScript Proxies and behave just like normal objects. The difference is that Vue is able to track the property access and mutations of a reactive object.

To use reactive state in a component's template, declare and return them from a component's `setup()` function. `setup` is a special hook dedicated for composition API.

Manually exposing state and methods via `setup()` can be verbose. When using SFCs, we can greatly simplify the usage with `<script setup>`. Top-level imports and variables declared in `<script setup>` are automatically usable in the template of the same component.

In Vue, state is **deeply reactive by default**. This means you can expect changes to be detected even when you mutate nested objects or arrays:

```js
import { reactive } from 'vue'

const obj = reactive({
  nested: { count: 0 },
  arr: ['foo', 'bar']
})

function mutateDeeply() {
  // these will work as expected.
  obj.nested.count++
  obj.arr.push('baz')
}
```

The returned value from `reactive()` is a Proxy of the original object, which is not equal to the original object. To ensure consistent access to the proxy, calling `reactive()` on the same object always returns the same proxy, and calling `reactive()` on an existing proxy also returns that same proxy.

It should be noted that the DOM updates are not applied synchronously. Instead, Vue buffers them until the "next tick" in the update cycle to ensure that each component needs to update only once no matter how many state changes you have made. To wait for the DOM update to complete after a state change, you can use the `nextTick()` global API.

The `reactive()` API has two limitations:
- It only works for object types. It cannot hold primitive types such as `string`, `number` or `boolean`.
- Since Vue's reactivity tracking works over property access, we must always keep the same reference to the reactive object. This means we can't easily "replace" a reactive object because the reactivity connection to the first reference is lost.

```js
const state = reactive({ count: 0 })

// n is a local variable that is disconnected from state.count
let n = state.count
// does not affect original state
n++

// count is also disconnected from state.count
let { count } = state
// does not affect original state
count++

// the function receives a plain number and
// won't be able to track changes to state.count
callSomeFunction(state.count)
```

To address the limitations of `reactive()`, Vue also provides a `ref()` function which allows us to create reactive "refs" that can hold any value type. `ref()` takes the argument and returns it wrapped within a ref object with a `.value` property, and the `.value` property is reactive.

```js
const obj = {
  foo: ref(1),
  bar: ref(2)
}

// the function receives a ref
// it needs to access the value via .value but it
// will retain the reactivity connection
callSomeFunction(obj.foo)

// still reactive
const { foo, bar } = obj
```

- When refs are accessed as top-level properties in the template, they are automatically "unwrapped" so there is no need to use `.value`.
- When a ref is accessed or mutated as a property of a reactive object, it is also automatically unwrapped so it behaves like a normal property.

#### Computed Properties
For complex logic that includes reactive data, it is recommended to use a computed property. The `computed()` function expects to be passed a getter function, and the returned value is a computed ref.

A computed property automatically tracks its reactive dependencies. It is important to remember that computed getter functions should only perform pure computation and be free of side effects.

Instead of a computed property, we can define the same function as a method. The difference is that computed properties are cached based on their reactive dependencies. A computed property will only re-evaluate when some of its reactive dependencies have changed. This also means the following computed property will never update, because `Date.now()` is not a reactive dependency:

```js
const now = computed(() => Date.now())
```

#### Class and Style Bindings
We can pass an object to `:class` to dynamically toggle classes. `:class="{ active: isActive }"` means the presence of the `active` class will be determined by the truthiness of the data property `isActive`. You can have multiple classes toggled by having more fields in the object. In addition, the `:class` directive can also co-exist with the plain `class` attribute.

We can bind `:class` to an array to apply a list of classes. If you would like to also toggle a class in the list conditionally, you can do it with a ternary expression.

```js
const activeClass = ref('active')
const errorClass = ref('text-danger')
<div :class="[activeClass, errorClass]"></div>

// which will render:
<div class="active text-danger"></div>

// with ternary expression:
<div :class="[isActive ? activeClass : '', errorClass]"></div>
```

When you use the `class` attribute on a component with a single root element, those classes will be added to the component's root element, and merged with any existing class already on it.

`:style` supports binding to JavaScript object values. (Although camelCase keys are recommended, `:style` also supports kebab-cased CSS property keys corresponding to how they are used in actual CSS.) It is often a good idea to bind to a style object directly so that the template is cleaner:

```js
const styleObject = reactive({
  color: 'red',
  fontSize: '13px'
})

<div :style="styleObject"></div>
```

When you use a CSS property that requires a vendor prefix in `:style`, Vue will automatically add the appropriate prefix. Vue does this by checking at runtime to see which style properties are supported in the current browser. If the browser doesn't support a particular property then various prefixed variants will be tested to try to find one that is supported.

#### Conditional Rendering
A `v-else` element must immediately follow a `v-if` or a `v-else-if` element.

If we want to toggle more than one element, we can use `v-if` on a `<template>` element, which serves as an invisible wrapper. The final rendered result will not include the `<template>` element. `v-else` and `v-else-if` can also be used on `<template>`.

`v-show` doesn't support the `<template>` element, nor does it work with `v-else`.

`v-if` is "real" conditional rendering because it ensures that event listeners and child components inside the conditional block are properly destroyed and re-created during toggles. `v-if` is also lazy: if the condition is false on initial render, it will not do anything - the conditional block won't be rendered until the condition becomes true for the first time. In comparison, `v-show` is much simpler - the element is always rendered regardless of initial condition, with CSS `display` property toggling.

Generally speaking, `v-if` has higher toggle costs while `v-show` has higher initial render costs. So prefer `v-show` if you need to toggle something very often, and prefer `v-if` if the condition is unlikely to change at runtime.

When `v-if` and `v-for` are both used on the same element, `v-if` will be evaluated first. That means the `v-if` condition will not have access to variables from the scope of the `v-for`. This can be fixed by moving `v-for` to a wrapping `<template>` tag. (It's not recommended to use `v-if` and `v-for` on the same element due to implicit precedence.)

#### List Rendering
We can use the `v-for` directive to render a list of items based on an array. The `v-for` directive requires a special syntax in the form of `item in items`, where `items` is the source data array and `item` is an alias for the array element being iterated on. In fact, you can use destructuring on the `v-for` item alias similar to destructuring function arguments. You can also use `of` as the delimiter instead of `in`, so that it is closer to JavaScript's syntax for iterators.

```vue
<li v-for="({ message }, index) in items">
  {{ message }} {{ index }}
</li>

<div v-for="item of items"></div>
```

`v-for` can also take an integer. In this case it will repeat the template that many times, based on a range of `1...n`.

Similar to template `v-if`, you can also use a `<template>` tag with `v-for` to render a block of multiple elements.

To give Vue a hint so that it can track each node's identity, and thus reuse and reorder existing elements, you need to provide a unique `key` attribute for each item. The `key` binding expects primitive values - i.e. strings and numbers. Do not use objects as `v-for` keys. When using `<template v-for>`, the key should be placed on the `<template>` container.

Vue is able to detect when a reactive array's **mutation methods** are called and trigger necessary updates. These mutation methods are: `push()`, `pop()` ,`shift()`, `unshift()`, `splice()`, `sort()`, `reverse()`.

In comparison, there are also non-mutating methods, e.g. `filter()`, `concat()` and `slice()`, which do not mutate the original array but always return a new array. When working with non-mutating methods, we should replace the old array with the new one.

> You might think this will cause Vue to throw away the existing DOM and re-render the entire list - luckily, that is not the case. Vue implements some smart heuristics to maximize DOM element reuse, so replacing an array with another array containing overlapping objects is a very efficient operation.

Sometimes we want to display a filtered or sorted version of an array without actually mutating or resetting the original data. In this case, you can create a computed property that returns the filtered or sorted array.

#### Event Handling
We can use the `v-on` directive, which we typically shorten to the `@` symbol, to listen to DOM events and run some JavaScript when they're triggered. The handler value can be one of the following:
- Inline handlers: Inline JavaScript to be executed when the event is triggered.
- Method handlers: A property name or path that points to a method defined on the component.

For example, `foo`, `foo.bar` and `foo['bar']` are treated as method handlers, while `foo()` and `count++` are treated as inline handlers.

A method handler automatically receives the native DOM Event object that triggers it, e.g., we are able to access the element dispatching the event via `event.target.tagName`.

Sometimes we also need to access the original DOM event in an inline handler. You can pass it into a method using the special `$event` variable, or use an inline arrow function.

```vue
<!-- using $event special variable -->
<button @click="warn('Form cannot be submitted yet.', $event)">Submit</button>

<!-- using inline arrow function -->
<button @click="(event) => warn('Form cannot be submitted yet.', event)">Submit</button>
```

It is a very common need to call `event.preventDefault()` or `event.stopPropagation()` inside event handlers. Vue provides event modifiers for `v-on`.

```vue
<!-- the click event's propagation will be stopped -->
<a @click.stop="doThis"></a>

<!-- the submit event will no longer reload the page -->
<form @submit.prevent="onSubmit"></form>

<!-- modifiers can be chained -->
<a @click.stop.prevent="doThat"></a>

<!-- only trigger handler if event.target is the element itself -->
<!-- i.e. not from a child element -->
<div @click.self="doThat">...</div>

<!-- use capture mode when adding the event listener -->
<!-- i.e. an event targeting an inner element is handled here before being handled by that element -->
<div @click.capture="doThis">...</div>

<!-- the click event will be triggered at most once -->
<a @click.once="doThis"></a>

<!-- the scroll event's default behavior (scrolling) will happen -->
<!-- immediately, instead of waiting for `onScroll` to complete  -->
<div @scroll.passive="onScroll">...</div>
```

> The `.capture`, `.once`, and `.passive` modifiers mirror the options of the native addEventListener method.

When listening for keyboard events, Vue allows adding key modifiers for `v-on` when listening for key events, providing aliases for the most commonly used keys: `.enter`, `.tab`, `.space`, `.up`, `.down`, `.ctrl`, `.shift`, `.meta`.

```vue
<input @keyup.page-down="onPageDown" />

<!-- Alt + Enter -->
<input @keyup.alt.enter="clear" />

<!-- Ctrl + Click -->
<div @click.ctrl="doSomething">Do something</div>
```

#### Form Input Bindings
When dealing with forms, we often need to sync the state of form input elements with corresponding state in JavaScript. `v-model` can be used on inputs of different types, `<textarea>`, and `<select>` elements. It automatically expands to different DOM property and event pairs based on the element it is used on:

- `<input>` with text types and `<textarea>` elements use `value` property and `input` event;
- `<input type="checkbox">` and `<input type="radio">` use `checked` property and `change` event;
- `<select>` use `value` as a prop and `change` as an event.

```html
<input
  type="checkbox"
  v-model="toggle"
  true-value="yes"
  false-value="no" />
```

`true-value` and `false-value` are Vue-specific attributes that only work with `v-model`. Here the `toggle` property's value will be set to 'yes' when the box is checked, and set to 'no' when unchecked.

We can also bind multiple checkboxes to the same array or Set value:

```html
<div>Checked names: {{ checkedNames }}</div>

<input type="checkbox" id="jack" value="Jack" v-model="checkedNames">
<label for="jack">Jack</label>

<input type="checkbox" id="john" value="John" v-model="checkedNames">
<label for="john">John</label>

<input type="checkbox" id="mike" value="Mike" v-model="checkedNames">
<label for="mike">Mike</label>
```

By default, `v-model` syncs the input with the data after each `input` event. You can add the `lazy` modifier to instead sync after `change` events. 

> Unlike the `input` event, the `change` event is not necessarily fired for each alteration to an element's value. For some elements, including `<input type="text">`, the change event doesn't fire until the control loses focus.

If you want user input to be automatically typecast as a number, you can add the `number` modifier to your `v-model` managed inputs. If the value cannot be parsed with `parseFloat()`, then the original value is used instead.

```html
<input v-model.lazy="msg" />

<input v-model.number="age" />

<input v-model.trim="msg" />
```

#### Lifecycle Hooks
Each Vue component instance goes through a series of initialization steps when it's created - for example, it needs to set up data observation, compile the template, mount the instance to the DOM, and update the DOM when data changes. Along the way, it also runs functions called lifecycle hooks, giving users the opportunity to add their own code at specific stages. Do note these hooks need to be registered synchronously during component setup. 

Setup (Composition API) -> beforeCreate -> created -> compile template on the fly -> beforeMount -> mounted -> beforeUpdate -> updated -> beforeUnmount -> unmounted

#### Watchers
There are cases where we need to perform "side effects" in reaction to state changes. With Composition API, we can use the `watch` function to trigger a callback whenever a piece of reactive state changes.

`watch`'s first argument can be different types of reactive "sources": it can be a ref (including computed refs), a reactive object, a getter function, or an array of multiple sources:

```js
const x = ref(0)
const y = ref(0)

// single ref
watch(x, (newX) => {
  console.log(`x is ${newX}`)
})

// getter
watch(
  () => x.value + y.value,
  (sum) => {
    console.log(`sum of x + y is: ${sum}`)
  }
)

// watch a property of a reactive object
// you can't watch a property of a reactive object like `watch(obj.count, () => {})`,
// which won't work because we are passing a number to watch()
watch(
  () => obj.count,
  (count) => {
    console.log(`count is: ${count}`)
  }
)

// array of multiple sources
watch([x, () => y.value], ([newX, newY]) => {
  console.log(`x is ${newX} and y is ${newY}`)
})
```

When you call `watch()` directly on a reactive object, it will implicitly create a deep watcher - the callback will be triggered on all nested mutations. This should be differentiated with a getter that returns a reactive object - in the latter case, the callback will only fire if the getter returns a different object. You can, however, force the second case into a deep watcher by explicitly using the `deep` option.

```js
const obj = reactive({ count: 0 })

watch(obj, (newValue, oldValue) => {
  // fires on nested property mutations
  // Note: `newValue` will be equal to `oldValue` here
  // because they both point to the same object
})

obj.count++

watch(
  () => state.someObject,
  (newValue, oldValue) => {
    // Note: `newValue` will be equal to `oldValue` here
    // unless state.someObject has been replaced
  },
  { deep: true }
)
```

> Deep watch requires traversing all nested properties in the watched object, and can be expensive when used on large data structures. Use it only when necessary and beware of the performance implications.

`watchEffect()` allows us to perform a side effect immediately while automatically tracking the effect's reactive dependencies. In below example, the callback will run immediately. During its execution, it will also automatically track `url.value` as a dependency. Whenever `url.value` changes, the callback will be run again.

```js
watchEffect(async () => {
  const response = await fetch(url.value)
  data.value = await response.json()
})
```

- `watch` only tracks the explicitly watched source. It won't track anything accessed inside the callback. In addition, the callback only triggers when the source has actually changed. `watch` separates dependency tracking from the side effect, giving us more precise control over when the callback should fire.
- `watchEffect`, on the other hand, combines dependency tracking and side effect into one phase. It automatically tracks every reactive property accessed during its synchronous execution. This is more convenient and typically results in terser code, but makes its reactive dependencies less explicit.

When you mutate reactive state, it may trigger both Vue component updates and watcher callbacks. By default, user-created watcher callbacks are called **before** Vue component updates. This means if you attempt to access the DOM inside a watcher callback, the DOM will be in the state before Vue has applied any updates. If you want to access the DOM in a watcher callback **after** Vue has updated it, you need to specify the `flush: 'post'` option. Post-flush `watchEffect()` also has a convenience alias, `watchPostEffect()`.

Watchers declared synchronously inside `<script setup>` are bound to the owner component instance, and will be automatically stopped when the owner component is unmounted.

#### Template Refs
While Vue's declarative rendering model abstracts away most of the direct DOM operations for you, there may still be cases where we need direct access to the underlying DOM elements. This may be useful when you want to, for example, programmatically focus an input on component mount, or initialize a 3rd party library on an element.

To achieve it, we can use the special `ref` attribute. Note that you can only access the ref after the component is mounted.

```vue
<script setup>
import { ref, onMounted } from 'vue'

// declare a ref to hold the element reference
// the name must match template ref value
const input = ref(null)

onMounted(() => {
  input.value.focus()
})
</script>

<template>
  <input ref="input" />
</template>
```

`ref` can also be used on a child component. In this case the reference will be that of a component instance.
- If the child component is using Options API or not using `<script setup>`, the referenced instance will be identical to the child component's `this`.
- A parent component referencing a child component using `<script setup>` won't be able to access anything unless the child component chooses to expose a public interface using the `defineExpose` macro.

```vue
<script setup>
import { ref } from 'vue'

const a = 1
const b = ref(2)

// the retrieved instance will be of the shape { a: number, b: number }
defineExpose({
  a,
  b
})
</script>
```

#### Components Basics
