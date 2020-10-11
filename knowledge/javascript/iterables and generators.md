## Iterators and Iterables
Iterators are a new way to loop over any collection in JavaScript. We can use `for...of` to iterate an array, but would get a TypeError saying that the object is not iterable. A lot of things are iterables in JavaScript. 
- Arrays
- Strings
- Maps and Sets
- arguments
- DOM elements
- The `for...of` loops require an iterable. Otherwise it will throw a TypeError

The **iterable protocol** allows JavaScript objects to define or customize their iteration behavior, such as what values are looped over in a `for..of` construct. **In order to be iterable, an object must implement the @@iterator method, meaning that the object must have a property with a @@iterator key which is available via constant `Symbol.iterator`**. Symbols offer names that are unique and cannot clash with other property names. That method will return an object called an **`iterator`**. This iterator will have a method called **`next`** which will return an object with keys **`value` and `done`**. The value will contain the current value. The done is boolean which denotes whether all the values have been fetched or not.

<img alt="iterable" src="https://cdn.nlark.com/yuque/0/2019/png/398686/1562722299404-0f072011-8ba6-4e24-938a-2a159cf60afa.png" width="800">  

```javascript
// Iterable is an object with a function whose key is Symbol.iterator
const iterable = {
  [Symbol.iterator](): iterator
}

// Iterator is the above function to obtain the values to be iterated
const iterator = {
  next: () => ({
    value: any,
    done: boolean
  })
}
```

- There is no @@iterator function. It is only used in specification to denote a specific symbol. If you want to use that symbol in your code, you have to use `Symbol.iterator` which is a symbol specifies the default iterator for an object. 
- Some built-in types are built-in iterables with a default iteration behavior, such as Array or Map, because their prototype objects all have a `Symbol.iterator` method, while other types (such as Object) are not.
- `for...of` iterates over the property values; `for...in` iterates the property names/keys.

```javascript
// String is an example of a built-in iterable object
const someString = 'hi';
typeof someString[Symbol.iterator];  // "function"

const iterator = someString[Symbol.iterator]();
iterator.next();  // { value: "h", done: false }
iterator.next();  // { value: "i", done: false }
iterator.next();  // { value: undefined, done: true }

// Destructuring happens because of iterables
const array = ['a', 'b', 'c', 'd'];
const [first, ,third,last] = array;

// is equivalent to
const array = ['a', 'b', 'c', 'd'];
const iterator = array[Symbol.iterator]();
const first = iterator.next().value
iterator.next().value // Since it was skipped, so it's not assigned
const third = iterator.next().value
const last = iterator.next().value
```

**To Make objects iterable, we need to implement `Symbol.iterator` method.** We will use **computed property syntax** to set this key. The `for...of` loop takes an `iterable` and keeps on calling the `next()` until done is true.

```javascript
let Reptiles = {
  biomes: {
    water: ["Alligators", "Crocs"],
    land: ["Snakes", "Turtles"]
  },

  [Symbol.iterator]() {
    let reptilesByBiome = Object.values(this.biomes);
    let reptileIndex = 0;
    let biomeIndex = 0;
    
    // return an iterator with next method
    return {
      next() {
        if (reptileIndex >= reptilesByBiome[biomeIndex].length) {
          biomeIndex++;
          reptileIndex = 0;
        }

        if (biomeIndex >= reptilesByBiome.length) {
          return { value: undefined, done: true };
        }

        return {
          value: reptilesByBiome[biomeIndex][reptileIndex++],
          done: false
        };
      }
    };
  }
};

for (let reptile of Reptiles) console.log(reptile);
```

## Generator functions
It allows you to define an iterative method by writing a function whose execution is not continuous. Generator functions are written **using the function\* syntax**. When called initially, generator functions do not execute any of their code, instead **returning a type of iterator called a generator**. By calling the generator's `next` method, the generator executes until it encounters the `yield` keyword. A generator can contain many `yield` keywords, thus halting itself multiple times. Generators compute `yield` values on demand, which allows to represent sequences that are expensive to compute, or even infinite sequences.

The `yield` keyword pauses generator function's execution and the value of the expression following the `yield` keyword is returned to the generator's caller. It can be thought of as a generator-based version of the `return` keyword. The `yield` actually returns an object with two properties, value and done. The next time `next()` is called, execution resumes with the statement immediately after the `yield`.

```javascript
function* makeRangeIterator(start, end, step) {
  for (let i = start; i < end; i += step) {
    yield i;
  }
}
let it = makeRangeIterator(1, 10, 2);

it.next();  // {value: 1, done: false}
it.next();  // {value: 3, done: false}

// another example
function* calculator(input) {
  const doubleThat = 2 * (yield (input / 2));
  const another = yield doubleThat;
  return input * doubleThat * another;
}
const calc = calculator(10);

calc.next();    // {value: 5, done: false}
calc.next(7);   // {value: 14, done: false}
calc.next(100); // {value: 14000, done: true}
```
