## Server Side Rendering
When you view source of a webpage from a web app initialized with create-react-app (CRA), you will notice that it’s an almost empty page with just the `<head>` section but hardly anything within `<body>`. This is because CRA renders your app on the client side, meaning the built `.js` file is first downloaded to the user’s browser before the rest of the page starts loading. This increases the initial load time, and some web crawlers are unable to index the site.

Server-side rendering (SSR) is when content on your webpage is loaded via HTTP, which was rendered on the server and comes as fully rendered HTML. Client-rendered apps are great at any subsequent user interaction after the first page load. **Server Side Rendering allows us to get the sweet spot in the middle of client-rendered apps and backend-rendered apps: the page is generated server-side, but all interactions with the page once it’s been loaded are handled client-side**. 

> With SSR, you render your JS on the server into HTML. You serve that HTML to your client so it appears to have fast startup. But you still have to wait for your JS to reach the user before anything can be interactive (hydration). After hydration, SSR can't be used again - it's typically only used for initial loads. With SSR in Next.js, all component code is sent to the client in the JS bundle. *Server Components* will allow you to choose "zero-bundle" or "whatever bundle you need". Code for Server Components is never delivered to the client. Also because we render into an intermediate format, we can merge that server tree with the client tree without losing client state.

Hydration is the name given to the process in JavaScript frameworks to initializing the page in the browser after it has previously been server rendered. While the server can produce the initial HTML we need to augment this output with event handlers and initialize our application state in a way that it can be interactive in the browser. Simply server rendering doesn't fix everything. In fact, more than likely you've increased your JavaScript payload and may have even longer times until your application is interactive than when you were just client rendering. Most frameworks hydration ready code is larger than their typical client code because ultimately it needs to do both things. There are two characteristics that are pretty unfortunate. One is we render on the server, and now we basically need to re-render it again in the browser to hydrate everything. The second is we tend to send everything across the wire twice. Once as HTML and once in JavaScript. Remix, React Server Components are all improving techniques on the way...

### Enable SSR for React using CRA and Express

> Next.js offers a modern approach to creating static and server-rendered applications built with React.

1. Use create-react-app to creat an React app.
2. In app’s `index.js` file, we use ReactDOM’s hydrate method instead of render to indicate to the DOM renderer that we’re rehydrating the app after a server-side render. (It has the ability to attach event listeners to existing markup once React loads. It expects that the rendered content is identical between the server and the client.)
```js
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

ReactDOM.hydrate(<App />, document.getElementById('root'));
```
3. Now we have our app in place, let’s set up a server that will send along a rendered version. We use Express, so create a `server` directory next to the app’s `src` directory. Then create a new `server/index.js` file that contains the Express server code.
4. We can import the `<App>` component from the client app directly to the server.
    - We use a method `ReactDOMServer.renderToString()` to render our app to a static HTML string.
    - We read the static `index.html` file from the built client app, inject our app’s static content in the `<div id="root">`, and send that as the response to the request.
    - We tell Express to serve contents from the `build` directory as static files.

```js
import path from 'path';
import fs from 'fs';

import React from 'react';
import express from 'express';
import ReactDOMServer from 'react-dom/server';

import App from '../src/App';

const PORT = process.env.PORT || 3006;
const app = express();

app.get('/', (req, res) => {
  const app = ReactDOMServer.renderToString(<App />);

  const indexFile = path.resolve('./build/index.html');
  fs.readFile(indexFile, 'utf8', (err, data) => {
    if (err) {
      console.error('Something went wrong:', err);
      return res.status(500).send('Oops...');
    }

    return res.send(
      data.replace('<div id="root"></div>', `<div id="root">${app}</div>`)
    );
  });
});

app.use(express.static('./build'));

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
```

5. Let server code work, we need to bundle and transpile it using `webpack` and `Babel` as server-side Node.js code does not know anything about JSX nor ES Modules. To accomplish this, we add the dev dependencies `npm install webpack webpack-cli webpack-node-externals @babel/core babel-loader @babel/preset-env @babel/preset-react --save-dev`.
6. Create a `Babel` configuration file `.babelrc.json` and a `webpack` config `webpack.server.js` for the server that uses `babel-loader` to transpile the code.
```json
// .babelrc.json
{
  "presets": [
    "@babel/preset-env",
    "@babel/preset-react"
  ]
}
```

```js
// webpack.server.js
const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: './server/index.js',
  // omit the files from `node_modules` in the bundle; the server can access these files directly
  target: 'node',
  externals: [nodeExternals()],
  output: {
    path: path.resolve('server-build'),
    filename: 'index.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader'
      }
    ]
  }
};
```

```json
// npm scripts
"scripts": {
  "dev:build-server": "NODE_ENV=development webpack --config webpack.server.js --mode=development -w",
  "dev:start": "nodemon ./server-build/index.js"
},
```

7. The server webpack config will watch for changes and our server will restart on changes. Now open `http://localhost:3006/` in the web browser and you will see the server-side rendered app (convert the `<App>` component into HTML).

### Deploy SSR to Production
- [How to deploy a React SSR app on Google Cloud Platform](https://javascript.plainenglish.io/deploy-react-ssr-to-production-26350e9985d1)
