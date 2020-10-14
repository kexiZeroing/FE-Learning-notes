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

### About number
The Number type is a double-precision 64-bit binary format IEEE 754 value. To check for the largest available value or smallest available value within `±Infinity`, you can use the constants `Number.MAX_VALUE` or `Number.MIN_VALUE`. 

- `Number.MAX_SAFE_INTEGER` is the largest integer which can be used safely in calculations. For example, `Number.MAX_SAFE_INTEGER + 1 === Number.MAX_SAFE_INTEGER + 2` is true — any integer larger than `Number.MAX_SAFE_INTEGER` cannot always be represented in memory accurately and will be a double-precision floating point approximation of the value.
- `Number.MAX_VALUE` is the largest number possible to represent using a double precision floating point representation. 
- With the introduction of `BigInt`, you can operate with numbers beyond the `Number.MAX_SAFE_INTEGER`. A `BigInt` is created by appending `n` to the end of an integer or by calling the constructor.

## JSON.stringify(value[, replacer[, space]])
`JSON.stringify` turns a JavaScript object into JSON text and stores that JSON text in a string. `JSON.parse` turns a string of JSON text into a JavaScript object.
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

## Closure
**Lexical scoping**, which describes how a parser resolves variable names when functions are nested. The word "lexical" refers to the fact that lexical scoping uses **the location where a variable is declared within the source code to determine where that variable is available**. Nested functions have access to variables declared in their outer scope.

**A closure is the combination of a function and the lexical environment within which that function was declared.** This environment consists of any local variables that were in-scope at the time the closure was created. The instance of function maintains a reference to its lexical environment, within which the variable name exists. Closures are useful because they let you associate data (the lexical environment) with a function that operates on that data. This has obvious parallels to object-oriented programming, where objects allow you to associate data (the object's properties) with one or more methods.

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
