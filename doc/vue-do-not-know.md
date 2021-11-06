## Some Vue Knowledge

### computed and watch
Computed properties are a calculated result of its dependent values (in Vue data properties, props). They are used whenever you have some data and need to transform it before using it in the template. In this case, creating a computed property is the best thing because **it’s cached**. They should not have any side effects and they have to be synchronous.

Watch properties are just a mechanism to detect changes in properties, allowing you to perform custom logic. It runs when the thing you're watching changes, like a listener. In general, the gist is: Try to use computed properties and if they won’t work, use a watcher.

Filters (pipe in template) are removed from Vue 3.0 and no longer supported. Instead, we recommend replacing them with method calls or computed properties.

### nextTick
The key concept to understand is that the DOM is updated asynchronously. **When you change a value in Vue, the change is not immediately rendered to the DOM**. Instead, Vue queues a DOM update and then, on a timer, updates the DOM. Most of the time we don’t need to care about this, but it can be tricky when you want to do something that depends on the post-update DOM state. In order to wait until Vue has finished updating the DOM after a data change, you can use `Vue.nextTick(callback)` immediately after the data is changed. The callback will be called after the DOM has been updated.
