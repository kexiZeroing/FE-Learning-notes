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

### JSON.stringify(value[, replacer[, space]])
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
