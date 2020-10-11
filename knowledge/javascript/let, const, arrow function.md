## let and const
`let` allows you to declare variables that are limited to a scope of a block statement, unlike the `var` keyword, which defines a variable globally, or locally to an entire function regardless of block scope. The `let` **does not create properties of the window object** when declared globally.

```javascript
const arr = [1, 2, 3, 4, 5];
for (let i = 0; i < arr.length; i++) {};
console.log(i); // ReferenceError: i is not defined

// var
function varTest() {
  var x = 1;
  if (true) {
    var x = 2;
  }
  console.log(x);  // 2
}

// let
function letTest() {
  let x = 1;
  if (true) {
    let x = 2;
  }
  console.log(x);  // 1
}

// globally scoped
let me = 'go';  
var i = 'able';

console.log(window.me); // undefined
console.log(window.i); // 'able'
```

- Temporal Dead Zone  
The period between **entering scope and being declared** where they cannot be accessed. Because of the TDZ, variables declared using `let` can't be accessed before they are declared. Attempting to do so throws an error.
```javascript
console.log(alet) // ReferenceError: alet is not defined
let alet
console.log(alet) // undefined
alet = 10
console.log(alet) // 10
```

- No re-declaring  
Redeclaring the same variable within the same function or block scope raises a SyntaxError. The combination of `var` and `let` declaration is a SyntaxError due to `var` being hoisted to the top of the block. This results in an implicit re-declaration of the variable.

- Loop with closures  
```javascript
// 3, 3, 3
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}

// 0, 1, 2
for (let j = 0; j < 3; j++) {
  setTimeout(() => console.log(j), 0);
}
```

`const` is quite similar to let, it's block-scoped and has TDZ. Variable declared using const can't be re-assigned. You must specify a value when declaring a variable using const.

## Arrow functions
1. If the function body contains just a single statement, you can omit the brackets and write all in a single line. Values are returned without having to use the `return` keyword when there is a one-line statement in the function body **(when returning an object, remember to wrap the curly brackets in parentheses to avoid it being considered the wrapping function body brackets)**. If you have only one parameter, you could omit the parentheses completely.
2. An arrow function does not have its own `this`. The `this` value of the enclosing lexical scope is used; arrow functions follow the normal variable lookup rules. Due to this, arrow functions are not suited as object methods.
3. Since arrow functions do not bind `this`, the methods `call()` or `apply()` can only pass in parameters. `thisArg` is ignored.
4. Arrow functions don't have `arguments`. This array-like object was a workaround to begin with, which now has solved with a rest parameter. 
5. Arrow functions cannot be used as constructors and will throw an error when used with keyword `new`.

```javascript
const shape = {
  radius: 10,
  diameter() {
    return this.radius * 2;
  },
  perimeter: () => 2 * Math.PI * this.radius
};

shape.diameter();  // 20
shape.perimeter();  // NaN

const link = document.querySelector('#link')
link.addEventListener('click', function() {
  // this === link
})

link.addEventListener('click', () => {
  // this === window
})
```

### Default parameters
```javascript
const doSomething = (param1 = 'test') => {...}

// with destructuring
const colorize = ({ color = 'yellow' }) => {...} 
const colorize = ({ color = 'yellow' } = {}) => {...}
```
