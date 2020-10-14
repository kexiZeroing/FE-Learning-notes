## this
In most cases, the value of `this` is determined by how a function is called (runtime binding). `bind()` method can set the value of a function's `this` regardless of how it's called, and `arrow functions` which don't provide their own `this` binding (it retains the `this` value of the enclosing lexical context).

### Function.prototype.call() / apply()
