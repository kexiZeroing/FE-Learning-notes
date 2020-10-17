## Inheritance and the prototype chain
JavaScript is a bit confusing for developers experienced in class-based languages (like Java or C++), as it is dynamic and does not provide a class implementation (the class keyword is introduced in ES2015, but is syntactical sugar, **JavaScript remains prototype-based**).

When it comes to inheritance, JavaScript only has one construct: objects. Each object has a private property which holds a link to another object called its **prototype**. That prototype object has a prototype of its own, and so on until an object is reached with `null` as its prototype. By definition, `null` has no prototype, and acts as the final link in this **prototype chain**.

When trying to access a property of an object, the property will not only be sought on the object but on the prototype of the object, the prototype of the prototype, and so on until either a property with a matching name is found or the end of the prototype chain is reached.

Following the ECMAScript standard, the notation `someObject.[[Prototype]]` is used to designate the prototype of `someObject`. **Since ECMAScript 2015, the `[[Prototype]]` is accessed using the accessors `Object.getPrototypeOf()` and `Object.setPrototypeOf()`. This is equivalent to the JavaScript property `__proto__` which is non-standard but implemented by many browsers**. 

It should not be confused with the `func.prototype` property of functions, which specifies the `[[Prototype]]` to be assigned to all instances of objects created by the given function when used as a constructor. **The reference to the prototype object is copied to the internal `[[Prototype]]` property of the new instance**. For example, when you do `const a1 = new A()`, JavaScript (after creating the object in memory and before running function A() with `this` to it) sets `a1.[[Prototype]] = A.prototype`.

- All functions have a special property named `prototype`, but there is one exception that **arrow function doesn't have a default prototype property**. 
- The native prototypes should never be extended unless it is for the sake of compatibility with newer JavaScript features.
- Changing the `[[Prototype]]` of an object is a very slow operation in every browser and JavaScript engine, so you should avoid setting the `[[Prototype]]` of an object (`Object.setPrototypeOf()`). Instead, create a new object with the desired `[[Prototype]]` using `Object.create()`.
- To check whether an object has a property defined on itself and not somewhere on its prototype chain, it is necessary to use the **`Object.prototype.hasOwnProperty()`** method.

```javascript
// when you call
var o = new Foo();

// JavaScript actually just does
var o = new Object();
o.[[Prototype]] = Foo.prototype;
Foo.call(o);

// create an object
let f = function () {
   this.a = 1;
   this.b = 2;
}
let o = new f();

f.prototype.b = 3;
f.prototype.c = 4;

// do not set f.prototype = {b:3,c:4}; this will break the prototype chain
// o.[[Prototype]] has properties b and c.
// o.[[Prototype]].[[Prototype]] is Object.prototype.
// Finally, o.[[Prototype]].[[Prototype]].[[Prototype]] is null.
// This is the end of the prototype chain.

// The prototype also has a 'b' property, but it's not visited. 
// This is called Property Shadowing.

var o = {
  a: 2,
  m: function() {
    return this.a + 1;
  }
};

// p is an object whose prototype is o
var p = Object.create(o);
p.a = 4;
console.log(p.m()); // 5
```

```javascript
// function doSomething(){} and console.log(doSomething.prototype)
{
    constructor: ƒ doSomething(),
    __proto__: {
        constructor: ƒ Object(),
        hasOwnProperty: ƒ hasOwnProperty(),
        isPrototypeOf: ƒ isPrototypeOf(),
        propertyIsEnumerable: ƒ propertyIsEnumerable(),
        toLocaleString: ƒ toLocaleString(),
        toString: ƒ toString(),
        valueOf: ƒ valueOf()
    }
}
```

### Different ways to create objects and the resulting prototype chain
```javascript
var b = ['yo', 'whadup', '?'];
// b ---> Array.prototype ---> Object.prototype ---> null

function f() { }
// f ---> Function.prototype ---> Object.prototype ---> null

var g = new Graph();
// g.[[Prototype]] is the value of Graph.prototype when new Graph() is executed

var b = Object.create(a);
// b ---> a ---> Object.prototype ---> null

var c = Object.create(null);
// c ---> null

// should-be-deprecated and ill-performant
Object.setPrototypeOf(d, foo.prototype);
```
