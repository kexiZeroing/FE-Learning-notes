## Steps to start a new JavaScript project

> rc stands for 'run commands'. It is used for any file that contains startup information for a command. The format of config files can be .json, .js, .yml

1. Open VS Code
2. <kbd>Ctrl</kbd> + <kbd>`</kbd> open the terminal
3. `npm init -y` to generate `package.json` file
4. `git init` to make a git repo (`git remote add origin URL` and `git remote -v`)
5. Create `src` directory and `index.js` file
6. Install Prettier plugin and enable `format on save` in setting (`save without formatting` to disable)
7. Go to [gitignore.io](https://www.gitignore.io/) to create a `.gitignore` file (i.e. choose macOS, node, code)
8. Add `node src/index.js` as the start script and run `npm start`
9. Install eslint `npm i -D eslint`, create a `.eslintrc.yml` file (using "eslint:recommended"), add `eslint src` as a lint script, and run `npm run lint`
10. Install prettier and eslint-prettier `npm i -D prettier eslint-plugin-prettier eslint-config-prettier`, and add prettier rules to `.eslintrc.yml` file. It will show eslint(prettier) errors in the problems tab (can create a `.prettierrc.yml` file to change default prettier rules).

    - prettier: The core prettier library
    - eslint-config-prettier: Disables ESLint rules that might conflict with prettier
    - eslint-plugin-prettier: Runs prettier as an ESLint rule

11. eslint has the fix option `npm run lint -- --fix` (fix is the parameter for eslint rather than npm) which is very convenient to fix all the files in the src directory

### What is Husky

> While working on an enterprise development team, it is important that all code linting and unit tests are passing before committing code (**git hooks**), especially if you are using some form of continuous integration.

[**Husky**](https://github.com/typicode/husky) is a very popular npm package that allows custom scripts to be ran against your repository to prevent bad git commit, git push and more. (making commits of fixing lint/prettier issue doesn't happen)

12. Install husky `npm i -D husky` and have a "husky" section in the `package.json` file to add git hooks.

### Add more things

13. Install webpack `npm i -D webpack webpack-dev-server webpack-cli` and babel loder `npm i -D babel-loader @babel/core @babel/preset-env`. Create a `dist` folder for the build version and have `rm dist/*` as a clean script. `webpack-dev-server` provides live reloading.
14. Create a `webpack.config.js` file in the root, and can copy the content from https://createapp.dev with all the settings in a GUI. You can create `webpack.{dev,prod}.js` to have different configurations and add `--config webpack.{dev,prod}.js` in the NPM scripts like `"build": "webpack --config webpack.prod.js"`
15. Create `.babelrc` in the root using `@babel/preset-env`
16. Install eslint-babel `npm i -D babel-eslint eslint-plugin-babel` and change `.eslintrc` file.

---

17. For TypeScript, webpack starts at `ts/src/main.ts`, locates all TypeScript and JavaScript files that are used, and compiles them into the single script file `build/main-bundle.js`. For compiling TypeScript to JavaScript, webpack uses the loader `ts-loader`. All files with a `.ts` or `.tsx` extension will be handled by ts-loader's rule: `{ test: /\.tsx?$/, loader: "ts-loader" }`
