## Start a modern front-end project
Create `index.js` and `index.html` files within a folder. Assuming that you have node.js installed, go ahead and install `yarn` and run `yarn init` command on your project’s repository. Alternatively, you can use `npm`. After running `yarn init` or `npm init`, just follow the instructions on the CLI and you should end up with a file called `package.json`.

Then let’s bring a web application bundler. We want `parcel` in our project, so install it as a development dependency by running `yarn add parcel-bundler --dev` or `npm install parcel-bundler -- save-dev`. Once parcel has been added to our project, we can simply run `parcel index.html` and parcel will serve the file on its built-in development server on port 1234. We can add a `start` script to our `package.json` and simply run `yarn start` or `npm start`.

Let’s move on and add Sass support to our project. To do so using parcel, we run `yarn add node-sass --dev`. We can create a file called `index.scss`. To make it works, we need to reference it. Go to the `index.js` file and import it using a relative path like `import './index.scss`.

> Sass has two syntaxes. The older syntax is known as SASS (with `.sass` extention). Instead of brackets and semicolons, it uses the indentation of lines to specify blocks. The most commonly used is SCSS (with `.scss` extention). SCSS is a superset of CSS syntax, so every valid CSS is a valid SCSS as well. 

We need modern javascript and babel help us with that. We run `yarn add @babel/core @babel/cli @babel/preset-env --dev` and create a `.babelrc` file on the root of the project referencing the preset we are using. We also need a `parcel build index.js` as a `build` script in `package.json` file which will be used for production, and parcel will create a `dist` directory with all assets minified.

### npm and npx
One might install a package locally on a certain project using `npm install some-package`, then we want to execute that package from the command line. Only globally installed packages can be executed by typing their name only (local installs  at `./node_modules/.bin`; global installs at `/usr/local/bin`). To fix this, you must type the local path `./node_modules/.bin/some-package`.

npx comes bundled with npm version 5.2+. It will check whether the command exists in `$PATH` or in the local project binaries and then execute it. So if you wish to execute the locally installed package, all you need to do is type `npx some-package`. 
Another advantage of npx is the ability to execute a package which wasn't previously installed. For example, `npx create-react-app my-app` will generate a react app boilerplate within the path the command had run in, and ensures that you always use the latest version of a generator or build tool without having to upgrade each time you’re about to use it.

### package.json and package-lock.json
`package-lock.json` is automatically generated for any operations where npm modifies either the `node_modules` tree or `package.json`. This file is intended to be committed into source repositories. The purpose of the `package-lock.json` is to avoid the situation where installing modules from the same `package.json` results in two different installs. `package-lock.json` is a large list of each dependency listed in your `package.json`, the specific version that should be installed, the location (URI) of the module, a hash that verifies the integrity of the module, the list of packages it requires.

- If you have a `package.json` and you run `npm i`, we generate a `package-lock.json` from it.
- If you run `npm i` against that `package.json` and `package-lock.json`, the latter will never be updated, even if the `package.json` would be happy with newer versions.
- If you manually edit your `package.json` to have different ranges and run `npm i` and those ranges aren't compatible with your `package-lock.json`, then the latter will be updated with version that are compatible with your `package.json`.

### dependencies, devDependencies and peerDependencies
**Dependencies** are required at runtime, like a library that provides functions that you call from your code. If you are deploying your application, dependencies has to be installed, or your app will not work. They are installed transitively (if A depends on B depends on C, npm install on A will install B and C). *Example: lodash,and your project calls some lodash functions*.

**devDependencies** are dependencies you only need during development, like compilers that take your code and compile it into javascript, test frameworks or documentation generators. They are not installed transitively (if A depends on B dev-depends on C, npm install on A will install B only). *Example: grunt, your project uses grunt to build itself*.

**peerDependencies** are dependencies that your project hooks into, or modifies, in the parent project, usually a plugin for some other library. It is just intended to be a check, making sure that the project that will depend on your project has a dependency on the project you hook into. So if you make a plugin C that adds functionality to library B, then someone making a project A will need to have a dependency on B if they have a dependency on C. They are not installed, they are only checked for. *Example: your project adds functionality to grunt and can only be used on projects that use grunt*.

### Live Reload and Hot Reload
**Live Reload** refreshes the entire app when a file changes. For example, if you were four links deep into your navigation and saved a change, live reloading would restart the app and load the app back to the initial route. **Hot Reload** only refreshes the files that were changed without losing the state of the app. (Webpack's **Hot Module Replacement** replaces the modules that have been modified on the fly without reloading the entire page). The advantage of this is that it doesn't lose your app state, e.g. your inputs on your form fields, your currently selected tab.

> When a file is edited, the dev server recompiles with the changes, then pushes a notification to the client code in the browser. The app code can then subscribe to "some file changed" notifications, re-import the new version of the code, and swap out the old code for the new code as the app is still running.

## Set up Prettier and ESLint
1. Install `Prettier` and `ESLint` plugins and enable `format on save` in settings (execute `save without formatting` command to disable). We can edit some default settings for prettier in settings (`cmd + ,`, then input prettier).
2. Install eslint and prettier npm packages `npm i -D eslint prettier`
3. Run `eslint --init` to create a `eslintrc.json` (or `.js`, `.yml`) config file after install eslint globally `npm i -g eslint` (otherwise need to run `./node_modules/eslint/bin/eslint.js --init`), pick the following options:
    - To check syntax, find problems, and enforce code style
    - JavaScript modules (import/export)
    - None of these
    - TypeScript: No
    - Browser or Node, as you prefer
    - Use a popular style guide Airbnb
4. Create a config file for Prettier. Note that the VS Code's prettier plugin may inconsistent with prettier npm package in devDependencies that eslint uses, so we use this config file to unify the rules.
    ```js
    // .prettierrc.js
    module.exports = {
        trailingComma: "es5",
        tabWidth: 2,
        semi: true,
        singleQuote: true,
    };
    ```
5. Install `npm i -D eslint-plugin-prettier eslint-config-prettier`. The first one is used to run prettier as an ESLint rule. The second one is used to to disable ESLint rules that might be conflict with prettier.
6. Then you have to tell ESLint to use Prettier as a plugin and turn off rules that are unnecessary or might conflict with Prettier:
    ```js
    //.eslintrc.js
    module.exports = {
        env: {
            es6: true,
            browser: true,
            es2021: true,
        },
        extends: ['airbnb-base', 'prettier'],
        parserOptions: {
            ecmaVersion: 12,
            sourceType: 'module',
        },
        rules: {
            'prettier/prettier': 'error',
        },
        plugins: ['prettier'],
    };
    ```
7. Add `eslint src` as a lint script which can be run as `npm run lint`, and it shows eslint errors in the Problems tab. Run `npm run lint -- --fix` to fix errors (if not format on save).

### What is Husky
While working on an enterprise development team, it is important that all code linting and unit tests are passing before committing code, especially if you are using some form of continuous integration. **Husky** is a very popular npm package that allows custom scripts to be ran against your repository to prevent bad `git commit` and `git push`, which makes commits of fixing lint errors doesn't happen.

Install husky `npm i -D husky` and have a "husky" section in the `package.json` file to add git hooks.
```json
// package.json
"husky": {
    "hooks": {
        "pre-commit": "npm run lint && npm run test",
        "pre-push": "npm test"
    }
}
```

Npm scripts also have pre and post lifecycles. If we add pre and post with command, they will run before and after the given script.
```json
{
    "name": "npm-lifecycle-example",
    "scripts": {
        "prefoo": "echo prefoo",
        "foo": "echo foo",
        "postfoo": "echo postfoo"
    }
}

// run `npm run foo`
// prefoo
// foo
// postfoo
```
