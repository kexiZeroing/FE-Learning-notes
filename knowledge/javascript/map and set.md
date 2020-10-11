## Map
The Map object holds key-value pairs and **remembers the original insertion order of the keys**. Any value (both objects and primitive values) may be used as either a key or a value.

Object is similar to Map, and Objects have been used as Maps historically; however, there are important differences that make using a Map preferable in certain cases:
- The keys of an Object are String and Symbol, whereas they can be any value for a Map, including functions, objects, and any primitive.
- The keys in Map are ordered while keys added to object are not. Thus, when iterating over it, a Map object returns keys in order of insertion.
- You can get the size of a Map easily with the size property, while the number of properties in an Object must be determined manually.
- An Object has a prototype, so there are default keys that could collide with your keys. This can be bypassed by using Object.create(null), but this is seldom done.

```javascript
var myMap = new Map();
myMap.set(0, 'zero');
myMap.set(1, 'one');

myMap.size;

var myMap2 = new Map([
              ['key1', 'value1'],
              ['key2', 'value2']
            ]);

myMap.get('key1');  
myMap.has('key1');
myMap.delete('key1');

// Weird situations you'll almost never find in real life
const m = new Map();
m.set(NaN, 'test');
m.get(NaN); // test

const m = new Map();
m.set(+0, 'test');
m.get(-0); // test

// Iterating with for..of
for (let key of myMap.keys()) console.log(key);
for (let value of myMap.values()) console.log(value);
for (let [key, value] of myMap.entries()) console.log(key + ' = ' + value);

myMap.forEach(function(value, key, map) {
  console.log(`map.get('${key}') = ${value}`);
});

myMap.clear();

// Relation with Array 
// Use the Array.from to transform a map into a 2D key-value Array
Array.from(myMap);
// or
[...myMap];

// Or use the keys or values iterators and convert them to an array
Array.from(myMap.keys());

// Maps can be merged
var first = new Map([
  [1, 'one'],
  [2, 'two'],
  [3, 'three'],
]);

var second = new Map([
  [1, 'uno'],
  [2, 'dos']
]);

// Merge two maps. The last repeated key wins.
var merged = new Map([...first, ...second]);
```

## Set
The Set object lets you store unique values of any type, whether primitive values or object references.

```javascript
var mySet = new Set();
var mySet = new Set(['value1', 'value2', 'value3']);

// You can't add multiple elements to a set in one add()
mySet.add(1);
mySet.add(2); 

mySet.has(1); // true
mySet.has(3); // false
mySet.delete(1);

mySet.size;

// There are no keys in Set, so key and value are the same here
for (let item of mySet.keys()) console.log(item);
for (let item of mySet.values()) console.log(item);
for (let [key, value] of mySet.entries()) console.log(key);

mySet.forEach(function(value, key, set) {
  console.log(value);
});

mySet.clear();

// converting between Set and Array
mySet2 = new Set([1, 2, 3, 4]);
Array.from(mySet2)
// or
[...mySet2];

// intersection
var intersection = new Set([...set1].filter(x => set2.has(x)));
```

## WeakMap, WeakSet
Every key of a WeakMap is an object. Primitive data types as keys are not allowed. WeakMap allows garbage collector to do its task but not Map. There is no such thing as a list of WeakMap keys, they are just references to another objects. After removing the key from the memory we can still access it inside the map. At the same time removing the key of WeakMap removes it from weakmap as well by reference. 

**You cannot iterate over the keys or values of a WeakMap/WeakSet; You cannot clear all items from a WeakMap/WeakSet (no clear method); You cannot check its size (no size property).**

```javascript
// Weakmap
var k1 = {a: 1};
var k2 = {b: 2};

var map = new Map();
var wm = new WeakMap();

map.set(k1, 'k1');
wm.set(k2, 'k2');

k1 = null;
map.forEach(function (val, key) {
    console.log(key, val); // {a: 1} "k1"
});

k2 = null;
wm.get(k2); // undefined
```
