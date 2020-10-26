## Symbol
Symbol is a primitive data type. The `Symbol()` function returns a value of type symbol, has static properties that expose several members of built-in objects, has static methods that expose the global symbol registry. It resembles a built-in object class, but is incomplete as a constructor because it **does not support the syntax `new Symbol()`**. 

**Every symbol value returned from `Symbol()` is unique**. A symbol value may be used as an identifier for object properties, which is the data type's primary purpose. Symbol can have an **optional description**, but for debugging purposes only. Symbols are guaranteed to be unique. Even if we create many symbols with the same description, they are different values.

**Symbols don't auto-convert to strings (implicit conversion to a string)**. Strings and symbols are fundamentally different, and should not occasionally convert one into another. If you really want to show a symbol, we need to call `.toString()` on it.

- Unlike the other primitives, Symbols do not have a literal syntax
- Symbols are not enumerable in `for...in` iterations or `Object.keys()`
- Symbol-keyed properties will be completely ignored when using `JSON.stringify()`

```javascript
const symbol1 = Symbol(42);
const symbol2 = Symbol('foo');

console.log(typeof symbol1);  // symbol
console.log(symbol1.description);  // '42'
console.log(Symbol('foo') === Symbol('foo')); // false
typeof Symbol.iterator === 'symbol'  // true

var obj = {};
obj[Symbol('a')] = 'a';
obj['b'] = 'b';
obj.c = 'c';

for (var i in obj) {
  console.log(i);  // logs "b" and "c"
}

var obj = {};
var a = Symbol('a');
var b = Symbol.for('b');
obj[a] = 'localSymbol';
obj[b] = 'globalSymbol';

var objectSymbols = Object.getOwnPropertySymbols(obj);
console.log(objectSymbols);  // [Symbol(a), Symbol(b)]
```

### Well-known symbols
The `Symbol` class has constants for so-called well-known symbols. These symbols let you configure how JS treats an object, by using them as property keys. Examples of well-known symbols are: `Symbol.iterator` for array-like objects, or `Symbol.search` for string objects.

### Global symbol registry
There is a global symbol registry holding all available symbols. The global symbol registry is mostly built by JavaScript's compiler infrastructure, and it is not available to JavaScript's run-time environment, except through the methods `Symbol.for()` and `Symbol.keyFor()`.

The global symbol registry is a list with the following record structure and it is initialized empty. A record in the global symbol registry:
- `[[key]]` - a string key used to identify a symbol.
- `[[symbol]]` - a symbol that is stored globally.

The `Symbol.for(key)` method searches for existing symbols in a runtime-wide symbol registry with the given key and returns it if found. Otherwise a new symbol gets created in the global symbol registry with this key. `Symbol.keyFor(sym)` method retrieves a symbol key from the global symbol registry for the given symbol.

```javascript
Symbol.for('foo'); // create a new global symbol
Symbol.for('foo'); // retrieve the already created symbol

Symbol('bar') === Symbol('bar'); // false
Symbol.for('bar') === Symbol.for('bar'); // true

var globalSym = Symbol.for('foo');
Symbol.keyFor(globalSym); // "foo"

var localSym = Symbol();
Symbol.keyFor(localSym); // undefined

// Well-known symbols are not symbols registered in the global symbol registry
Symbol.keyFor(Symbol.iterator) // undefined
```

## Standard built-in objects
The global object itself can be accessed using `this` operator in the global scope.

- Value properties: Infinity, NaN, undefined, globalThis
- Function properties: isNaN(), parseFloat(), parseInt(), encodeURI(), encodeURIComponent(), decodeURI()
- Fundamental objects: Object, Function, Boolean, Symbol
- Numbers and dates: Number, BigInt, Math, Date
- Text processing: String, RegExp
- Error objects: Error, ReferenceError, SyntaxError, TypeError, RangeError
- Indexed collections: Array, Int8Array, Uint8Array, Int16Array, Uint16Array
- Keyed collections: Map, Set, WeakMap, WeakSet
- Reflection: Proxy, Reflect
- Internationalization: Intl, Intl.DateTimeFormat, Intl.NumberFormat, Intl.RelativeTimeFormat

### encodeURI() and encodeURIComponent()
`encodeURI` and `encodeURIComponent` are used to encode Uniform Resource Identifier (URI) by replacing each instance of certain characters by one, two, three, or four escape sequences representing the UTF-8 encoding of the character.

- `encodeURI()` escapes all characters except: `A-Z a-z 0-9 ; , / ? : @ & = + $ - _ . ! ~ * ' ( ) #`.
- `encodeURIComponent()` escapes all characters except: `A-Z a-z 0-9 - _ . ! ~ * ' ( )`

```javascript
encodeURI("http://www.example.org/a file with spaces.html")
// http://www.example.org/a%20file%20with%20spaces.html

// Don't call encodeURIComponent since it would destroy the URL
encodeURIComponent("http://www.example.org/a file with spaces.html")
// http%3A%2F%2Fwww.example.org%2Fa%20file%20with%20spaces.html

// Use encodeURIComponent when you want to encode the value of a URL parameter
var p1 = encodeURIComponent("http://example.org/?a=12&b=55")

// Then you may create the URL you need
var url = "http://example.net/?param1=" + p1 + "&param2=99";
// http://example.net/?param1=http%3A%2F%2Fexample.org%2F%Ffa%3D12%26b%3D55&param2=99
```
