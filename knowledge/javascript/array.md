## Array
### Check if the variable is an array
- Array.isArray(value)
- Object.prototype.toString.call(value) === '[object Array]'
- value instanceof Array
  > `value instanceof Array` evaluates to false when value is an array created in a different iframe than the Array constructor function (v is instance of thatFrame.contentWindow.Array)

```javascript
({}).toString.call([]);   // '[object Array]'
({}).toString.call({});   // '[object Object]'
({}).toString.call('');   // '[object String]'
({}).toString.call(null); // '[object Null]'
```

### Remove duplicates
- [...new Set(array)]
- array.filter((item, index, arr) => arr.indexOf(item) === index)
- array.reduce((unique, item) => unique.includes(item) ? unique : [...unique, item], [])

```javascript
// liner time, but has at least two drawbacks:
// 1. doesn't distinguish numbers and "numeric strings" like [1, "1"]
// 2. all objects will be considered equal
function uniq(a) {
  var seen = {};
  return a.filter(function(item) {
    return seen.hasOwnProperty(item) ? false : (seen[item] = true);
  });
}
```

### Clone Array
- loop
- arr.slice()
- Array.from()
- [].concat(arr)
- [...arr]
- JSON.parse(JSON.stringify(arr))  // deep clone

Note: because this depends upon JSON, it also inherits its limitations. `undefined`, `Function`, and `Symbol` are not valid JSON values. If any such values are encountered during the stringify conversion they are either omitted (when found in an object) or changed to `null` (when found in an array). `JSON.stringify()` returns `undefined` when passing in "pure" values like `JSON.stringify(function(){})` or `JSON.stringify(undefined)`.
```javascript
JSON.stringify([undefined, function(){}, () => {}])  // "[null, null, null]"
```

### Array-like object
An Object which has a length property of a non-negative Integer, and usually some indexed properties. You can actually just use Array's `slice` function to convert it into a standard JavaScript array. The `slice` function is intentionally generic; it does not require that its `this` value be an Array object, so it works on anything that has a length property, which `arguments` conveniently does.

```javascript
Array.prototype.slice.call(obj);  // same as [].slice.call(obj)
```

### Array.from()
It creates a new, shallow-copied Array instance **from an array-like or iterable object**. It has an optional parameter `mapFn`, which allows you to execute a map function on each element of the array that is being created.

```javascript
Array.from('foo');  // [ "f", "o", "o" ]

const set = new Set(['foo', 'bar', 'baz', 'foo']);
Array.from(set);  // [ "foo", "bar", "baz" ]

Array.from([1, 2, 3], x => x + x);  // [2, 4, 6]

// Since the array is initialized with `undefined` on each position,
// the value of `v` below will be `undefined`
Array.from({length: 5}, (v, i) => i);  // [0, 1, 2, 3, 4]
```

### Array.of()
It creates a new Array instance from a variable number of arguments. The difference between `Array.of()` and the `Array` constructor is in the handling of integer arguments: `Array.of(7)` creates an array with a single element, `7`, whereas `Array(7)` creates an empty array with a length of 7 (Note: this implies an array of 7 empty slots, not slots with actual `undefined` values).
```javascript
Array.of(7);       // [7] 
Array.of(1, 2, 3); // [1, 2, 3]

Array(7);          // array of 7 empty slots
Array(1, 2, 3);    // [1, 2, 3]
```

### Array.prototype.fill()
The fill method takes up to three arguments `value`, `start` and `end`. The start and end arguments are optional with default values of 0 and the length of the this object. `fill()` is intentionally generic, it does not require that its `this` value be an Array object.

```javascript
Array(3).fill(4)  // [4, 4, 4]

// Objects by reference
var arr = Array(3).fill({}) // [{}, {}, {}];
arr[0].hi = "hi"; // [{ hi: "hi" }, { hi: "hi" }, { hi: "hi" }]

[].fill.call({ length: 3 }, 4);  // {0: 4, 1: 4, 2: 4, length: 3}
```

### Array.prototype.find()
```javascript
arr.find(callback(element[, index[, array]])[, thisArg])

const array1 = [5, 12, 8, 130, 44];
const found = array1.find(element => element > 10);  // 12
const foundIndex = array1.findIndex(element => element > 10); // 1

const inventory = [
  {name: 'apples', quantity: 2},
  {name: 'bananas', quantity: 0},
  {name: 'cherries', quantity: 5}
];
const result = inventory.find( ({ name }) => name === 'cherries' );
```

### Array.prototype.reduce()
```javascript
arr.forEach(callback(currentValue [, index [, array]])[, thisArg]);

// thisArg (Optional), value to use as `this` when executing callback
[1,2,3].forEach(function(){console.log(this)})  // window
[1,2,3].forEach(function(){console.log(this)}, {a: 1})  // {a: 1}
[1,2,3].forEach(() => console.log(this), {a: 1})  // window

arr.reduce(callback(accumulator, currentValue[, index[, array]])[, initialValue])
```
- If initialValue is provided, then accumulator will be equal to initialValue, and currentValue will be equal to the first value in the array. If no initialValue is provided, then accumulator will be equal to the first value in the array, and currentValue will be equal to the second. 
- If the array has only one element and no initialValue was provided, or if initialValue is provided but the array is empty, the solo value would be returned without calling callback.

### Array.prototype.splice()
It changes the contents of an array by removing or replacing existing elements or adding new elements **in place**.
```javascript
var arrDeletedItems = array.splice(start[, deleteCount[, item1[, item2[, ...]]]])

// insert
var myFish = ['angel', 'clown', 'mandarin', 'sturgeon'];
var removed = myFish.splice(2, 0, 'drum');

// remove
var myFish = ['angel', 'clown', 'drum', 'mandarin', 'sturgeon'];
var removed = myFish.splice(3, 1);

// replace
var myFish = ['angel', 'clown', 'trumpet', 'sturgeon'];
var removed = myFish.splice(0, 2, 'parrot', 'anemone', 'blue');
```

### Flatten array
```javascript
const arr1 = [1, 2, [3, 4]];
arr1.flat();  // [1, 2, 3, 4]

const arr2 = [1, 2, [3, 4, [5, 6]]];
arr2.flat();  // [1, 2, 3, 4, [5, 6]]

const arr3 = [1, 2, [3, 4, [5, 6, [7, 8, [9, 10]]]]];
arr4.flat(Infinity);  // [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

// deep level flatten use recursion
// [].concat([1,[2,3]]) returns [1,[2,3]]  
// [].concat(1,[2,3]) returns [1,2,3] 
function flattenDeep(arr) {
  return arr.reduce((acc, val) => Array.isArray(val) ? acc.concat(flattenDeep(val)) : acc.concat(val), []);
}

// flatMap is identical to a map() followed by a flat() of depth 1
let arr1 = ["it's Sunny in", "", "California"];

// [["it's","Sunny","in"],[""],["California"]]
arr1.map(x => x.split(" "));

// ["it's","Sunny","in", "", "California"]
arr1.flatMap(x => x.split(" "));
```