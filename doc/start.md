## Follow these steps to start a new JavaScript project

1. Open VS Code
2. <kbd>Ctrl</kbd> + <kbd>`</kbd> open the terminal
3. `npm init -y` to generate `package.json` file
4. `git init` to make a git repo (`git remote add origin URL` and `git remote -v`)
5. Create `src` directory and `index.js` file
6. Install Prettier plugin and enable `format on save` in setting (`save without formatting` to disable)
7. Go to [gitignore.io](https://www.gitignore.io/) to create a `.gitignore` file (i.e. choose macOS, node, code)
8. Add `node src/index.js` as the start script and run `npm start`
9. Install eslint `npm i -D eslint`, create a `.eslintrc.yml` file (using "eslint:recommended"), add `eslint src` as a lint script, and run `npm run lint`
10. Install prettier and eslint-prettier `npm i -D prettier eslint-plugin-prettier eslint-config-prettier`, and add prettier rules to `.eslintrc.yml` file. It will show eslint(prettier) errors in the problems tab
11. eslint has the fix option `npm run lint -- --fix` (fix is the parameter for eslint rather than npm) which is very convenient to fix all the files in the src directory

### Husky

> While working on an enterprise development team, it is important that all code linting and unit tests are passing before committing code (**git hooks**), especially if you are using some form of continuous integration.

[**Husky**](https://github.com/typicode/husky) is a very popular npm package that allows custom scripts to be ran against your repository to prevent bad git commit, git push and more. (making commits of fixing lint/prettier issue doesn't happen)

12. Install husky `npm i -D husky` and have a "husky" section in the `package.json` file to add git hooks.
