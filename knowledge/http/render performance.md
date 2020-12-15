## Optimize Largest Contentful Paint
One factor contributing to a poor user experience is how long it takes a user to see any content rendered to the screen. **First Contentful Paint (FCP)** measures how long it takes for initial DOM content to render, but it does not capture how long it took the largest (usually more meaningful) content on the page to render. **Largest Contentful Paint (LCP)** measures when the largest content element in the viewport becomes visible. It can be used to determine when the main content of the page has finished rendering on the screen. 

### Optimize your server
> Use **Time to First Byte (TTFB)** to measure your server response times.

Instead of just immediately serving a static page on a browser request, many server-side web frameworks need to create the web page dynamically. This could be due to pending results from a database query or because components need to be generated into markup by a UI framework. Many **web frameworks that run on the server have performance guidance** that you can use to speed up this process.

If the content on your web page is being hosted on a single server, your website will load slower for users that are geographically farther away because their browser requests literally have to travel around the world. Consider **using a CDN** to ensure that your users never have to wait for network requests to faraway servers.

If your HTML is static and doesn't need to change on every request, **caching** can prevent it from being recreated unnecessarily. Configure reverse proxies to serve cached content or act as a cache server when installed in front of an application server. Configure and manage your cloud provider's (Firebase, AWS, Azure) cache behavior. 

For many sites, images are the largest element in view when the page has finished loading. 1) Compress images. 2) Convert images into newer formats. 3) Consider using an image CDN.

### Establish third-party connections early
Server requests to third-party origins can also impact LCP. Use `rel="preconnect"` to inform the browser that your page intends to establish a connection as soon as possible. You can also use `dns-prefetch` to resolve DNS lookups faster.

```html
<link rel="preconnect" href="https://example.com">
<link rel="dns-prefetch" href="https://example.com">
```

Modern browsers try their best to anticipate what connections a page will need, but they cannot reliably predict them all. The good news is that you can give them a hint. Adding `rel=preconnect` to a `<link>` informs the browser that your page intends to establish a connection to another domain, and that you'd like the process to start as soon as possible. Resources will load more quickly because the setup process has already been completed by the time the browser requests them.  But it's ultimately up to the browser to decide whether to execute them. (Setting up and keeping a connection open is a lot of work, so the browser might choose to ignore resource hints or execute them partially depending on the situation.)

While `dns-prefetch` only performs a DNS lookup, `preconnect` establishes a connection to a server. This process includes DNS resolution, as well as establishing the TCP connection, and performing the TLS handshake. If a page needs to make connections to many third-party domains, preconnecting all of them is counterproductive. **The preconnect hint is best used for only the most critical connections. For all the rest, use `<link rel=dns-prefetch>` to save time on the first step, the DNS lookup**.

> The logic behind pairing these hints is because support for `dns-prefetch` is better than support for `preconnect`. Browsers that don’t support `preconnect` will still get some added benefit by falling back to `dns-prefetch`. Because this is an HTML feature, it is very fault-tolerant. If a non-supporting browser encounters a `dns-prefetch` hint—or any other resource hint—your site won’t break.

### Render blocking JavaScript and CSS
Before a browser can render any content, it needs to parse HTML markup into a DOM tree. The HTML parser will pause if it encounters any external stylesheets (`<link rel="stylesheet">`) or synchronous JavaScript tags (`<script src="main.js">`). Scripts and stylesheets are both render blocking resources which delay FCP, and consequently LCP. Defer any non-critical JavaScript and CSS to speed up loading of the main content of your web page.

**Minify CSS**, if you use a module bundler or build tool, include an appropriate plugin to minify CSS files on every build. Use the `Coverage` tab in Chrome DevTools (`cmd + shift + p`, then type 'coverage') to **find any unused CSS** on your web page. **Inlining important styles** eliminates the need to make a round-trip request to fetch CSS. If you cannot manually add inline styles to your site, use a library to automate the process.

If you know that a particular resource should be prioritized, use `<link rel="preload">` to fetch it sooner. By preloading a certain resource, you are telling the browser that you would like to fetch it sooner than the browser would discover it because you are certain that it is important for the current page. (**Preloading is best suited for resources typically discovered late by the browser**). The browser caches preloaded resources so they are available immediately when needed. It doesn't execute the scripts or apply the stylesheets. Supplying the `as` attribute helps the browser set the priority of the prefetched resource according to its type and determine whether the resource already exists in the cache.

```html
<link rel="preload" as="script" href="script.js">
<link rel="preload" as="style" href="style.css">
<link rel="preload" as="image" href="img.png">
```

> Resource hints like `preconnect` and `dns-prefetch` are executed as the browser sees fit. The `preload`, on the other hand, is mandatory for the browser. Modern browsers are already pretty good at prioritizing resources, that's why it's important to use `preload` sparingly and only preload the most critical resources.

For script tags, **`<script async>`** downloads the file during HTML parsing and will pause the HTML parser to execute it when it has finished downloading. Async scripts are executed as soon as the script is loaded, so it doesn't guarantee the order of execution. **`<script defer>`** downloads the file during HTML parsing and will only execute it after the parser has completed. Defer scripts are guaranteed to execute in the order that they appear in the document. Typically you want to use `async` where possible, then `defer` then no attribute. 

### Adaptive serving
When loading resources that make up the main content of a page, it can be effective to conditionally fetch different assets depending on the user's device or network conditions. This can be done using the **Network Information, Device Memory, and HardwareConcurrency APIs**.

- `navigator.connection.effectiveType`: Effective connection type
- `navigator.connection.saveData`: Data-saver enabled/disabled
- `navigator.hardwareConcurrency`: CPU core count
- `navigator.deviceMemory`: Device Memory

If you have large assets that are critical for initial rendering, you can use different variations of the same resource depending on the user's connection or device. For example, you can display an image instead of a video for any connection speeds lower than 4G:

```js
if (navigator.connection && navigator.connection.effectiveType) {
  if (navigator.connection.effectiveType === '4g') {
    // Load video
  } else {
    // Load image
  }
}
```
