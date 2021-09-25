## Promise
A `Promise` is a proxy for a value not necessarily known when the promise is created. The Promise object represents the eventual completion or failure of an asynchronous operation and its success value or failure reason. Instead of immediately returning the final value, the asynchronous method returns a promise to supply the value at some point in the future.

A Promise is in one of these states: `pending`, `fulfilled`, `rejected`. A promise is said to be `settled` if it is either fulfilled or rejected, but not pending. A pending promise can either be fulfilled with a value or rejected with an error. When either of these options happens, the associated handlers queued up by a promise's `then` method are called. Note that **promises are guaranteed to be asynchronous**, so an action for an already "settled" promise will occur only after the stack has cleared and a clock-tick has passed.

```javascript
let p = function(){
  return new Promise(function(resolve, reject) {
    setTimeout(() => resolve('foo'), 300);
  });
}

p().then(function(value) {
  console.log(value);  // "foo"
});

const promiseA = new Promise((resolutionFunc, rejectionFunc) => {
  resolutionFunc(777);
});
// At this point, "promiseA" is already settled
promiseA.then(val => console.log("asynchronous logging has val:", val));
console.log("immediate logging");

// produces output in this order:
// immediate logging
// asynchronous logging has val: 777
```

### Prototype methods
```javascript
p.then(onFulfilled [, onRejected]);

p.then((value) => {
  // fulfillment
}, (reason) => {
  // rejection
});

p.catch(function(reason) {
   // rejection
});

p.finally(function() {
   // settled (fulfilled or rejected)
});
```

The methods `promise.then()`, `promise.catch()`, and `promise.finally()` are used to associate further **asynchronous** action with a promise that becomes settled. (A `finally` callback will not receive any argument, since there's no reliable means of determining if the promise was fulfilled or rejected). **These methods also return a newly generated promise object, which can be used for chaining.**

- returns a value, the promise returned by `then` gets resolved with the returned value as its value.
- doesn't return anything, the promise returned by `then` gets resolved with an undefined value.
- throws an error, the promise returned by `then` gets rejected with the thrown error as its value.
- returns an already fulfilled promise, the promise returned by `then` gets fulfilled with that promise's value as its value.
- returns an already rejected promise, the promise returned by `then` gets rejected with that promise's value as its value.
- returns another pending promise object, an equivalent Promise will be exposed to the subsequent `then` in the method chain.

```javascript
Promise.resolve('foo')
  // 1. Receive "foo", concatenate "bar" to it, and resolve that to the next then
  .then(function(string) {
    return new Promise(function(resolve, reject) {
      setTimeout(function() {
        string += 'bar';
        resolve(string);
      }, 1);
    });
  })
  // 2. receive "foobar", register a callback function to work on that string,
  // but after returning the unworked string to the next then
  .then(function(string) {
    setTimeout(function() {
      string += 'baz';
      console.log(string);
    }, 1);
    return string;
  })
  // 3. print messages will be run before the string is actually processed
  .then(function(string) {
    console.log(string);
  });

// logs, in order:
// foobar
// foobarbaz

Promise.resolve()
  .then(() => {
    // makes .then() return a rejected promise
    throw new Error('Oh no!');
  })
  .then(() => {
    console.log('Not get called.');
  }, error => {
    console.error('onRejected function called: ' + error.message);
  });

Promise.resolve()
  .then(() => {
    throw new Error('Oh no!');
  })
  .catch(error => {
    console.error('onRejected function called: ' + error.message);
  })
  .then(() => {
    console.log("I am always called even if the prior then's promise rejects");
  });
```

### Static methods
`Promise.resolve()` method returns a Promise object that is resolved with a given value. `Promise.reject()` method returns a Promise object that is rejected with a given reason.

```javascript
Promise.resolve('Success').then(function(value) {
  console.log(value);
});

Promise.reject(new Error('fail')).then(function() {
  // not called
}, function(error) {
  console.log(error);
});
```

`Promise.all()` method returns a single Promise that resolved when all of the promises passed as an iterable (such as an Array) have resolved or when the iterable contains no promises. It rejects immediately upon any of the input promises rejecting, and will reject with this first rejection message.

```javascript
var p1 = Promise.resolve(3);
var p2 = 1337;
var p3 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve("foo");
  }, 100);
}); 

Promise.all([p1, p2, p3]).then(values => { 
  console.log(values);  // [3, 1337, "foo"] 
});

function loadImg(src){
  return new Promise((resolve,reject) => {
    let img = document.createElement('img');
    img.src = src;
    img.onload = () => resolve(img);
    img.onerror = (err) => eject(err);
  })
}

function showImgs(imgs){
  imgs.forEach(function(img){
    document.body.appendChild(img)
  })
}

Promise.all([
  loadImg('1.jpg'),
  loadImg('2.jpg'),
  loadImg('3.jpg')
]).then(showImgs);
```

`Promise.race()` method returns a promise that fulfills or rejects as soon as one of the promises in an iterable fulfills or rejects, with the value or reason from that promise.

```javascript
var p1 = new Promise(function(resolve, reject) { 
    setTimeout(() => resolve('one'), 500); 
});
var p2 = new Promise(function(resolve, reject) { 
    setTimeout(() => resolve('two'), 100); 
});

Promise.race([p1, p2]).then(function(value) {
  console.log(value); // "two"
});

var p3 = new Promise(function(resolve, reject) { 
    setTimeout(() => resolve('three'), 500); 
});
var p4 = new Promise(function(resolve, reject) { 
    setTimeout(() => reject(new Error('four')), 100);
});

Promise.race([p3, p4]).then(function(value) {
  // not called
}, function(error) {
  console.log(error.message); // "four"
});
```

`Promise.allSettled()` method (in ES2020) returns a promise that resolves after all of the given promises have either fulfilled or rejected, with an array of objects that each describes the outcome of each promise.

```javascript
Promise.allSettled([
  Promise.resolve(33),
  new Promise(resolve => setTimeout(() => resolve(66), 0)),
  99,
  Promise.reject(new Error('an error'))
])
.then(values => console.log(values));

// [
//   {status: "fulfilled", value: 33},
//   {status: "fulfilled", value: 66},
//   {status: "fulfilled", value: 99},
//   {status: "rejected",  reason: Error: an error}
// ]
```

`Promise.any()` method (in ES2021) runs promises in parallel and resolves to the value of the first successfully resolved promise. Even if some promises get rejected, these rejections are ignored. However, if all promises in the input array are rejected or if the input array is empty, then `Promise.any()` rejects with an aggregate error containing all the rejection reasons of the input promises.

## async & await
Async functions can contain zero or more `await expressions`. Await expressions suspend progress through an async function, yielding control and subsequently resuming progress only when an awaited promise-based asynchronous operation is either fulfilled or rejected. **The resolved value of the promise is treated as the return value of the await expression**. 

- Async functions always return a promise. If the return value of an async function is not explicitly a promise, it will be implicitly wrapped in a promise.
- You can use await with any function which returns a promise. The function you're awaiting doesn't need to be async necessarily.
- The await keyword is only valid inside async functions.
- Use of `async / await` enables the use of ordinary `try / catch` blocks around asynchronous code.

```javascript
function resolveAfter2Seconds() {
  return new Promise(resolve => {
    setTimeout(function() {
      resolve("slow")
    }, 2000)
  })
}

function resolveAfter1Second() {
  return new Promise(resolve => {
    setTimeout(function() {
      resolve("fast")
    }, 1000)
  })
}

async function sequentialStart() {
  // 1. Execution gets here almost instantly
  console.log('==SEQUENTIAL START==')

  const slow = await resolveAfter2Seconds()
  console.log(slow) // 2. runs 2 seconds after 1

  const fast = await resolveAfter1Second()
  console.log(fast) // 3. runs 3 seconds after 1
}

async function concurrentStart() {
  console.log('==CONCURRENT START with await==')

  const slow = resolveAfter2Seconds() // starts timer immediately
  const fast = resolveAfter1Second() // starts timer immediately

  // 1. Execution gets here almost instantly
  console.log(await slow) // 2. runs 2 seconds after 1
  console.log(await fast) // 3. runs 2 seconds after 1, immediately after 2, since fast is already resolved
}

function concurrentPromise() {
  console.log('==CONCURRENT START with Promise.all==')
  
  return Promise.all([resolveAfter2Seconds(), resolveAfter1Second()])
    .then((messages) => {
      console.log(messages[0])  
      console.log(messages[1])
    })
}

async function parallel() {
  console.log('==PARALLEL with await Promise.all==')
  
  // Start 2 "jobs" in parallel and wait for both of them to complete
  // after 1 second, logs "fast", then after 1 more second, "slow"
  await Promise.all([
      (async() => console.log(await resolveAfter2Seconds()))(),
      (async() => console.log(await resolveAfter1Second()))()
  ])
}
```
