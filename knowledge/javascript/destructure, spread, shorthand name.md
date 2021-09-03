## Destructuring assignments
The destructuring assignment syntax is a JavaScript expression that makes it possible to unpack values from arrays, or properties from objects, into distinct variables.

### Array destructuring
```javascript
const foo = ['one', 'two', 'three'];
const [one, two, three] = foo;

// Assignment separate from declaration
let a, b;
[a, b] = [1, 2];
console.log(a); // 1
console.log(b); // 2

// default value
const colors = [];
const [firstColor = 'white'] = colors;
console.log(firstColor); // 'white'

// Ignoring some values
const [a, , b] = [1, 2, 3];
console.log(a); // 1
console.log(b); // 3

// rest pattern
const [a, ...b] = [1, 2, 3];
console.log(a); // 1
console.log(b); // [2, 3]

// Swapping variables
let a = 1, b = 3;
[a, b] = [b, a];
console.log(a); // 3
console.log(b); // 1
```

### Object destructuring
```javascript
const o = {p: 42, q: true};
const {p, q} = o;
console.log(p); // 42
console.log(q); // true

// Assigning to new variable names
const o = {p: 42, q: true};
const {p: foo, q: bar} = o;
console.log(foo); // 42 
console.log(bar); // true
console.log(p); // ReferenceError: p is not defined
console.log(q); // ReferenceError: q is not defined

// get both `a` and `b` as variables in one line of destructuring
const o = {a: {b: 'hi'}};
const {a, a: {b}} = o;

// Assignment separate from declaration
// The parentheses around the assignment statement are required when using 
// object literal destructuring assignment without a declaration.
// {a, b} = {a: 1, b: 2} is not valid stand-alone syntax, as the {a, b} 
// is considered a block and not an object literal.
let a, b, rest;
({a, b, ...rest} = {a: 10, b: 20, c: 30, d: 40});
console.log(a); // 10
console.log(b); // 20
console.log(rest); // {c: 30, d: 40}

// destructuring dynamic properties
function greet(obj, nameProp) {
 const { [nameProp]: name = 'Unknown' } = obj;
 return `Hello, ${name}!`;
}
greet({ name: 'Batman' }, 'name'); // => 'Hello, Batman!'
greet({ }, 'name'); // => 'Hello, Unknown!'
```

## Spread operator
1. Expand an array, an object or a string using the spread operator `...` .
2. The **rest parameter** syntax allows us to represent an indefinite number of arguments as an array. Only the last parameter can be a "rest parameter". The `arguments` object is not a real array, while **rest parameters are Array instances**, meaning Array methods can be used on rest parameters.

```javascript
// spread syntax
var arr1 = [0, 1, 2];
var arr2 = [3, 4, 5];
arr1 = [...arr1, ...arr2]; // arr1 is now [0, 1, 2, 3, 4, 5]

// create a copy of an array or an object
const c = [...arr];
const newObj = { ...oldObj };

// replace apply() when you want to use an array as arguments to a function
function myFunction(x, y, z) { }
var args = [0, 1, 2];
myFunction(...args);

// rest parameter
function myFun(a, b, ...manyMoreArgs) {
  console.log(a);  // one
  console.log(b);  // two
  console.log(manyMoreArgs);  // [three, four, five, six]
}
myFun("one", "two", "three", "four", "five", "six");
myFun("one", "two");  // manyMoreArgs will be []
```

## Shorthand and Computed property names (Enhanced Object Literals)
```javascript
// Shorthand property names
const a = 'foo', b = 42, c = {};
const o = {a, b, c};

// Shorthand method names
const o = {
  property(parameters) {}
};

// Computed property names
var prop = 'foo';
var o = {
  [prop]: 'hey',
  ['b' + 'ar']: 'there'
};

// The shorthand syntax also supports computed property names
var bar = {
  foo1() { return 1; },
  ['foo' + 2]() { return 2; }
};

// prototype and super()
const o = { y: 'y', test: () => 'zoo' }
const x = {
  __proto__: o, 
  test() { return super.test() + 'x' }
}  
x.test(); // zoox
```

## getter and setter in Object
The `get syntax` binds an object property to a function that will be called when that property is looked up. The `set syntax` binds an object property to a function to be called when there is an attempt to set that property.

```javascript
// getter
const obj = {
  log: ['example', 'test'],
  get latest() {
    return this.log[this.log.length - 1];
  }
}
console.log(obj.latest); // "test"

// setter
const language = {
  set current(name) {
    this.log.push(name);
  },
  log: []
}
language.current = 'EN';
console.log(language.log); // ['EN']
```

## Nullish coalescing and Optional chaining
The **nullish coalescing operator (??)** is a logical operator that returns its right-hand side operand when its left-hand side operand is `null` or `undefined`, and otherwise returns its left-hand side operand. Earlier, when one wanted to assign a default value to a variable, a common pattern was to use the **logical OR operator (||)**. However, due to `||` being a boolean logical operator, any falsy value (`0`, `''`, `NaN`, `null`, `undefined`) is not returned. This behavior may cause unexpected consequences if you consider `0` or `''` as valid values.

```javascript
const nullValue = null;
const emptyText = "";

const valA = nullValue ?? "default for A";
const valB = emptyText ?? "default for B";
const valC = emptyText || "default for C";

console.log(valA); // "default for A"
console.log(valB); // ""
console.log(valC); // "default for C"
```

The **optional chaining operator (?.)** functions similarly to the `.` chaining operator, except that instead of causing an error if a reference is nullish (`null` or `undefined`), the expression short-circuits with a return value of undefined. When used with function calls, it returns undefined if the given function does not exist.

```javascript
let customerCity = customer.details?.address?.city;
let duration = vacations.trip?.getTime?.();
let nestedProp = obj?.['prop' + 'Name'];

let foo = { someFooProp: "hi" };
console.log(foo.someFooProp?.toUpperCase() ?? "not available"); // "HI"
console.log(foo.someBarProp?.toUpperCase() ?? "not available"); // "not available"
```
