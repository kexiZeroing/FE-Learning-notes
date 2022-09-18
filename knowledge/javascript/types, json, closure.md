## Data and Structure types
**number, string, boolean, undefined, null, object, symbol, bigInt**

```javascript
typeof 37 === 'number';
typeof 42n === 'bigint';
typeof true === 'boolean';
typeof 'a' === 'string';
typeof Symbol() === 'symbol'
typeof undefined === 'undefined';
typeof {a: 1} === 'object';
typeof function() {} === 'function';
typeof null === "object"

Object.prototype.toString.call({})              // '[object Object]'
Object.prototype.toString.call([])              // '[object Array]'
Object.prototype.toString.call(() => {})        // '[object Function]'
Object.prototype.toString.call('seymoe')        // '[object String]'
Object.prototype.toString.call(1)               // '[object Number]'
Object.prototype.toString.call(true)            // '[object Boolean]'
Object.prototype.toString.call(Symbol())        // '[object Symbol]'
Object.prototype.toString.call(null)            // '[object Null]'
Object.prototype.toString.call(undefined)       // '[object Undefined]'
Object.prototype.toString.call(new Set())       // '[object Set]'
Object.prototype.toString.call(new Map())       // '[object Map]'
```

The `Number` type is a double-precision 64-bit binary format IEEE 754 value, and each digit represents 4-bits, hence 64-bit has 16 digits. That's why some numbers are rounded while represented in more than 16 digits.

The `String` type is used to represent textual data. It is a set of "elements" of 16-bit unsigned integer values (UTF-16 code unit).

> Typically an `int` contains 32 bits. Let's look at 4-bit integers. Tiny, but useful for illustration purposes. Since there are four bits in such an integer, it can assume one of 16 values. What are those values? The answer depends on whether this integer is a `signed int` or an `unsigned int`. Signed integers can represent both positive and negative numbers, while unsigned integers are only non-negative.

```js
// Here are the 16 possible values of a four-bit signed int
bits  value   
0000    0
0001    1
0010    2
0011    3
0100    4
0101    5
0110    6
0111    7
1000   -8
1001   -7
1010   -6
1011   -5
1100   -4
1101   -3
1110   -2
1111   -1
```

### Number static properties and BigInt
- To check for the largest available value or smallest available value within `±Infinity`, you can use the constants `Number.MAX_VALUE` or `Number.MIN_VALUE`. Values larger than `MAX_VALUE` are represented as `Infinity`.
- `Number.MAX_SAFE_INTEGER` is the largest integer which can be used safely in calculations, for example, `Number.MAX_SAFE_INTEGER + 1 === Number.MAX_SAFE_INTEGER + 2` is true. Any integer larger than `Number.MAX_SAFE_INTEGER` cannot always be represented in memory accurately and will be a double-precision floating point approximation of the value. (also have `Number.MIN_SAFE_INTEGER` constant)
- `Number.MAX_VALUE` is the largest number possible to represent using a double precision floating point representation. 
- With the introduction of `BigInt`, you can operate with numbers beyond the `Number.MAX_SAFE_INTEGER`. A `BigInt` is created by appending `n` to the end of an integer or by calling the constructor.

### Integer Math
In C if `x` and `y` are integers then `x / y` will do integer division, rounding the result down. In JavaScript `x / y` will always be a floating point division with a floating point result. But if you apply a bitwise operator right afterward, then the result will be rounded down, converted to integer, and you'll get the same number as C did. (Of course you don't want your bitwise operator to change the result, so you can do a no-op bitwise operation such as `>> 0` or `| 0`.)

JavaScript turns out to have a full set of bit manipulation instructions. The bitwise `and/or/xor/not/shift` operators are just like C, and I have no idea why JavaScript originally had them because they don't seem very useful for web development. Also that's weird when all numbers are double precision floating point, right? Nobody does bitwise operations on floating point numbers. And neither does JavaScript. In fact, JavaScript will first round your 64-bit double to a 32-bit signed integer, do the bitwise operation, and then convert it back to a double precision value. Weird!

Once [asm.js](https://en.wikipedia.org/wiki/Asm.js) started doing `| 0` everywhere, people started being very interested in optimizing it. It turns out that if you add a `| 0` after every operation, your JavaScript JIT compiler can skip the redundant conversions too, and just keep your numbers as integers the whole time. When the inputs to a division are known to be integers, and `| 0` converts it to integer again afterward, then instead of emitting two conversions to floating point, a floating point division instruction, and then a conversion to integer, the JIT can emit a single integer division instruction, just like a C compiler would, without changing the result at all.

### Why `[] + {}` is `"[object Object]"`
Firstly convert both operands to primitive values, and try `valueOf()` followed by `toString()`. If either of them is a string, do `String(a) + String(b)`, otherwise do `Number(a) + Number(b)`.

Another example is `{} > []`. In the case of `{}`, it first tries to call `valueOf` on the object but that returns `{}`. Since `typeof {} === "object"`, it then calls `toString` and gets `"[object Object]"`. In the case of `[]`, calling `valueOf` returns `[]`, and since `typeof [] === "object"`, it calls `toString` and the return value of `Array.prototype.toString()` on an empty array is an empty string. So we get `"[object Object]" > ""`.

> Why you get an error when you attempt to run `{} > []` in the browser? **Block statements are evaluated before expressions**, so when the interpreter sees curly braces when not in an expression context, it interprets them as a block rather than an object literal. The way to force the interpreter to see `{}` as an object literal instead of as a block is to wrap it in parentheses.

## JSON stringify and parse
### JSON.stringify(value[, replacer[, space]])
You will get `[object Object]` if you are concatenating an object to string. The default conversion from an object to string is "[object Object]", which uses `toString()` method in the object. 

`JSON.stringify` turns a JavaScript object into JSON text and stores that JSON text in a string. 
- If the value has a `toJSON()` method, it's responsible to define what data will be serialized.
- `Boolean`, `Number`, and `String` objects are converted to the corresponding primitive values.
- `undefined`, `Functions`, and `Symbols` are not valid JSON values. If any such values are encountered during conversion they are either omitted (when found in an object) or changed to `null` (when found in an array).
- All `Symbol`-keyed properties will be completely ignored.

```javascript
JSON.stringify({ x: 5 });             // '{"x":5}'
JSON.stringify(true);                 // 'true'
JSON.stringify([1, 'false', false]);  // '[1,"false",false]'
JSON.stringify(null);                 // 'null'

JSON.stringify({ x: 5, y: 6, toJSON(){ return this.x + this.y; } });
// '11'

JSON.stringify({ x: [10, undefined, function(){}, Symbol('')] }); 
// '{"x":[10,null,null,null]}' 
```

The `replacer` parameter can be either an array or a function. As an array, the array's values **indicate the names of the properties that should be included in the resulting JSON string**. If replacer is a function, it takes two parameters: the key and the value being stringified. It returns the value that should be added to the JSON string, as follows:
- If you return a `Number`, `String`, `Boolean`, or `null`, the stringified version of that value is used as the property's value.
- If you return a `Function`, `Symbol`, or `undefined`, the property is not included in the output.
- If you return any other object, the object is recursively stringified.

The `space` argument may be used to control spacing in the final string.
- If it is a number, successive levels in the stringification will each be indented by this # of space characters.
- If it is a string, successive levels will be indented by this string.

```javascript
function replacer(key, value) {
  if (typeof value === 'string') {
    return undefined;
  }
  return value;
}

const foo = {foundation: 'Mozilla', model: 'box', week: 45, month: 7};
JSON.stringify(foo, replacer);
// '{"week":45, "month":7}'

JSON.stringify(foo, ['week', 'month']);  
// '{"week":45, "month":7}', only keep "week" and "month" properties

JSON.stringify({ uno: 1, dos: 2 }, null, '\t');
// '{
//     "uno": 1,
//     "dos": 2
// }'
```

### JSON.parse(text[, reviver])
`JSON.parse` parses a JSON string, constructing the JavaScript value or object described by the string. An optional reviver function can be provided to perform a transformation on the resulting object before it is returned. **`JSON.parse()` does not allow trailing commas and single quotes.**

```javascript
JSON.parse('{}');              // {}
JSON.parse('true');            // true
JSON.parse('[1, 5, "false"]'); // [1, 5, "false"]
JSON.parse('null');            // null

JSON.parse('{"p": 5}', (key, value) =>
  typeof value === 'number' ? value * 2 : value
);
// { p: 10 }

JSON.parse('{"1": 1, "2": 2, "3": {"4": 4, "5": {"6": 6}}}', (key, value) => {
  console.log(key); // log the current property name, the last is ""
  return value; 
});
//1 2 4 6 5 3 ""
```

## Closure
**Lexical scoping**, which describes how a parser resolves variable names when functions are nested. The word "lexical" refers to the fact that lexical scoping uses **the location where a variable is declared within the source code to determine where that variable is available**. Nested functions have access to variables declared in their outer scope.

**A closure is the combination of a function and the lexical environment within which that function was declared.** This environment consists of any local variables that were in-scope at the time the closure was created. The instance of function maintains a reference to its lexical environment, within which the variable name exists. Closures are useful because they let you associate data (the lexical environment) with a function that operates on that data.

```javascript
function makeAdder(x) {
  return function(y) {
    return x + y;
  };
}

// add5 and add10 are both closures. They store different lexical environments.
var add5 = makeAdder(5);
var add10 = makeAdder(10);

console.log(add5(2));  // 7
console.log(add10(2)); // 12
```

It is possible to emulate private methods using closures. Private methods provide a way to **manage global namespace**. Using closures in this way is known as the **module pattern**. The shared lexical environment is created in the body of an anonymous function, which is executed as soon as it has been defined. The lexical environment contains private items, and neither of these private items can be accessed directly from outside. Instead, **they must be accessed by the public functions that are returned from the anonymous wrapper**. Using closures in this way provides a number of benefits that are normally associated with object-oriented programming -- in particular, data hiding and encapsulation.

```javascript
const counter = (function() {
  let privateCounter = 0;

  function changeBy(val) {
    privateCounter += val;
  }

  return {
    increment: function() {
      changeBy(1);
    },
    decrement: function() {
      changeBy(-1);
    },
    value: function() {
      return privateCounter;
    }
  };
})();

console.log(counter.value()); // logs 0
counter.increment();
counter.increment();
console.log(counter.value()); // logs 2
counter.decrement();
console.log(counter.value()); // logs 1
```

### Creating closures in loops: A common mistake
```javascript
const helpText = [
    {'id': 'email', 'help': 'Your e-mail address'},
    {'id': 'name', 'help': 'Your full name'},
    {'id': 'age', 'help': 'Your age (you must be over 16)'}
  ];

for (var i = 0; i < helpText.length; i++) {
  var item = helpText[i];
  document.getElementById(item.id).onfocus = function() {
    showHelp(item.help);
  }
}
```
Three closures have been created by the loop, but each one **shares the same single lexical environment. This is because the variable item is declared with `var` and thus has function scope due to hoisting**. 

```javascript
// solution 1: use anonymous closures
for (var i = 0; i < helpText.length; i++) {
  (function() {
    var item = helpText[i];
    document.getElementById(item.id).onfocus = function() {
      showHelp(item.help);
    }
  })();
}

// solution 2: use `let` instead of `var`, binds the block-scoped variable
for (let i = 0; i < helpText.length; i++) {
  let item = helpText[i];
  document.getElementById(item.id).onfocus = function() {
    showHelp(item.help);
  }
}

// solution 3: use `forEach`, it automatically has a callback function
helpText.forEach(function(text) {
  document.getElementById(text.id).onfocus = function() {
    showHelp(text.help);
  }
});
```

```javascript
// another common mistake
for(var i = 0; i < 3; i++) {
  setTimeout(function() {
    console.log(i);
  }, 0)
}

for(var i = 0; i < 3; i++) {
  (function(j){
    setTimeout(function() {
      console.log(j);
    }, 0)
  })(i)
}

for(let i = 0; i < 3; i++) {
  setTimeout(function() {
    console.log(i);
  }, 0)
}
```

**Performance consideration**: It is unwise to unnecessarily create functions within other functions if closures are not needed for a particular task, as it will negatively affect script performance both in terms of processing speed and memory consumption.

> In JavaScript, memory leaks happen when objects are no longer needed, but are still referenced by functions or other objects. These references prevent the unneeded objects from being reclaimed by the garbage collector.
