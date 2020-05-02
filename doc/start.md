## Steps to start a new JavaScript project

> rc stands for 'run commands'. It is used for any file that contains startup information for a command. The format of config files can be .json, .js, .yml

1. Open VS Code
2. <kbd>Ctrl</kbd> + <kbd>`</kbd> open the terminal
3. `npm init -y` to generate `package.json` file
4. `git init` to make a git repo (`git remote add origin URL` and `git remote -v`)
5. Go to [gitignore.io](https://www.gitignore.io/) to create a `.gitignore` file (i.e. choose macOS, node, code)
6. Install `Prettier` and `ESLint` plugin and enable `format on save` in setting (`save without formatting` to disable). Can edit some default settings for Prettier in settings (<kbd>Cmd</kbd> + <kbd>,</kbd> then input prettier) e.g. use single quote, add semicolon
7. Create `src` directory and `index.js` file
8. Add `node src/index.js` as the start script and run `npm start`

9. Install eslint and prettier npm packages `npm i -D eslint prettier eslint-plugin-prettier eslint-config-prettier`
   - eslint-config-prettier: Disables ESLint rules that might conflict with prettier
   - eslint-plugin-prettier: Runs prettier as an ESLint rule
10. Run `eslint --init` to create the `eslintrc.json` file after install eslint globally `npm i -g eslint` (see `eslint --help` for more options) and now it will show eslint errors in the Problems tab
    ![eslint config](https://tva1.sinaimg.cn/large/007S8ZIlgy1geemtoq02yj30yg06gdhs.jpg)
11. Add `eslint src` as a lint script which can be run as `npm run lint`, and it shows eslint errors
12. Use Airbnb's ESLint rules, including ECMAScript 6+ and React `npx install-peerdeps --dev eslint-config-airbnb`, then change the `.eslintrc` file adding "airbnb" to `extends` and can set some checkings off in `rules`

### What is Husky

> While working on an enterprise development team, it is important that all code linting and unit tests are passing before committing code (**git hooks**), especially if you are using some form of continuous integration.

[**Husky**](https://github.com/typicode/husky) is a very popular npm package that allows custom scripts to be ran against your repository to prevent bad git commit, git push and more. (making commits of fixing lint/prettier issue doesn't happen)

13. Install husky `npm i -D husky` and have a "husky" section in the `package.json` file to add git hooks.

### Add more things

14. Install webpack `npm i -D webpack webpack-dev-server webpack-cli` and babel loder `npm i -D babel-loader @babel/core @babel/preset-env`. Create a `dist` folder for the build version and have `rm dist/*` as a clean script. `webpack-dev-server` provides live reloading.
15. Create a `.babelrc` file in the root using `@babel/preset-env`
16. Create a `webpack.config.js` file in the root, and can copy the content from https://createapp.dev with all the settings in a GUI. Also can have `webpack.{dev,prod}.js` to have different configurations and add `--config webpack.{dev,prod}.js` in the NPM scripts like `"build": "webpack --config webpack.prod.js"`
