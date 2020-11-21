## Using TypeScript

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

Fortunately, you don' have to specify types absolutely everywhere in your code because TypeScript has **Type Inference**. Type inference is what the TypeScript compiler uses to automatically determine types. TypeScript can infer types during variable initialization, when default parameter values are set, and while determining function return values.

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

// Type Alias (should use interface for public API's definition when authoring a library)
type Animal = {
  kind: string;
  weight: number;
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

// Generics
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
```
