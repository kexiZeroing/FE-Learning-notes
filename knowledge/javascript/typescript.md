## Using TypeScript

1. In terms of programming language, let TypeScript make sure you can write modern JavaScript.
2. In terms of type system, make sure type safety and our JavaScript makes sense.

### Setting Up TypeScript
To start off, the TypeScript compiler will need to be installed in order to convert TypeScript files into JavaScript files. To do this, TypeScript can either be installed globally or only available at the project level.

```sh
# use npm
npm install --global typescript
npm install --save-dev typescript

# use yarn
yarn global add typescript
yarn add --dev typescript
```

A `tsconfig.json` file is used to configure TypeScript project settings. The `tsconfig.json` file should be put in the project's root directory. You can run the `tsc --init` to generate a `tsconfig.json` file with some default options set and a bunch of other options commented out. In order to transpile the TypeScript code to JavaScript, the `tsc` command needs to be run. Running `tsc` will have the TypeScript compiler search for the `tsconfig.json` file which will determine the project's root directory as well as which options to use when compiling the TypeScript.

Run `tsc --noEmit` that tells TypeScript that we just want to check types and not create any output files. If everything in our code is all right, `tsc` exits with no error. `tsc --noEmit --watch` will add a `watch` mode so TypeScript reruns type-checking every time you save a file.

### Basic Static Types
TypeScript brings along static types to the JavaScript language, and those **types are evaluated at compile time**. Static types can help warn you of possible errors without having to run the code.

```ts
let isAwesome: boolean = true;
let name: string = 'Chris';
let decimalNumber: number = 42;
let whoKnows: any = 1;

// Array types can be written in two ways
let myPetFamily: string[] = ['rocket', 'fluffly', 'harry'];
let myPetFamily: Array<string> = ['rocket', 'fluffly', 'harry'];

// A tuple is an array that contains a fixed number of elements with associated types
let myFavoriteTuple: [string, number, boolean];
myFavoriteTuple = ['chair', 20, true];

/* 
An enum is a way to associate names to a constant value. 
Enums are useful when you want to have a set of distinct values that have a descriptive name associated with it.
By default, enums are assigned numbers that start at 0 and increase by 1 for each member of the enum.
*/
enum Sizes {
  Small,
  Medium,
  Large,
}
Sizes.Small;   // 0
Sizes.Medium;  // 1
Sizes.Large;   // 2

// The first value can be set to a value other than 0
enum Sizes {
  Small = 1,
  Medium,
  Large,
}
Sizes.Small;   // 1
Sizes.Medium;  // 2
Sizes.Large;   // 3

// String values can also be assigned to an enum.
enum ThemeColors {
  Primary = 'primary',
  Secondary = 'secondary',
  Dark = 'dark',
  DarkSecondary = 'darkSecondary',
}
```

Fortunately, you don't have to specify types absolutely everywhere in your code because TypeScript has **Type Inference**. Type inference is what the TypeScript compiler uses to automatically determine types. TypeScript can infer types during variable initialization, when default parameter values are set, and while determining function return values.

### Type Annotation
When the Type Inference system is not enough, you will need to declare types on variables.

```ts
// Use interface to put together multiple type annotations
interface Animal {
  kind: string;
  weight: number;
  color?: string; // optional property
}

let dog: Animal;
dog = {
  kind: 'mammal',
  weight: 10,
};

// Type Alias
// `interface` and `type` are compatible here, because their shape (structure) is the same.
type Animal = {
  kind: string;
  weight: number;
  color?: string;
};
let dog: Animal;

// Inline Annotations
let dog: {
  kind: string;
  weight: number;
};

dog = {
  kind: 'mammal',
  weight: 10,
};

// `typeof` operator takes any object and extracts the shape of it.
// When you update the defaultOrder object, the type Order gets updated as well.
const defaultOrder = {
  x: 1,
  y: {
    a: 'apple',
    b: [1,2]
  }
};
type Order = typeof defaultOrder;

// Generics (type as the parameter)
// There are situations where the specific type of a variable doesn't matter, but a relationship between the types of different variables should be enforced.
const fillArray = <T>(len: number, elem: T) => {
  return new Array<T>(len).fill(elem);
};
const newArray = fillArray<string>(3, 'hi');
newArray.push('bye');

// Union Type (a type can be one of multiple types)
const sayHappyBirthday = (name: string | null) => {
  if (name === null) {
    console.log('Happy birthday!');
  } else {
    console.log(`Happy birthday ${name}!`);
  }
};

// Intersection Type (a type is the combination of all listed types)
type Student = {
  id: string;
  age: number;
};
type Employee = {
  companyId: string;
};
let person: Student & Employee;

// The `declare` keyword to make the function available without implementing a function body at the moment.
declare function search(query: string, tags?: string[]): Promise<Result[]>

type SearchFn = typeof search;
// hover over `SearchFn` to see the expanded type definition
// (query: string, tags?: string[] | undefined) => Promise<Result[]>
```

TypeScript sets `any` as the default type for any value or parameter that is not explicitly typed or can’t be inferred. You will rarely need to declare something as `any` (**you may need the type `unknown`**). And if you want to enter through the backdoor to JavaScript flexibility, be very intentional through a type cast `(theObject as any).xyz`.

In JavaScript, all functions have a return value. If we don’t return one on our own, the return value is by default `undefined`. In TypeScript, every function has a return type. If we don’t explicitly type or infer, the return type is by default `void` and `void` is a keyword in JavaScript returning `undefined`.

### Adding Type Check to JavaScript
TypeScript provides code analysis for JavaScript and VS Code gives us TypeScript out of the box (TypeScript language server). With the addition of `//@ts-check` as the very first line in our JavaScript file, TypeScript became active and started to add red lines to code pieces that just don’t make sense.

`JSDoc` is a way to annotate JavaScript code using comments. TypeScript uses this annotations to get more information on our intended types.

```js
// @ts-check
/**
* @param {number} numberOne
* @param {number} numberTwo
* @returns {number}
*/
function addNumbers(numberOne, numberTwo) { return numberOne + numberTwo }

/**
* @typedef {Object} ShipStorage 
* @property {number} max
* @property {string[]} items 
*/

/** @type ShipStorage */
const storage = {
  max: 10,
  items: []
}
```
