## Start a modern front-end project
Create `index.js` and `index.html` files within a folder. Assuming that you have node.js installed, go ahead and install `yarn` and run `yarn init` command on your project’s repository. Alternatively, you can use `npm`. After running `yarn init` or `npm init`, just follow the instructions on the CLI and you should end up with a file called `package.json`.

Then let’s bring a web application bundler. We want `parcel` in our project, so install it as a development dependency by running `yarn add parcel-bundler --dev` or `npm install parcel-bundler --save-dev`. Once parcel has been added to our project, we can simply run `parcel index.html` and parcel will serve the file on its built-in development server on port 1234. We can add a `start` script to our `package.json` and simply run `yarn start` or `npm start`.

Let’s move on and add Sass support to our project. To do so using parcel, we run `yarn add node-sass --dev`. We can create a file called `index.scss`. To make it works, we need to reference it. Go to the `index.js` file and import it using a relative path like `import './index.scss'`.

> Sass has two syntaxes. The older syntax is known as SASS (with `.sass` extention). Instead of brackets and semicolons, it uses the indentation of lines to specify blocks. The most commonly used is SCSS (with `.scss` extention). SCSS is a superset of CSS syntax, so every valid CSS is a valid SCSS as well. 

We need modern javascript and babel help us with that. We run `yarn add @babel/core @babel/cli @babel/preset-env --dev` and create a `.babelrc` file on the root of the project referencing the preset we are using. We also need a `parcel build index.js` as a `build` script in `package.json` file which will be used for production, and parcel will create a `dist` directory with all assets minified.

### npm and npx
One might install a package locally on a certain project using `npm install some-package`, then we want to execute that package from the command line. Only globally installed packages can be executed by typing their name only (local installs  at `./node_modules/.bin`; global installs at `/usr/local/bin`). To fix this, you must type the local path `./node_modules/.bin/some-package`.

npx comes bundled with npm version 5.2+. It will check whether the command exists in `$PATH` or in the local project binaries and then execute it. So if you wish to execute the locally installed package, all you need to do is type `npx some-package`. 

Have you ever run into a situation where you want to try some CLI tool, but it’s annoying to have to install a global just to run it once? npx is great for that. It will automatically install a package with that name from the npm registry and invoke it. When it’s done, the installed package won’t be anywhere in the global, so you won’t have to worry about pollution in the long-term. For example, `npx create-react-app my-app` will generate a react app boilerplate within the path the command had run in, and ensures that you always use the latest version of the package without having to upgrade each time you’re about to use it.

There’s an [awesome-npx](https://github.com/junosuarez/awesome-npx) repo with examples of things that work great with npx.

### package.json and package-lock.json
`package-lock.json` is automatically generated for any operations where npm modifies either the `node_modules` tree or `package.json`. This file is intended to be committed into source repositories. The purpose of the `package-lock.json` is to avoid the situation where installing modules from the same `package.json` results in two different installs. `package-lock.json` is a large list of each dependency listed in your `package.json`, the specific version that should be installed, the location (URI) of the module, a hash that verifies the integrity of the module, the list of packages it requires.

1. If you have a `package.json` and you run `npm i`, we generate a `package-lock.json` from it.
2. If you run `npm i` against that `package.json` and `package-lock.json`, the latter will never be updated, even if the `package.json` would be happy with newer versions.
3. If you manually edit your `package.json` to have different ranges and run `npm i` and those ranges aren't compatible with your `package-lock.json`, then the latter will be updated with version that are compatible with your `package.json`.

### package.json and yarn.lock
`npx create-react-app` executes `create-react-app` binary, and `create-react-app` uses yarn to create the project if yarn is installed, that's why you can see `yarn.lock`. To use npm in `create-react-app`, use `--use-npm` flag (no matter you execute `create-react-app` with npx or yarn or directly, you should set it if you want it to use npm).

### npm install and npm ci
- `npm install` reads `package.json` to create a list of dependencies and uses `package-lock.json` to inform which versions of these dependencies to install. If a dependency is not in `package-lock.json` it will be added by `npm install`.

- `npm ci` (named after **C**ontinuous **I**ntegration) installs dependencies directly from `package-lock.json` and uses `package.json` only to validate that there are no mismatched versions. If any dependencies are missing or have incompatible versions, it will throw an error. It will delete any existing `node_modules` folder and install everything all at once. It never writes to `package.json` or `package-lock.json`. It is faster than `npm install` and the clean state install is great for CI/CD pipelines.

### dependencies, devDependencies and peerDependencies
**Dependencies** are required at runtime, like a library that provides functions that you call from your code. If you are deploying your application, dependencies has to be installed, or your app will not work. They are installed transitively (if A depends on B depends on C, npm install on A will install B and C). *Example: lodash,and your project calls some lodash functions*.

**devDependencies** are dependencies you only need during development, like compilers that take your code and compile it into javascript, test frameworks or documentation generators. They are not installed transitively (if A depends on B dev-depends on C, npm install on A will install B only). *Example: grunt, your project uses grunt to build itself*.

**peerDependencies** are dependencies that your project hooks into, or modifies, in the parent project, usually a plugin for some other library. It is just intended to be a check, making sure that the project that will depend on your project has a dependency on the project you hook into. So if you make a plugin C that adds functionality to library B, then someone making a project A will need to have a dependency on B if they have a dependency on C. They are not installed, they are only checked for. *Example: your project adds functionality to grunt and can only be used on projects that use grunt*.

### Live Reload and Hot Reload
> When a file is edited, the dev server recompiles with the changes, then pushes a notification to the client code in the browser. The app code can then subscribe to "some file changed" notifications, re-import the new version of the code, and swap out the old code for the new code as the app is still running.

**Live Reload** refreshes the entire app when a file changes. For example, if you were four links deep into your navigation and saved a change, live reloading would restart the app and load the app back to the initial route. **Hot Reload** only refreshes the files that were changed without losing the state of the app. (Webpack's **Hot Module Replacement** replaces the modules that have been modified on the fly without reloading the entire page). The advantage of this is that it doesn't lose your app state, e.g. your inputs on your form fields, your currently selected tab.

### Source Map
Once you've compiled and minified your code, normally alongside it will exist a sourceMap file(`file.js.map`). It helps us with debugging transformed code in its original form. By default Babel will add a source map location comment `//# sourceMappingURL=/path/to/file.js.map` at the end of every generated bundle, which is required to **signify to the browser devtools that a source map is available**. 

In development all the source files have associated source maps, but we would not want to ship source maps to our production servers.
- Source maps are usually large; they could be several hundreds of KBs even after compression.
- We may not want to share the original source code of our application with the users.

In production, however, you can choose between not generating source maps at all, generating external, or **hidden source maps** (which means generate the source maps but do not reference them in the JavaScript files). If you’re using an error reporting service such as Sentry, you can upload the produced source maps so you can get runtime errors mapped to their original position in the code that you’ve written. For example, in `angular.json` you can set the `sourceMap` property under the production:
```json
"production": {
  "sourceMap": {
    "scripts": true,
    "hidden": true
  }
}
```

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

## NPM Scripts
NPM Scripts are a set of built-in and custom scripts defined in the `package.json` file. Their goal is to provide a simple way to execute repetitive tasks.

- NPM makes all your dependencies' binaries available in the scripts. So you can access them directly as if they were referenced in your PATH.
    ```json
    // Instead of doing this:
    "scripts": {
        "lint": "./node_modules/.bin/eslint ."
    }

    // You can do this:
    "scripts": {
        "lint": "eslint ."
    }
    ```
- `npm run` is an alias for `npm run-script`, meaning you could also use `npm run-script lint`.
- Built-in scripts can be executed using aliases, making the complete command shorter and easier to remember. For example, `npm run-script test`, `npm run test`, `npm test`, and `npm t` are same to run the test script. `npm run-script start`, `npm run start`, and `npm start` are also same.
- To run multiple scripts sequentially, we use `&&`. For example, `npm run lint && npm test`.
- When a script finishes with a non-zero exit code, it means an error occurred while running the script, and the execution is terminated.
- Use `npm run <script> --silent` to reduce logs and to prevent the script from throwing an error. This can be helpful when you want to run a script that you know may fail, but you don't want it to throw an error. Maybe in a CI pipeline, you want your whole pipeline to keep running even when the test command fails. If we don't want to get an error when the script doesn't exists, we can use `npm run <script> --if-present`.
- We can create "pre" and "post" scripts for any of our scripts, and NPM will automatically run them in order.
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
- You can run `npm config ls -l` to get a list of the configuration parameters, and you can use `$npm_config_` prefix (like `$npm_config_editor`) to access them in the scripts. Any key-value pairs we add to our script will be translated into an environment variable with the `npm_config` prefix.
    ```json
    "scripts": {
        "hello": "echo \"Hello $npm_config_firstname\""
    }

    // Output: "Hello Paula"
    npm run hello --firstname=Paula
    ```
- Passing arguments to other NPM scripts, we can leverage the `--` separator. e.g. `"pass-flags-to-other-script": "npm run my-script -- --watch"` will pass the `--watch` flag to the `my-script` command.
- One convention that you may have seen is using a prefix and a colon to group scripts, for example `build:dev` and `build:prod`. This can be helpful to create groups of scripts that are easier to identify by their prefixes.

## Jamstack
Jamstack is a frontend architecture and stands for **J**avascript, **A**PIs, and **M**arkup stack. In this architecture, the frontend and the backend are completely separate. All interactions with the backend and third parties are done using APIs. Markup that incorporates Javascript, is pre-built into static assets, served to a client from a CDN, and relies on reusable APIs for its functionalities. **(essentially meaning static hosting + services)**

Jamstack sites have better performance, are easier to secure and scale, and cost a lot less than sites built with traditional architectures. Pre-building pages ensure that any errors can be detected early enough. Most importantly, Jamstack allows teams to outsource complex services to vendors who provide, maintain, and secure APIs used on their sites. The APIs can provide specific functionality to static sites like payments, authentication, search, image uploads using Paypal, Auth0, Algolia, Cloudinary.

The most common types of Jamstack site build tools include static site generators (SSG) and headless content management systems (CMS). **Static site generators** are build tools that add content to templates and produce static web pages of a site. These generators can be used for Jamstack sites. Some well-known site generators include Hugo, Gatsby, Jekyll, Next.js, etc. 

There are two points in time that you can integrate dynamic content into a Jamsack application:
- **Build time** - A Jamstack application may load data from files, APIs, third-party services or even a database at build time. You can think of it like a content cache that applies to all your site’s users. Parts of the cache may need to be refreshed at specific intervals - that could be once a month, once a day or even multiple times a day dependent on the type of content.
- **Run time** - This should typically be content that is user specific, needs to update frequently, or is in response to a specific user action. For example, an ecommerce site may have product details populated at build time, but things like the current inventory, shipping options/prices based upon the user’s location, or the user’s shopping cart would all be populated at run time in the browser. As you may notice, in this example, the content on a single page (product details) may be a combination of both pre-rendered (build time) content (i.e. the product name, photo and description) and run time content (i.e. the product inventory and shipping options based on location).

## Serverless
Your code needs to be hosted on a server. Depending on the size of your code and the amount of users you expect to use your product, you might need many servers. Companies used to have their own facilities and warehouses that held their servers and many still do. But for many, this is not ideal. Servers can be difficult to maintain. Maintaining servers and the buildings that house them can become expensive too. That's where AWS and other cloud providers come in.

**Cloud computing** is basically renting out servers and data storage that's owned by someone else. This cuts out the need to buy and maintain physical servers. Through AWS, you gain access to resources like storage services, servers, networking, analytics, AI, and more. There are many other benefits: You pay only for what you use. You can easily spin up and use new servers when needed, allowing you to scale quickly. You can deploy applications globally. With cloud computing, you don't have to worry about server maintenance. But you can decide what type of server to deploy, how much computing power you'll require, how many servers you want, and much more. 

**Serverless** takes cloud computing to the next level. You don't have to worry about the servers at all and you can completely focus on your code. Serverless does not mean there aren't any servers. You still need servers to host and run your code. Serverless computing is an execution model where the cloud provider (AWS, Azure, or Google Cloud) is responsible for executing a piece of code by dynamically allocating the resources, and only charging for the amount of resources used to run the code. The code is typically run inside stateless containers that can be triggered by a variety of events including http requests, database events, queuing services, file uploads, etc. The code that is sent to the cloud provider for execution is usually in the form of a function. Hence serverless is sometimes referred to as "Functions as a Service" (FaaS).

## Web Hosting and Domain registration
Domain registrants (GoDaddy, Hover, Google Domains, Amazon Route 53...) are for registering domain names. If you want `itiscool.com`, you’re going to have to buy it, and domain registrants are companies that help you do that. Just because you own a domain doesn’t mean it will do anything. It’s likely that you will see a “coming soon” page after buying a domain name.

To host a website at your new domain, you’ll need to configure the DNS of your new domain to point at a server connected to the internet. Web hosting services give you that server. You’ll need to know a little bit about the website you intend to host when making that choice. Will it be a WordPress site? Or a Python/Go/Node site? That means your host will need to support those technologies.

- WP Engine is a web host that focuses specifically on WordPress.
- Media Temple has WordPress-specific hosting, but has a wider range of services from very small and budget friendly to huge and white-glove.
- Netlify does static site hosting, which is great for things like static site generators and JAMstack sites.
- Digital Ocean has their own way of talking about hosting. They call their servers Droplets, which are kind of like virtual machines with extra features.
- Heroku calls themselves a “Cloud Application Platform.” It is great for hosting apps with a ready-to-use backend for server languages like Node, Ruby, Java, and Python.
- Amazon Web Services (AWS) is a whole suite of products with specialized hosting focuses. Microsoft Azure and Google Cloud are similar.

Should you bundle your domain registrar and web host into one if a company offers both? It’s mighty handy. The host will also do things like configuring the DNS for you to be all set up for their hosting and you probably don’t even have to think about it. But say the day comes where you just don’t like that host anymore. You want to move hosts. The problem is that they aren’t just your host, but your domain registrant, too. You’re going to leave both of them.

What about assets hosting? Your web host can host assets and that’s fine for the small sites. One major reason people go with an asset host (probably more commonly referred to as a CDN) is for a speed boost. Asset hosts are also servers, just like your web host’s web server. Not only do those assets get delivered to people looking at your site super fast, but your web server is relieved of that burden.
