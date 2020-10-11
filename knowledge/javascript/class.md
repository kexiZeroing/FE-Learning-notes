JavaScript classes are primarily **syntactical sugar over existing prototype-based inheritance**. The class syntax does not introduce a new object-oriented model to JavaScript. **The body of a class is executed in strict mode**.

Classes are in fact "special functions", and just as you can define function expressions and function declarations, the class syntax also includes class expressions and class declarations. An important difference between function declarations and class declarations is that **function declarations are hoisted and class declarations are not**.

```javascript
// class declaration
class Rectangle {
  constructor(height, width) {
    this.height = height;
    this.width = width;
  }
}

// class expression
let Rectangle = class {
  constructor(height, width) {
    this.height = height;
    this.width = width;
  }
};

// methods defined within the class body are added to the prototype
var rect = new Rectangle(1,1);
rect.constructor === Rectangle.prototype.constructor  // true
Object.getPrototypeOf(rect)  // { constructor: class Rectangle }
```

### Constructor
The constructor method is a special method for creating and initializing an object created with a class. There can only be one special method with the name "constructor" in a class. A constructor can use the `super` keyword to call the constructor of the parent class. If you do not specify a constructor method, a default constructor is used.

### Class methods
```javascript
class Animal {
  eat() {}
  sleep = () => {}
}

// Is equivalent to
function Animal () {
  this.sleep = function () {}
}

Animal.prototype.eat = function () {}
```

### Getter and Setter
Add methods prefixed with `get` or `set` to create a getter and setter, which are executed based on what you are doing: accessing the variable, or modifying its value. **If you only have a getter, the property cannot be set; If you only have a setter, you can change the value but not access it**.

```javascript
class Circle {
  constructor (radius) {
    this.radius = radius;
  }

  calcArea() {
    return Math.PI * this.radius * this.radius;
  }
 
  get area() {
    return this.calcArea();
  }

  set area(n) {
    this.radius = Math.sqrt(n / Math.PI);
  }
}

const circle = new Circle(10);
console.log(circle.area);
```

### Class field
Both Public and private field declarations are an experimental feature (stage 3) proposed at TC39. Support in browsers is limited, but the feature can be used through a build step with systems like Babel. 

It will allow you to add instance properties directly as a property on the class **without having to use the constructor method**. Class properties are public by default. Sometimes when you’re building a class, you want to have private values that aren’t exposed to the outside world. Historically in JavaScript, because we’ve lacked the ability to have truly private values, we’ve marked them with an underscore (but it is only a convention). **According to the new proposal, you can create a private field using a hash # prefix**.

```javascript
class Car {
  // private field, # as a part of the property name
  #milesDriven = 0  
  
  drive(distance) {
    this.#milesDriven += distance
  }
  getMilesDriven() {
    return this.#milesDriven
  }
}

const tesla = new Car()
tesla.drive(10)
tesla.getMilesDriven() // 10
tesla.#milesDriven     // Invalid
```

### Static fields
Public static fields are useful when you want a field to exist only once per class, not on every class instance you create. **Static methods aren't called on instances of the class. Instead, they're called on the class itself**. 

Static methods are not directly accessible using `this` keyword from non-static methods. You need to call them using the class name: `CLASSNAME.STATIC_METHOD_NAME()` or by calling the method as a property of the constructor: `this.constructor.STATIC_METHOD_NAME()`.

```javascript
class ClassWithStaticField {
  static staticField = 'static field';

  constructor() {
    console.log(ClassWithStaticField.staticMethod()); 
    console.log(this.constructor.staticMethod()); 
  }
  
  static staticMethod() {
    return 'Static method has been called';
  }

  static anotherStaticMethod() {
    return this.staticMethod() + ' from another static method';
  }
}

console.assert(ClassWithStaticField.hasOwnProperty('staticField'));
console.log(ClassWithStaticField.staticField);
ClassWithStaticField.staticMethod(); 
```

When a **static or prototype method** is called without a value for `this`, the `this` value will be `undefined` inside the method, because code within the class body is always executed in strict mode.

```javascript
class Animal { 
  speak() {
    return this;
  }
  static eat() {
    return this;
  }
}

let obj = new Animal();
obj.speak(); // Animal {}
let speak = obj.speak;
speak(); // undefined

Animal.eat() // class Animal
let eat = Animal.eat;
eat(); // undefined
```

### Class inheritance
A class can extend another class or extend traditional function-based "classes". The `super` keyword is used to reference the parent class.

```javascript
class Square extends Polygon {
  constructor(length) {
    // calls parent class constructor
    super(length, length);
    this.name = 'Square';
  }

  hello() {
    return super.hello() + ' I am a square.'
  }
}

Object.getPrototypeOf(Square.prototype) === Polygon.prototype;  // true

// In derived classes, super() must be called before you can use 'this'
class A {}
class B extends A {
  constructor() {
    super();
    console.log(this);  // B {}
  }
}
class C extends A {
  constructor() {
    console.log(this);  // ReferenceError
  }
}
```

### new.target
It lets you detect whether a function or constructor was called using the `new` operator. Normally the left-hand side of the dot is the object on which property access is performed, but here new is not an object. If constructors and functions invoked using the `new` operator, **`new.target` returns a reference to the constructor or function. In normal function calls, `new.target` is undefined**. In arrow functions, `new.target` is inherited from the surrounding scope.

```javascript
function Foo() {
  if (!new.target) throw 'Foo() must be called with new';
  console.log('Foo instantiated with new');
}

new Foo();  // "Foo instantiated with new"
Foo();  // throws "Foo() must be called with new"

// new.target refers to the constructor that was directly invoked by new
class A {
  constructor() { console.log(new.target.name); }
}
class B extends A { 
  constructor() { super(); } 
}

const a = new A();  // logs "A"
const b = new B();  // logs "B"
```
