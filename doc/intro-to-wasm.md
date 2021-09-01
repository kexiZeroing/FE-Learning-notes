## Intro to WebAssembly
WebAssembly is a way of taking code written in programming languages other than JavaScript and running that code in the browser.

### How JavaScript is run in the browser
JavaScript started out slow, but then got faster thanks to something called the **JIT ( just-in-time compiler)**. 

Interpreters are quick to get up and running. You don’t have to go through that whole compilation step before you can start running your code. You just start translating that first line and running it. But the con of using an interpreter comes when you’re running the same code more than once. For example, if you’re in a loop. Then you have to do the same translation over and over and over again.

Browsers added a new part to the JavaScript engine, called a monitor (aka a profiler). That monitor watches the code as it runs, and makes a note of how many times it is run and what types are used. At first, the monitor just runs everything through the interpreter. If the same lines of code are run a few times, that segment of code is called warm. If it’s run a lot, then it’s called hot. **When a function starts getting warm, the JIT will send it off to be compiled. Then it will store that compilation**. If the monitor sees that execution is hitting the same code again with the same variable types, it will just pull out its compiled version. When a part of the code is very hot, the monitor will send it off to the optimizing compiler. This will create another, even faster, version of the function that will also be stored.

### How compilers produce assembly
We don’t just have one target for our translation. It has many different kinds of machine code. In programming terms, this is like going from C, or C++, or Rust to x86 or to ARM. You want to be able to translate any one of these high-level programming languages down to any one of these assembly languages (which corresponds to the different architectures). Creating a whole bunch of different translators that can go from each language to each assembly is inefficient. To solve this, compilers will take the high-level programming language and translate it into something that’s not quite as high level, but also isn’t working at the level of machine code. And that’s called an **intermediate representation (IR)**. From there, another part of the compiler can take that IR and compile it down to something specific to the target architecture.

<img alt="assembly" src="https://z3.ax1x.com/2021/09/01/hBulA1.png" width="700" />

### Where does WebAssembly fit
Most WebAssembly module developers will code in languages like C and Rust and then compile to WebAssembly. Regardless of the compiler tool chain you’ve used, the end result is a file that ends in **`.wasm`**. You might think it is just another one of the target assembly languages. That is kind of true, except that it’s a machine language for a conceptual machine, not an actual, physical machine. Because when you’re delivering code to be executed on the user’s machine across the web, you don’t know what your target architecture the code will be running on.

WebAssembly instructions have a much more direct mapping to machine code than JavaScript source code. The browser downloads the WebAssembly, and then it can make the short hop from WebAssembly to that target machine’s assembly code.

<img alt="wasm" src="https://z3.ax1x.com/2021/09/01/hBuM7R.png" width="700" />

We expect that developers are going to use both WebAssembly and JavaScript in the same application. Even if you don’t write WebAssembly yourself, you can take advantage of it. WebAssembly modules define functions that can be used from JavaScript. So just like you download a module like lodash from npm, you will be able to download WebAssembly modules in the future.
