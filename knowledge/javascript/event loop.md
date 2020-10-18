## Event Loop
JavaScript is **single-threaded**, and it has a concurrency model based on an event loop, which is responsible for executing the code, collecting and processing events, and executing queued tasks. 

### Runtime concepts
- Stack (Call Stack)  
A single call stack in which it keeps track of what function we’re currently executing and what function is to be executed after that.

- Heap  
Objects are allocated in a heap which is just a name to denote a large (mostly unstructured) region of memory.

- Queue (Message Queue / Callback Queue / Task Queue)  
A JavaScript runtime uses a message queue, which is a list of messages to be processed. Each message has an associated function which gets called in order to handle the message. 

- Event Loop  
The Event Loop is a constantly running process and it has one simple job — to monitor the Call Stack and the Callback Queue. If the Call Stack is empty, it will take the first event from the queue and will push it to the Call Stack.

<img alt="event loop" src="https://cdn.nlark.com/yuque/0/2019/png/398686/1562831601090-3cc36a70-c081-498f-986b-3333c0dc8dd0.png" width="800">  

### Never blocking
A property of the event loop model is that JavaScript, unlike a lot of other languages, never blocks. Handling I/O is typically performed via events and callbacks, so when the application is waiting for an IndexedDB query to return or an XHR request to return, it can still process other things like user input.

Zero delay doesn't actually mean the call back will fire-off after zero milliseconds. Basically, the `setTimeout` needs to wait for all the code for queued messages to complete even though you specified a particular time limit for your setTimeout. For that reason, the delay indicates a minimum time and not a guaranteed time.

```javascript
const s = new Date().getSeconds();

setTimeout(function() {
  // prints out "2", the callback is not called immediately after 500 milliseconds
  console.log("Ran after " + (new Date().getSeconds() - s) + " seconds");
}, 500)

while (true) {
  if (new Date().getSeconds() - s >= 2) {
    console.log("Good, looped for 2 seconds")
    break;
  }
}
```

**A web worker or a cross-origin iframe has its own stack, heap, and message queue**. Two distinct runtimes can only communicate through sending messages via the `postMessage` method. This method adds a message to the other runtime if the latter listens to message events.

And what are these **Web APIs**? In essence, they are threads that you can’t access, you can just make calls to them. They are the pieces of the browser in which concurrency kicks in. If you’re a Node.js developer, these are the C++ APIs.

### Single thread limitation
A downside of this model is that if a message takes too long to complete, the web application is unable to process user interactions like click or scroll. The browser mitigates this with the "a script is taking too long to run" dialog.

### Microtask and Macrotask
Deep down the task queue, something else is going on. The tasks are broken down further into microtask and macrotask. **A task queue is a macrotask queue.** 

- Macrotasks are enqueued by `setTimeout`, `setInterval`, `setImmediate`, etc. 
- Microtasks are enqueued by `process.nextTick`, `Promises`, `MutationObserver`, etc.

At one event loop cycle a macrotask is processed and then all microtasks queue are run.
```javascript
while (eventLoop.waitForTask()) {
  const taskQueue = eventLoop.selectTaskQueue()
  if (taskQueue.hasNextTask()) {
    taskQueue.processNextTask()
  }
  const microtaskQueue = eventLoop.microTaskQueue
  while (microtaskQueue.hasNextMicrotask()) {
    microtaskQueue.processNextMicrotask()
  }
}
```

```javascript
console.log('script start');  // 1
setTimeout(function() {
  console.log('setTimeout');  // 5 
}, 0);
Promise.resolve().then(function() {
  console.log('promise1');   // 3
}).then(function() {
  console.log('promise2');   // 4
});
console.log('script end');   // 2
```

You may argue that setTimeout should be logged first because a macrotask is run first before clearing the microtask queue. Well, you are right. But, **no code runs in JS unless an event has occurred. The event is queued as a macrotask**. At the execution of any JS file, the JS engine wraps the contents in a function and associates the function with an event `start`, and add the event to the task queue as a macrotask. After emits the program start event, the JavaScript engine pulls that event off the queue and executes the registered handler, and then our program runs.

The callback runs our code, `script start` is printed at first. Next, the `setTimeout` function is called which queues a macrotask with the handler. Then, the `Promise` call queues a microtask, then prints `script end`. The initial callback exits.

As it is a macrotask, then microtasks are processed. The Promise callback is run which logs `promise1`, it returns and queues another microtask through its `then` function. It is processed which prints `promise2`. **(microtasks can queue extra microtasks in one cycle, and all are processed before yielding control to the next macrotask cycle)**. Now no other microtasks are queued and the microtask queue is empty. The initial macrotask is cleared, remaining the macrotask by the `setTimeout` function.

```javascript
setTimeout(() => console.log(1), 0)
new Promise((resolve, reject) => {
    console.log(2)
    for (let i = 0; i < 10000; i++) {
        i === 9999 && resolve()
    }
    console.log(3)
}).then(() => {
    console.log(4)
})
console.log(5)
/*
output：2 3 5 4 1
*/
```

### More deep about call stack
Before the JS Engine executes a function, it stores the address of the function in the call stack. At the low level, there are “registers”: `AX`, `BX`, `CX`, `SP`, `IP`. These are used by the CPU to temporary store variables and run our program. `AX` and `BX` are used for calculations, `CX` is used for counter jobs in a loop. `SP`(Stack Pointer) holds the current address of the stack, `IP`(Instruction Pointer) holds the current address of the program to be executed.

We see our program loaded, then our call stack, `SP`, and `IP`. The CPU starts execution by looking at the `IP` (loaded with entry point of the program) to know where to start. Whenever a call to a function is made, jump to the function in memory and executes it from there. Then, on completion of the function, the previous function from where it jumped must be continued. The return address must be saved, so the Call Stack comes to the rescue. On every function call, the current value in the `IP` is pushed to the Call Stack. When it returns, the address is popped from the Call Stack to the `IP`. This tells CPU to continue execution from this address.
