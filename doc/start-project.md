## Steps to start a new JavaScript project

1. Open VS Code
2. <kbd>Ctrl</kbd> + <kbd>`</kbd> open the terminal
3. `npm init -y` to generate `package.json` file
4. `git init` to make a git repo (`git remote add origin URL` and `git remote -v`)
5. Go to [gitignore.io](https://www.gitignore.io/) to create a `.gitignore` file (i.e. choose macOS, node, code)
6. Install `Prettier` and `ESLint` plugins and enable `format on save` in settings (run `save without formatting` command to disable). Can edit some default settings for Prettier in settings (<kbd>Cmd</kbd> + <kbd>,</kbd> then input prettier) e.g. use single quote, add semicolon
7. Create `src` directory and `index.js` file
8. Add `node src/index.js` as the start script and run `npm start`

9. Install eslint and prettier npm packages `npm i -D eslint prettier`
10. Run `eslint --init` to create the `eslintrc.json` (or `.js`, `.yml`) config file after install eslint globally `npm i -g eslint` (otherwise need to run `./node_modules/eslint/bin/eslint.js --init`), pick the following options:
    - To check syntax, find problems, and enforce code style
    - JavaScript modules (import/export)
    - None of these
    - TypeScript: No
    - Browser or Node, as you prefer
    - Use a popular style guide Airbnb
11. Create a config file for Prettier. **Note that VS Code's prettier plugin may inconsistent with prettier npm package in devDependencies that eslint uses. Use prettier config file to unify rules**
    ```js
    // .prettierrc.js
    module.exports = {
        trailingComma: "es5",
        tabWidth: 2,
        semi: true,
        singleQuote: true,
    };
    ```
12. Install `npm i -D eslint-plugin-prettier eslint-config-prettier`
   - eslint-plugin-prettier: to run prettier as an ESLint rule
   - eslint-config-prettier: to disable ESLint rules that might conflict with prettier
13. Then you have to tell ESLint to use Prettier as a plugin and turn off rules that are unnecessary or might conflict with Prettier
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
14. Add `eslint src` as a lint script which can be run as `npm run lint`, and it shows eslint errors in the Problems tab. Run `npm run lint -- --fix` to fix errors (if not format on save).

### What is Husky

> While working on an enterprise development team, it is important that all code linting and unit tests are passing before committing code (**git hooks**), especially if you are using some form of continuous integration.

[**Husky**](https://github.com/typicode/husky) is a very popular npm package that allows custom scripts to be ran against your repository to prevent bad git commit, git push and more. (making commits of fixing lint/prettier issue doesn't happen)

15. Install husky `npm i -D husky` and have a "husky" section in the `package.json` file to add git hooks.
    ```json
    // package.json
    "husky": {
        "hooks": {
            "pre-commit": "npm run lint && npm run test",
            "pre-push": "npm test"
        }
    }
    ```

### Add more things

16. Install webpack `npm i -D webpack webpack-dev-server webpack-cli`, and have a `dist` folder for the build version and have `rm dist/*` as a clean script `webpack-dev-server` provides live reloading.
17. Babel itself does not do anything useful, you need to configure it and add plugins (most popular presets are `env` and `react`). Install babel `npm i -D babel-loader @babel/core @babel/preset-env`. Create a `.babelrc` file in the root using env preset
    ```json
    {
      "presets": [
        ["env", {
          "targets": {
            "browsers": ["last 2 versions", "safari >= 7"]
          }
        }]
      ]
    }
    ```
18. Create a `webpack.config.js` file in the root, you can copy the content from https://createapp.dev with all the settings. 
