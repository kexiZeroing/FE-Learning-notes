## Some Vue Knowledge

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
