## Object
### Check if an object is empty
- Object.keys(obj).length === 0 && obj.constructor === Object
- JSON.stringify(obj) === JSON.stringify({})
- Object.getOwnPropertyNames(obj).length === 0

```javascript
function badEmptyCheck(value) {
  return Object.keys(value).length === 0;
}
badEmptyCheck(new Object());  // true
badEmptyCheck(new String());  // true 
badEmptyCheck(new Number());  // true
badEmptyCheck(new Array());   // true

function goodEmptyCheck(value) {
  return Object.keys(value).length === 0 && value.constructor === Object;
}
badEmptyCheck(new Object());  // true
badEmptyCheck(new String());  // false 
badEmptyCheck(new Number());  // false
badEmptyCheck(new Array());   // false
```

### Object.defineProperty()
Defines a new property or modifies an existing property on an object, and returns the object. **By default, values added using `Object.defineProperty()` are immutable and not enumerable**. Property descriptors present in objects come in two main flavors: **data descriptors or accessor descriptors**. A data descriptor is a property that has a value, which may or may not be writable. An accessor descriptor is a property described by a getter-setter pair of functions. **A descriptor must be one of these two flavors; it cannot be both**.

- **configurable**: true if the type of this property descriptor may be changed and if the property may be deleted from the object. (defaults to false)
- **enumerable**: true if and only if this property shows up during enumeration of the properties on the object. (defaults to false)
- **value**: the value associated with the property. (defaults to undefined)
- **writable**: true if the value associated with the property may be changed with an assignment operator. (defaults to false)
- **get**: a function which serves as a getter for the property, or undefined if there is no getter. When the property is accessed, this function is called without arguments and the return value will be used as the value of the property.
- **set**: a function which serves as a setter for the property, or undefined if there is no setter. When the property is assigned to, this function is called with one argument which is the value being assigned to the property.

```javascript
// data descriptor
Object.defineProperty(o, 'key', {
  enumerable: false,
  configurable: false,
  writable: true,
  value: 'static'
});

// accessor descriptor
var bValue = 38;
Object.defineProperty(o, 'b', {
  enumerable: true,
  configurable: true,
  get() { return bValue; },
  set(newValue) { bValue = newValue; }
});
o.b; // 38, the value of o.b is now always identical to bValue

var o = {};
o.a = 1;
// is equivalent to:
Object.defineProperty(o, 'a', {
  value: 1,
  writable: true,
  configurable: true,
  enumerable: true
});

// On the other hand,
// default: not enumerable, not configurable, not writable
Object.defineProperty(o, 'a', { value: 1 });
// is equivalent to:
Object.defineProperty(o, 'a', {
  value: 1,
  writable: false,
  configurable: false,
  enumerable: false
});

var o = {}; 
Object.defineProperty(o, 'a', {
  value: 37,
  writable: false
});
o.a = 25; // it would throw error in strict mode even if the value had been the same
console.log(o.a); // 37

var o = {};
Object.defineProperty(o, 'a', {
  value: 1,
  enumerable: true
});
Object.defineProperty(o, 'b', {
  value: 2,
  enumerable: false
});
Object.defineProperty(o, 'c', {
  value: 3
});
o.d = 4; 

// non-enumerable means that property will not be shown in Object.keys() or for-loop
for (var i in o) { console.log(i) } // logs 'a' and 'd'
Object.keys(o); // ['a', 'd']
o.propertyIsEnumerable('a'); // true
o.propertyIsEnumerable('b'); // false
var p = { ...o };
p.a // 1
p.b // undefined
```

### Object.keys(), Object.values(), Object.entries()
- Object.keys() returns an array whose elements are strings corresponding to the **enumerable properties found directly upon object**. 
- Object.values() returns an array of a given object's **own enumerable property values**, in the same order as that provided by a `for...in` loop (the difference being that **for-in loop enumerates properties in the prototype chain as well**).
- Object.entries() returns an array whose elements are arrays corresponding to the enumerable property `[key, value]` pairs found directly upon object.

A `for...in` loop only iterates over enumerable, non-Symbol properties. Objects created from built–in constructors like `Object` and `String` have inherited non–enumerable properties from `Object.prototype` and `String.prototype`, such as String's `indexOf()` method or Object's `toString()` method (*not enumerable*). The loop will iterate over all enumerable properties of the object itself and those enumerable properties the object inherits from its prototype chain.

```javascript
var arr = ['a', 'b', 'c'];
console.log(Object.keys(arr)); // ['0', '1', '2']

var obj = { foo: 'bar', baz: 42 };
console.log(Object.values(obj)); // ['bar', 42]

const obj = { foo: 'bar', baz: 42 };
console.log(Object.entries(obj)); // [ ['foo', 'bar'], ['baz', 42] ]

// fromEntries() method transforms a list of key-value pairs into an object
// iterable argument is expected
const arr = [ ['0', 'a'], ['1', 'b'], ['2', 'c'] ];
Object.fromEntries(arr); // { 0: "a", 1: "b", 2: "c" }

const map = new Map([ ['foo', 'bar'], ['baz', 42] ]);
Object.fromEntries(map); // { foo: "bar", baz: 42 }
```

### hasOwnProperty, getOwnPropertyNames, getPrototypeOf, isPrototypeOf
```javascript
// hasOwnProperty() returns a boolean indicating whether the object has the specified property as its own property as opposed to inheriting it
const o = new Object();
o.prop = 'exists';
o.hasOwnProperty('prop');     // true
o.hasOwnProperty('toString'); // false

// getOwnPropertyNames() returns an array of all properties (including non-enumerable properties) found directly in a given object
const arr = ['a', 'b', 'c'];
console.log(Object.getOwnPropertyNames(arr).sort()); // ["0", "1", "2", "length"]

// getPrototypeOf() returns the prototype (the value of the internal [[Prototype]] property) of the specified object
var proto = {};
var obj = Object.create(proto);
Object.getPrototypeOf(obj) === proto; // true

// isPrototypeOf() allows you to check if an object exists within another object's prototype chain.
function Foo() {}
function Bar() {}
function Baz() {}

Bar.prototype = Object.create(Foo.prototype);
Baz.prototype = Object.create(Bar.prototype);

var baz = new Baz();
Baz.prototype.isPrototypeOf(baz);    // true
Bar.prototype.isPrototypeOf(baz);    // true
Foo.prototype.isPrototypeOf(baz);    // true
Object.prototype.isPrototypeOf(baz); // true
```

### toString() and valueOf()
Every object has a `toString()` method that is automatically called when the object is to be represented as a text value or when an object is referred to in a manner in which a string is expected. For Numbers, `toString()` takes an optional parameter radix, the value of radix must be minimum 2 and maximum 36.

You can create a function to be called in place of the default `toString()` method. The `toString()` method you create can be any value you want, but it will be most useful if it carries information about the object.

```javascript
function Dog(name, breed, color, sex) {
  this.name = name;
  this.breed = breed;
  this.color = color;
  this.sex = sex;
}

theDog = new Dog('Gabby', 'Lab', 'chocolate', 'female');
theDog.toString(); // [object Object]

Dog.prototype.toString = function() {
  return `Dog ${this.name} is a ${this.sex} ${this.color} ${this.breed}`;
}
theDog.toString(); // "Dog Gabby is a female chocolate Lab"
```

JavaScript calls `valueOf()` to convert an object to a primitive value. You rarely need to invoke the valueOf method yourself; JavaScript automatically invokes it when encountering an object where a primitive value is expected. **A (unary) plus sign can sometimes be used as a shorthand for valueOf**.

```javascript
+"5" // 5
+""  // 0
+"foo" // NaN 
+{} // NaN
+[] // 0
+[1] // 1
+[1,2] // NaN
+undefined // NaN
+null // 0
+true // 1
+false // 0
```

### Object.assign()
Copy the values of all **enumerable and own properties** from one or more source objects to a target object and return the target object. If the source value is a reference to an object, it only copies that reference value **(shallow copy)**. Properties in the target object will be overwritten by properties in the sources if they have the same key.

```javascript
var obj = { a: 1 };
var copy = Object.assign({}, obj);
console.log(copy); // { a: 1 }

// Merging objects
var o1 = { a: 1 };
var o2 = { b: 2 };
var o3 = { c: 3 };
var obj = Object.assign(o1, o2, o3);
console.log(obj); // { a: 1, b: 2, c: 3 }
console.log(o1);  // { a: 1, b: 2, c: 3 }
```

### Object.create()
It creates a new object, using an existing object as the prototype of the newly created object. Be aware of that using `Object.keys()` on an object created via `Object.create()` will result in an empty array being returned.

```javascript
const o1 = Object.create( {} );   // create a normal object
const o2 = Object.create( null ); // create a totally empty object (without prototype)

"first is: " + o1  // "first is: [object Object]"
"second is: " + o2 // throws error: Cannot convert object to primitive value

o1.toString() // [object Object]
o2.toString() // throws error: ocn.toString is not a function

o1.constructor // "Object() { [native code] }"
o2.constructor // "undefined"

// Class inheritance with Object.create()
function Shape() {
  this.x = 0;
  this.y = 0;
}
function Rectangle() {
  // call super constructor
  Shape.call(this); 
}

Rectangle.prototype = Object.create(Shape.prototype);
// If don't set constructor to Rectangle, it will take Shape as the constructor
Rectangle.prototype.constructor = Rectangle;

var rect = new Rectangle();
rect instanceof Rectangle  // true
rect instanceof Shape      // true
```

### Object.is()
```javascript
Object.is('foo', 'foo');  // true

var foo = { a: 1 };
var bar = { a: 1 };
Object.is(foo, bar);  // false

+0 === -0             // true
Object.is(+0, -0);    // false

NaN === NaN           // false
Object.is(NaN, NaN);  // true
Object.is(NaN, 0/0);  // true
```

### Object.freeze()
It freezes an object. A frozen object can no longer be changed; freezing an object prevents new properties from being added to it, existing properties from being removed, prevents changing the enumerability, configurability, or writability of existing properties, and prevents the values of existing properties from being changed. In addition, freezing an object also prevents its prototype from being changed. `freeze()` returns the same object that was passed into the function. It does not create a frozen copy.

The result of `freeze()` **only applies to the immediate properties of object**. If the value of those properties are objects themselves, those objects are not frozen.

```javascript
var obj = {
  prop() {},
  foo: 'bar'
};

// Freeze
var o = Object.freeze(obj);

// Now any changes will fail
obj.foo = 'quux';  // silently does nothing
obj.quaxxor = 'the friendly duck'; // silently doesn't add the property

// In strict mode such attempts will throw TypeErrors
function fail(){
  'use strict';
  obj.foo = 'sparky'; // throws a TypeError
  delete obj.foo; // throws a TypeError
}

// Attempt to change through Object.defineProperty
// both statements below throw a TypeError.
Object.defineProperty(obj, 'ohai', { value: 17 });
Object.defineProperty(obj, 'foo', { value: 'eit' });

// It's also impossible to change the prototype
// both statements below will throw a TypeError.
Object.setPrototypeOf(obj, { x: 20 })
obj.__proto__ = { x: 20 }

// shallow freeze
var employee = {
  name: "Mayank",
  address: {
    street: "Rohini",
    city: "Delhi"
  }
};

Object.freeze(employee);
employee.name = "Dummy"; // fails 
employee.address.city = "Noida"; // attributes of child object can be modified
```

### Object.seal()
It seals an object, preventing new properties from being added and marking all existing properties as non-configurable **(Non-configurable properties cannot be removed)**. Values of present properties can still be changed as long as they are writable.

```javascript
var obj = {
  prop: function() {},
  foo: 'bar'
};

var o = Object.seal(obj);

// Now any changes, other than to property values, will fail
obj.foo = 'quux';  // still works
obj.quaxxor = 'the friendly duck';  // silently doesn't add the property
delete obj.foo;  // silently doesn't delete the property

// in strict mode such attempts will throw TypeErrors
function fail() {
  'use strict';
  delete obj.foo;  // throws a TypeError
  obj.sparky = 'arf'; // throws a TypeError
}
```

### Object.preventExtensions()
It **prevents new properties from being added to an object** (i.e. prevents future extensions to the object). Note that the properties of a non-extensible object, in general, may still be deleted. Attempting to add new properties to a non-extensible object will fail, either silently or by throwing a TypeError.

- There is no way to make an object extensible again once it has been made non-extensible.
- A non-extensible object's prototype is immutable; any `[[prototype]]` re-assignment will throw a TypeError. 

```javascript
var empty = {};
Object.preventExtensions(empty);
Object.isExtensible(empty); // false

empty.newProperty = 'FAIL';  // empty is still {}
Object.defineProperty(empty, 'new', {
  value: 1
}); // throws a TypeError
```

### Object.isFrozen() / isSealed() / isExtensible()
- An object is frozen if and only if it is not extensible, all its properties are non-configurable, and all its data properties are non-writable.
- An object is sealed if it is not extensible and if all its properties are non-configurable (and therefore not removable).
- If you make an empty object non-extensible, it is vacuously frozen and sealed.
