## Whiteboard coding interview
Implement the js bind function.
```js
Function.prototype.myBind = function(ctx, ...args) {
  return (...innerArgs) => this.call(ctx, ...args, ...innerArgs);
};
```

Implement a curry function that takes multiple arguments into evaluating a sequence of functions, each with a single argument.
```js
function curry(fn) {
  const ctx = this;
  function inner(...args) {
    if (args.length === fn.length) return fn.call(ctx, ...args);
    return (...innerArgs) => inner.call(ctx, ...args, ...innerArgs);
  }

  return inner;
}

// test
function sum(a, b, c) {
  return a + b + c; 
}
curry(sum)(1);
curry(sum)(1)(2);
curry(sum)(1)(2)(3); 
curry(sum)(1,2,3);
```

Write a function that takes another function and returns a "memoized" version of that function. A "memoized" version of a function caches and returns the results of its call so that when it is called again with the same input, it doesn’t run its computation but instead returns the results from cache.
```js
function memoize(fn) {
  const memory = new Map();

  return function(arg) {
    if (!memory.has(arg)) {
      memory.set(arg, fn(arg));
    } 
    return memory.get(arg);
  }
}

// test
let foo = function(x) {
  console.log("calculating!");
  return x + 5;
}
var memoizedFoo = memoize(foo);
memoizedFoo(5);
memoizedFoo(5);
```

Implement the map with reduce function.
```js
function implementMapUsingReduce(list, func) {
  return list.reduce((acc, cur, i) => {
    acc[i] = func(cur);
    return acc;
  }, []);
}

// test
implementMapUsingReduce([1, 2, 3, 4], a => a + 1);  // [2,3,4,5]
implementMapUsingReduce(["a", "b", "c"], a => a + "!");  // ['a!', 'b!', 'c!']
```

Implement calling click event listener only once without using `{once: true}`.
```js
function clickOnce(el, cb) {
  const cb2 = () => {
    cb();
    el.removeEventListener('click', cb2, false);
  }
  el.addEventListener('click', cb2, false);
}

clickOnce($0, () => console.log('click'));
```

Get all the HTML tags in a web page and output them by a descending order of their occurrences.
```js
function getAllHTMLTags() {
  const mapper = {};
  const tags = [...document.querySelectorAll('*')].map(dom => dom.tagName);
  
  for (let i = 0; i < tags.length; i++) {
    const tag = tags[i];
    if (mapper[tag] === void 0) {
        mapper[tag] = 1;
    }
    else mapper[tag] += 1;
  }
  
  return Object.entries(mapper).sort((a, b) => b[1] - a[1]).map(q => q[0]);
}
```

Given a string as the key and return the corresponding value in the object.
```js
function getVal(str, obj) {
  const keys = str.split(".");
  if (!keys.length) return;
  
  return keys.reduce((acc, cur) => (acc !== void 0 ? acc[cur] : acc), obj);
}

// test
getVal("a", { a: 1 });  // 1
getVal("b", { a: 1 });  // undefined
getVal("a.b", { a: { b: "c" } });  // c
getVal("a", { a: { b: "c" } });  // { b: "c" }
getVal("a.b.c.d.e.f", { a: { b: "c" } });  // undefined
```

Given a URL and a key, return the corresponding value in that URL query.
```js
function getUrlParams(key, url) {
  const query = url.split('?');
  if (query.length <= 1) return null;

  const pairs = query[1].split('&');
  const res = pairs
    .filter(pair => {
      const [k] = pair.split('=');
      return k === key;
    })
    .map(pair => {
      const [, v] = pair.split('=');
      return v;
    });
  
  if (res.length === 0) return null;
  if (res.length === 1) return res[0];
  return res;
}

// test
getUrlParams("a", "http://test.com?a=1&b=2&a=3");  // ["1", "3"]
getUrlParams("b", "http://test.com?a=1&b=2&a=3");  // "2"
getUrlParams("c", "http://test.com?a=1&b=2&a=3");  // null
```

Use setTimeout to invoke a function multiple times in the fixed interval.
```js
function repeat(func, times, ms, immediate) {
  let count = 0;

  function inner(...args) {
    count++;  
    if (count === 1 && immediate) {
      func.call(null, ...args);
    }
    if (count >= times) {
      return;
    }
    setTimeout(() => {
      inner.call(null, ...args);
      func.call(null, ...args);
    }, ms);
  }
  
  return inner;
}

// test
const repeatFunc = repeat(console.log, 4, 3000, true);
repeatFunc("hello"); 
```

Implement a simple data binding, and the given function will get called if modify the given object.
```js
function bindData(obj, fn) {
  Object.keys(obj).map(key => {
    let v = obj[key];
    Object.defineProperty(obj, key, {
      get() {
        console.log('reading...');
        return v;
      },
      set(val) {
        v = val;
        fn();
      }
    });
  });
}

// test
let obj = { a: 1 };
function foo() {
  console.log('modifying...');
}

bindData(obj, foo);
obj.a = 2; 
```

Basic Promise implementation after simplified.
```js
const PENDING = 0;
const FULFILLED = 1;
const REJECTED = 2;

function doResolve(fn, onFulfilled, onRejected) {
  var done = false;
  try {
    fn(function(value) {
      if (done) return;
      done = true;
      onFulfilled(value);
    }, function(reason) {
      if (done) return;
      done = true;
      onRejected(reason);
    })
  } catch (ex) {
    if (done) return;
    done = true;
    onRejected(ex);
  }
}

function Promise(fn) {
  let state = PENDING;
  let value = null;
  let handlers = [];

  function fulfill(result) {
    state = FULFILLED;
    value = result;
    handlers.forEach(handle);
    handlers = null;
  }

  function reject(error) {
    state = REJECTED;
    value = error;
    handlers.forEach(handle);
    handlers = null;
  }

  function handle(handler) {
    if (state === PENDING) {
      handlers.push(handler);
    } else {
      if (state === FULFILLED && typeof handler.onFulfilled === 'function') {
        handler.onFulfilled(value);
      }
      if (state === REJECTED && typeof handler.onRejected === 'function') {
        handler.onRejected(value);
      }
    }
  }

  this.done = function(onFulfilled, onRejected) {
    handle({
      onFulfilled: onFulfilled,
      onRejected: onRejected
    });
  }

  doResolve(fn, fulfill, reject);
}
```
