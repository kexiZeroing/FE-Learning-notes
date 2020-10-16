## this and globalThis
In most cases, the value of `this` is determined by how a function is called (runtime binding). `bind()` method can set the value of a function's `this` regardless of how it's called, and `arrow functions` which don't provide their own `this` binding. In non–strict mode, it's always a reference to an object and in strict mode can be any value.

Historically, accessing the global object has required different syntax in different JavaScript environments. On the web you can use `window`, `self`, or `frames`. In Node.js none of these work, and you must instead use `global`. The `globalThis` property provides a standard way of accessing the global `this` value across environments. Unlike similar properties such as `window` and `self`, it's guaranteed to work in window and non-window contexts. In this way, you can access the global object in a consistent manner without having to know which environment the code is being run in.

- In strict mode, if the value of `this` is not set when entering an execution context, it remains as `undefined`.
- In arrow functions, `this` retains the value of the enclosing lexical context's `this`. In global code, it will be set to the global object.
- As a constructor (with the `new` keyword), its `this` is bound to the new object being constructed.
- As a DOM event handler, `this` is set to the element on which the listener is placed, `this === e.currentTarget` is alwasy true.

```javascript
window.age = 10;
function Person() {
  this.age = 42;
  setTimeout(function () {
    console.log(this.age); // yields "10" 
  }, 100);
}

var p = new Person();

window.age = 10;
function Person() {
  this.age = 42;
  setTimeout(() => {
    console.log(this.age); // yields "42"
  }, 100);
}

var p = new Person();

function fruit(){
  return () => {
    console.log(this.name);
  }
}
var apple = {
  name: 'apple'
}
var banana = {
  name: 'banana'
}

var fruitCall = fruit.call(apple);
fruitCall();  // apple
fruitCall.call(banana);  // apple

/* 
1. The returned function is created as an arrow function, 
   so its `this` is permanently bound to its enclosing function.
2. When a function is called as a method of an object, 
   its `this` is set to the object the method is called on.
*/
var obj = {
  bar: function() {
    var x = (() => this);
    return x;
  }
};

var fn = obj.bar();
console.log(fn() === obj); // true

var fn2 = obj.bar;
console.log(fn2()() == window); // true
```

### Function.prototype.call() / apply()
While the syntax of `call()` function is almost identical to that of `apply()`, the fundamental difference is that `call()` accepts an **argument list**, while `apply()` accepts a single **array of arguments (or an array-like object)**. They provide a new value of `this` to the function. With call or apply, you can write a method once and then inherit it in another object, without having to rewrite the method for the new object. If the first argument is not passed, the value of `this` is bound to the global object (the value of `this` will be undefined in strict mode).

```javascript
const numbers = [5, 6, 2, 3, 7];
Math.max.apply(null, numbers);
Math.min.apply(null, numbers);


// `concat` does have the desired behaviour, but it does 
// not append to the existing array, instead it returns a new array.
const array = ['a', 'b'];
const elements = [0, 1, 2];
array.push.apply(array, elements);
console.info(array); // ["a", "b", 0, 1, 2]
```

### Function.prototype.bind()
The `bind()` method creates a new function that, when called, has its `this` keyword set to the provided value, **with a given sequence of arguments preceding any provided when the new function is called**.

`bind()` creates a new bound function, which **wraps the original function object**. Calling the bound function generally results in the execution of its wrapped function. A bound function has the following internal properties:

- `[[BoundTargetFunction]]` - the wrapped function object.
- `[[BoundThis]]` - the value that is always passed as `this` value when calling the wrapped function.
- `[[BoundArguments]]` - a list of values whose elements are used as the first arguments to any call to the wrapped function.
- `[[Call]]` - executes code associated with `this`. Invoked via a function call expression. 

When a bound function is called, **it calls internal method `[[Call]]` on `[[BoundTargetFunction]]` with `Call(boundThis, ...args)`. Where, boundThis is `[[BoundThis]]`, args is `[[BoundArguments]]` followed by the arguments passed by the new function call.

```javascript
// polyfill
var slice = Array.prototype.slice;
Function.prototype.bind = function() {
  var thatFunc = this;
  var thatArg = arguments[0];
  var args = slice.call(arguments, 1);
  if (typeof thatFunc !== 'function') {
    throw new TypeError('what is trying to be bound is not callable');
  }
  return function(){
    var funcArgs = args.concat(slice.call(arguments))
    return thatFunc.apply(thatArg, funcArgs);
  };
};
```

```javascript
var x = 9;
var module = {
  x: 81,
  getX: function() { return this.x; }
};

module.getX(); // 81

var retrieveX = module.getX;
retrieveX();  // 9

var boundGetX = retrieveX.bind(module);
boundGetX(); // 81

// make a function with pre-specified initial arguments
function list() {
  return Array.prototype.slice.call(arguments);
}

var leadingThirtysevenList = list.bind(null, 37);

var list1 = leadingThirtysevenList();  // [37]

var list2 = leadingThirtysevenList(1, 2, 3); // [37, 1, 2, 3]

// partially applied function
function addArguments(arg1, arg2) {
    return arg1 + arg2
}

var addThirtySeven = addArguments.bind(null, 37); 

var result2 = addThirtySeven(5);  // 37 + 5 = 42 

var result3 = addThirtySeven(5, 10);  // 37 + 5 = 42 , second argument is ignored

// setTimeout, explicitly bind this to the callback function
function LateBloomer() {
  this.petalCount = Math.floor(Math.random() * 12) + 1;
}

LateBloomer.prototype.bloom = function() {
  setTimeout(this.declare.bind(this), 1000);
};

LateBloomer.prototype.declare = function() {
  console.log('flower with ' + this.petalCount + ' petals!');
};

var flower = new LateBloomer();
flower.bloom();  // after 1 second, triggers the 'declare' method
```