## Creating a React App From Scratch
React doesn’t "just work" out of the box. `create-react-app` abstracts a lot of what makes a React app work. You may want to make your own implementation, or at least have some ideas of what it’s doing under the hood.

### Setup
To get started, create a new directory for your React app and initialize the project with `npm init`. In the new project folder, create `public` and `src` directories. `public` will handle any static assets, and most importantly houses the `index.html` file, which react will utilize to render your app.

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <link rel="icon" type="image/png" href="./assets/favicon-32x32.png">
  <title>React Starter</title>
</head>
<body>
  <div id="root"></div>
  <!-- It will refer to http://localhost:3000/dist/bundle.js -->
  <script src="/dist/bundle.js"></script>
</body>
</html>
```

### Babel
We need to make sure the code we write can be compiled, so we’ll need Babel. Go ahead and run `npm install --save-dev @babel/core @babel/cli @babel/preset-env @babel/preset-react`.

`babel-core` is the main babel package, and we need this to do transformations on our code. `babel-cli` allows to compile files from the command line. `preset-env` and `preset-react` are both presets that transform specific flavors of code — in this case, the `env` preset allows us to transform ES6+ into more traditional javascript and the `react` preset does the same, but with JSX instead.

In the project root, create a file called `.babelrc`. We’re telling babel that we’re going to use the `env` and `react` presets. Note that `@babel/env` is same as `@babel/preset-env` here, babel already knows that it is a preset since it is in the presets array.

```json
{
  "presets": ["@babel/env", "@babel/preset-react"]
}
```

### Webpack
Now we need to acquire and configure webpack. We need a few more packages and save them as dev dependencies `npm install --save-dev webpack webpack-cli webpack-dev-server style-loader css-loader babel-loader`.

Webpack uses `loader` to process different types of files for bundling. It also works alongside the development server that we’re going to use to serve our React project in development. Now we need webpack to use our loaders and prepare the dev server. Create a file at the root of the project called `webpack.config.js` which exports an object with webpack’s configuration.

```js
const path = require("path");
const webpack = require("webpack");

module.exports = {
  entry: "./src/index.js",
  mode: "development",
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: "babel-loader"
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      }
    ]
  },
  resolve: { extensions: ["*", ".js", ".jsx"] },
  output: {
    path: path.resolve(__dirname, "dist/"),
    publicPath: "/dist/",
    filename: "bundle.js"
  },
  devServer: {
    contentBase: path.join(__dirname, "public/"),
    port: 3000,
    publicPath: "/dist/",
    hotOnly: true
  },
  plugins: [new webpack.HotModuleReplacementPlugin()]
};
```

The `entry` tells webpack where our application starts and where to start bundling our files. `mode` lets webpack know we’re working in development mode. This saves us from having to add a mode flag when we run the development server. The `module` object helps define how the exported javascript modules are transformed and which ones are included according to the given array of `rules`.

Our first rule is about transforming ES6 and JSX syntax. The `test` and `exclude` properties are conditions to match file against, and we direct webpack to use babel. **You can configure babel through `.babelrc` or through the `babel-loader` configuration in webpack** (`babel-loader` uses babel under the hood, which obviously respects the `.babelrc`). Defining the babel config on the loader in webpack only applies to webpack, whereas using a `.babelrc` will affect everything that uses babel (if you're only using webpack it doesn't make a difference). Using a `.babelrc` is usually preferred as you want to have a general babel config, and if you need to override a setting you can still do that in the specific application like in the webpack config.

The next rule is for processing CSS (we’re not pre-or-post-processing CSS here). `css-loader` requires `style-loader` in order to work. Note that `Rule.loader` is a shortcut to `Rule.use: [{ loader }]`. If we want an array of loaders, we have to use `use`, if it's just one loader, then we use `loader`.

As of webpack 5, using the built-in Asset Modules we can easily incorporate images and icons in our system **without configuring additional loaders**. Prior to webpack 5 it was common to use `url-loader` to inline a file into the bundle as a data URI or `file-loader` to emit a file into the output directory. Asset Modules replaces these loaders by adding new module types.
- `asset/resource` emits a separate file and exports the URL. Previously achievable by using file-loader.
- `asset/inline` exports a data URI of the asset. Previously achievable by using url-loader.
- `asset` automatically chooses between exporting a data URI and emitting a separate file. Previously achievable by using `url-loader` with asset size limit.

The `resolve` property allows us to specify which extensions webpack will resolve. This allows us to import modules without needing to add their extensions.

The `output` property tells webpack on how and where it should output your bundles and assets. The `publicPath` specifies the public URL of the output directory when referenced in a browser. **The value of this option is prefixed to every URL created by the runtime or loaders**. If this is set incorrectly, you’ll get 404’s as the server won’t be serving your files from the correct location.

Set up webpack-dev-server in the `devServer` property. This doesn’t require much for our needs — just the location we’re serving static files from such as `index.html` and the port we want to run the server on. `contentBase` property exists only in webpack-dev-server and is only used for serving static files (i.e. `public/index.html`, `favicon.png`). `devServer` also has a `publicPath` property and the bundled files will be available in the browser under this path. Imagine that the server is running under `http://localhost:8080` and `output.filename` is set to `bundle.js`. By default the `devServer.publicPath` is `'/'`, so your bundle is available as `http://localhost:8080/bundle.js`.
- Make sure `devServer.publicPath` always starts and ends with a forward slash.
- It is recommended that `devServer.publicPath` is the same as `output.publicPath`.

Finally, we want to use Hot Module Replacement so we don’t have to constantly refresh to see our changes. Instantiate a new instance of the plugin in the `plugins` property and make sure that we set `hotOnly` to true in the `devServer` (enable HMR without page refresh as a fallback in case of build failures). 

> HMR exchanges, adds, or removes modules while an application is running, without a full reload, which generally speeds up the development process. A hot reload to an app will refresh the files that were changed **without losing the application’s state**. A live reload to an app will restart the entire app, and cause it to lose its state.

### React
We need to get `react` and `react-dom` as regular dependencies. Create a file called `index.js` in the `src` directory. This file tells our React app where to hook into the DOM. Now, create another file in `src` called `App.js`, which is a React component.

Adding images in the `public` folder and `src` folder both are acceptable methods. `public` is for anything that is not used by your app when it compiles, and `src` for anything that is used when the app is compiled. So if you use an image inside a component, it should be in the `src` folder, but if you have an image outside the app (i.e. favicon) it should be in `public`. Importing images into the component has the benefit that your assets will be handled by the bundler, and will receive hashes which improves caching/performance.

To finish the setup of react-hot-loader, HMR needs to know what to actually replace. We’re going to use a package `react-hot-loader`. You can safely install it as a regular dependency instead of a dev dependency as it automatically ensures it is not executed in production and the footprint is minimal.

```js
// index.js
import React from "react";
import ReactDOM from "react-dom";
import App from "./App.js";

ReactDOM.render(<App />, document.getElementById("root"));
```

```js
// App.js
import React from "react";
import "./App.css";
import { hot } from 'react-hot-loader/root'
import { Hello } from "./Hello";
import Logo from './images/logo.png';

function App() {
  return (
    <div>
      <h1 className="title">Hello, World</h1>
      <Hello name="John" />
      <img src={Logo} alt="Logo" />
    </div>
  );
}

export default hot(App);
```

Now, we have a functional react app and the source code according to the above steps is in [react-project-starter repo](https://github.com/kexiZeroing/react-project-starter). It covers the things you need to be able to render a basic React app, without having to touch create-react-app.

Note that webpack-dev-server does not work with webpack-cli v4, and webpack-cli v4 comes with out of box support of `@webpack-cli/serve` which means you can **use `webpack serve` to invoke the webpack-dev-server**. Thus we add the `webpack serve --open 'Google Chrome'` in the start script in `package.json` and run `npm run start`.

You may notice that built files never show up in your `dist` directory when starting the project. webpack-dev-server is actually serving the bundled files from memory — once the server stops, they’re gone. To actually build your files, we utilize webpack to add a script called `build` in the `package.json` with `webpack --mode production`.

### Deploy
To deploy our app, we need the `index.html` in the `dist` directory. We can install a webpack plugin [HtmlWebpackPlugin](https://github.com/jantimon/html-webpack-plugin), and it will generate a `index.html` file (by default it will use `src/index.ejs` if it exists) in the same directory where our `bundle.js` is created. In the webpack configuration, we change `devServer.publicPath` from `/dist/` to `/`, so let dev server generate the files at the root, which means you can load up `localhost:3000` and see the generated HTML without having to visit `localhost:3000/dist/index.html`.

After building the app, we want to deploy it to [GitHub Pages](https://pages.github.com). First, install the GitHub Pages dependency `npm install gh-pages --save-dev`. Then need to add a `homepage` property in the `package.json` file `"homepage": "https://{username}.github.io/{repo}/"`, and also add a deploy script `"deploy": "gh-pages -d dist"`. After running `npm run deploy`, a `gh-pages` branch is created in the repository, which is responsible for hosting your app. Note that by default GitHub Pages is disabled for a repo, and you need to select `gh-pages` as the source branch (site is being built from the `gh-pages` branch) to activate it in the repo's setting.

You may find all the relative links are broken. When you deploy to GitHub Pages, it asks for `{username}.github.io/assets/image.png`, but it should have been asking for `{username}.github.io/{repo}/assets/image.png`. We can change `output.publicPath` in webpack config to control the base path, adding the `{repo}` in relative path when it is deployed to GitHub Pages and none when in local. The way to help doing that is to **export a function from the webpack configuration** instead of exporting an object. The function will be invoked with two arguments, an environment (`env`) as the first parameter to read [environment variables](https://webpack.js.org/guides/environment-variables/) you set, and an options map (`argv`) as the second parameter which describes the options passed to webpack.
