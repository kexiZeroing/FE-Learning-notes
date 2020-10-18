## Proxy
Starting with ECMAScript 2015, JavaScript gains support for the `Proxy` and `Reflect` objects allowing you to **intercept and define custom behavior** for fundamental language operations. A Proxy object wraps another object and intercepts operations, like reading and writing properties, optionally handling them on its own, or transparently allowing the object to handle them. Proxies are used in many libraries and some browser frameworks.

Use the `Proxy()` constructor to create a new Proxy object. This constructor takes two mandatory arguments:
- target: the original object which you want to proxy
- handler: an object that defines which operations will be intercepted and how to redefine intercepted operations.

For example, We can provide an implementation of the `get()` handler, which intercepts attempts to access properties in the target. **Handler functions are also called traps, presumably because they trap calls to the target object**. Traps allow you to intercept interactions, as long as those interactions happen through proxy.

```javascript
const target = {};
const p = new Proxy(target, {});

// operation forwarded to the target
p.a = 37;
console.log(target.a);  // 37

// define functions on the handler object
const handler = {
  get: function(obj, prop) {
    return prop in obj ?
      obj[prop] :
      37;
  }
};

const p = new Proxy({}, handler);
p.a = 1;
console.log(p.a);  // 1
console.log('c' in p, p.c);  //  false, 37

// use for validating the passed value for an object
let validator = {
  set: function(obj, prop, value) {
    if (prop === 'age') {
      if (!Number.isInteger(value)) {
        throw new TypeError('The age is not an integer');
      }
      if (value > 200) {
        throw new RangeError('The age seems invalid');
      }
    }

    // The default behavior to store the value
    obj[prop] = value;

    // Indicate success
    return true;
  }
};

const person = new Proxy({}, validator);

person.age = 100;
console.log(person.age); // 100
person.age = 'young';    // Throws an exception
person.age = 300;        // Throws an exception
```

### handler.get() and handler.set()
`get: function(target, property, receiver) {}`, its parameters are: the target object, the name of the property to get, receiver is either the proxy or an object that inherits from the proxy. It is a trap for getting a property value. But if the following invariants are violated, the proxy will throw a TypeError:

- The value reported for a property must be the same as the value of the corresponding target object property if the target object property is a non-writable, non-configurable data property.
- The value reported for a property must be undefined if the corresponding target object property is a non-configurable accessor property that has undefined as its `[[Get]]` attribute.

```javascript
const obj = {};
Object.defineProperty(obj, 'a', { 
  configurable: false, 
  enumerable: false, 
  value: 10, 
  writable: false 
});

const p = new Proxy(obj, {
  get: function(target, property) {
    return 20;
  }
});

p.a; // TypeError is thrown
```

`set: function(target, property, value, receiver) {}`, it should return a boolean value. **Return true to indicate that assignment succeeded. If return false, and the assignment happened in strict-mode code, a TypeError will be thrown**. It has the similar invariants rules as get method.

```javascript
// A complete traps list example
new Proxy(docCookies, {
  get: function (oTarget, sKey) {
    return oTarget[sKey] || oTarget.getItem(sKey) || undefined;
  },
  set: function (oTarget, sKey, vValue) {
    if (sKey in oTarget) { return false; }
    return oTarget.setItem(sKey, vValue);
  },
  deleteProperty: function (oTarget, sKey) {
    if (sKey in oTarget) { return false; }
    return oTarget.removeItem(sKey);
  },
  ownKeys: function (oTarget, sKey) {
    return oTarget.keys();
  },
  has: function (oTarget, sKey) {
    return sKey in oTarget || oTarget.hasItem(sKey);
  },
  defineProperty: function (oTarget, sKey, oDesc) {
    if (oDesc && 'value' in oDesc) { oTarget.setItem(sKey, oDesc.value); }
    return oTarget;
  },
  getOwnPropertyDescriptor: function (oTarget, sKey) {
    var vValue = oTarget.getItem(sKey);
    return vValue ? {
      value: vValue,
      writable: true,
      enumerable: true,
      configurable: false
    } : undefined;
  }
});
```

## Reflect
Reflect is a built-in object that provides methods for interceptable JavaScript operations. The methods are the same as those of proxy handlers. Unlike most global objects, Reflect is not a constructor. You cannot use it with a `new` operator or invoke the Reflect object as a function. **All methods of Reflect are static**.

### get(), set(), has() methods
The static `Reflect.get()` method allows you to get a property on an object. It is like the property accessor syntax as a function. The `Reflect.set()` method allows you to set a property on an object. It does property assignment and is like the property accessor syntax as a function.

```javascript
// Reflect.get
Reflect.get({ x: 1, y: 2 }, 'x')  // 1
Reflect.get(['zero', 'one'], 1)  // "one"

const target = {
  message1: "hello",
  message2: "everyone"
};

const handler = {
  get: function (target, prop, receiver) {
    if (prop === "message2") {
      return "world";
    }
    // it is destructuring (in function call) ,not rest parameter (in function declaration)
    return Reflect.get(...arguments);
  },
};

const proxy = new Proxy(target, handler);

console.log(proxy.message1); // hello
console.log(proxy.message2); // world

// Reflect.set
let obj = {} 
Reflect.set(obj, 'prop', 'value')  // true
obj.prop  // "value"

// Reflect.has
Reflect.has({x: 0}, 'x')  // true
Reflect.has({x: 0}, 'y')  // false

obj = new Proxy({}, {
  has(t, k) { return k.startsWith('door')  }
});
Reflect.has(obj, 'doorbell')  // true
Reflect.has(obj, 'dormitory')  // false
```
