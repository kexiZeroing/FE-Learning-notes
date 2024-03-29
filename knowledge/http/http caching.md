## HTTP caching
The performance of web sites and applications can be significantly improved by reusing previously fetched resources. Caching is a technique that stores a copy of a given resource and serves it back when requested. When a web cache has a requested resource in its store, it intercepts the request and returns its copy instead of re-downloading from the originating server. 

A **private cache** is dedicated to a single user. You might have seen "caching" in your browser's settings already. A browser cache holds all documents downloaded. This cache is used to make visited documents available for back/forward navigation. A **shared cache** is a cache that stores responses to be reused by more than one user. For example, an ISP might have set up a web proxy as part of its local network infrastructure to serve many users so that popular resources are reused a number of times, reducing network traffic and latency.

### Controlling caching
The `Cache-Control` HTTP/1.1 header is used to specify directives for caching mechanisms in both requests and responses. Use this header to define your caching policies with the variety of directives it provides. (When both `Cache-Control` and `Expires` are present, `Cache-Control` takes precedence.)

```
// in HTTP request
Cache-Control: max-age=<seconds>
Cache-Control: max-stale[=<seconds>]
Cache-Control: min-fresh=<seconds>
Cache-Control: no-cache 
Cache-Control: no-store

// in HTTP response
Cache-Control: must-revalidate
Cache-Control: no-cache
Cache-Control: no-store
Cache-Control: public
Cache-Control: private
Cache-Control: max-age=<seconds>
Cache-Control: s-maxage=<seconds>
Cache-Control: stale-while-revalidate=<seconds>
```
- no-cache  
The stored response must always go through validation with the origin server first before using it. If you mean to not store the response in any cache, use `no-store` instead. This directive is not effective in preventing caches from storing your response.

- no-store  
The response may not be stored in any cache. Although other directives may be set, this alone is the only directive you need in preventing cached responses on modern browsers. Specifying `no-cache` or `max-age=0` indicates that clients can cache a resource and must revalidate each time before using it.

- public / private  
For example, your ISP could have an invisible proxy between you and the Internet, that is caching web pages to reduce the amount of bandwidth needed and lower costs. By using `cache-control: private`, you are specifying that it shouldn't cache the page but only allowing the final user to do so. If you use `cache-control: public`, you are saying that it's okay for everyone to cache the page, and so the proxy would keep a copy.

> The `public` attribute should not be set in almost all cases, as it can lead to an issue with authorized requests. Setting the `public` attribute in a `Cache-Control` header for an authorized request (i.e. one which is made with an `Authorization` header) will explicitly allow intermediary servers to store and serve the response to other visitors. In most cases this is not the expected behaviour and could lead to data leakage.

- max-age  
The maximum amount of time a resource is considered fresh. One day cache would be `Cache-Control: max-age=86400`.

> If a response includes an `s-maxage` directive, then for a shared cache (but not for a private cache), the maximum age specified by this directive overrides the maximum age specified by either the `max-age` directive or the `Expires` header.`s-maxage` is similar to `max-age` but it applies to proxies (CDN) instead of clients.

- max-stale  
Indicates the client will accept a stale response. An optional value in seconds indicates the upper limit of staleness the client will accept.

- min-fresh  
Indicates the client wants a response that will still be fresh for at least the specified number of seconds.

- must-revalidate  
Indicates that once a resource becomes stale, caches must not use their stale copy without successful validation on the origin server. Whereas `no-cache` implies `must-revalidate` plus the fact that the response becomes stale right away.

- stale-while-revalidate  
Indicates the client will accept a stale response, while asynchronously checking in the background for a fresh one. The seconds value indicates how long the client will accept a stale response.

> A `Cache-Control` response header that contains `stale-while-revalidate` should also contain `max-age` which determines staleness. If the locally cached response is still fresh, then it can be used to fulfill a browser's request. But if the cached response is stale, then another age-based check is performed: is the age of the cached response within the window of time covered by the `stale-while-revalidate` setting? If the age of a stale response falls into this window, then it will be used to fulfill the browser's request. **At the same time, a "revalidation" request will be made against the network in a way that doesn't delay the use of the cached response**. Then the network response is stored locally, replacing whatever was previously cache, and resetting the "freshness" timer. If the stale cached response is old enough that it falls outside the `stale-while-revalidate` window of time, then it will not fulfill the browser's request. The browser will instead retrieve a response from the network, and use that for both fulfilling the request and also populating the local cache with a fresh response.

Response headers can be set at multiple stages depending on your application architecture - for example **the web server, load balancer and CDN can all set and modify response headers**. Generally we should expect response headers to be forwarded transparently through proxies such as load balancers and CDNs unless explicit changes have been made, so the web server is the best place to start. You should be able to find what you need with a search like `Apache set response headers` or `Nginx set caching headers` on Google.

### Freshness
Before this expiration time, the resource is **fresh**; after the expiration time, the resource is **stale**. Note that a stale resource is not evicted or ignored; when the cache receives a request for a stale resource, it forwards this request with a `If-None-Match` to check if it is in fact still fresh. If so, the server **returns a `304 (Not Modified)` header without sending the body of the requested resource**, saving some bandwidth.

> Open Chrome DevTools / Network and reload a page multiple times, the table column "Size" will tell you that some files are loaded "from memory cache". Now close the browser, open DevTools / Network again and load that page again. All cached files are loaded "from disk cache" now, because your memory cache is empty.

### Cache validation
When a cached document's expiration time has been reached, it is either validated or fetched again. Revalidation is triggered when the user presses the reload button. It is also triggered under normal browsing if the cached response includes the `"Cache-Control: must-revalidate"` header. When a validation request is made, the server can either ignore the validation request and response with a normal `200 OK`, or it can return `304 Not Modified` to instruct the browser to use its cached copy. The latter response can also include headers that update the expiration time of the cached document.

- ETag  
The `ETag` response header is an opaque-to-the-useragent value that can be used as a strong validator. That means that a HTTP user-agent, such as the browser, does not know what this string represents and can't predict what its value would be. If the `ETag` header was part of the response for a resource, the client can issue an `If-None-Match` in the header of future requests in order to validate the cached resource.

- Last-Modified  
The `Last-Modified` response header can be used as a weak validator. If the `Last-Modified` header is present in a response, then the client can issue an `If-Modified-Since` request header to validate the cached resource.

### Code Example
```js
// node server.js
const http = require('http')
const path = require('path')
const fs = require('fs')

http.createServer((req, res) =>{
  let { pathname } = require('url').parse(req.url)
  // 打印当前的 pathname 来判断请求资源时候是否走了强缓存（不经过服务器）**index.html 作为入口不会被缓存**
  console.log(pathname)
  let absPath = path.join(__dirname, pathname)
  fs.stat(absPath, (err, statObj) => {
    if (err) {
      res.statusCode = 404;
      res.end()
      return
    }
    if (statObj.isFile()) {
      // 20s 内如果再发一次请求，就不用请求服务器，直接从缓存中取（强制缓存的状态码都是 200）
      res.setHeader('Cache-Control', 'max-age=20')
      // Cache-Control 适用于高版本浏览器，Expires 适用于低版本浏览器
      res.setHeader('Expires', new Date(Date.now() + 20*1000).toGMTString())
      fs.createReadStream(absPath).pipe(res)
    }
  })
}).listen(5050)


// 协商缓存的应用, Etag 和 if-None-Match
if (statObj.isFile()) {
  // 获取上一次请求时候md5
  let client = req.headers['if-none-match']
  // 根据目标路径读取文件并且转为md5
  let fileContent = fs.readFileSync(absPath, 'utf-8')
  let md5 = crypto.createHash('md5').update(fileContent).digest('base64')
  if (client && client === md5) {
      res.statusCode = 304
      res.end()
      return
  }

  res.setHeader('Cache-Control', 'no-cache') 
  res.setHeader('Etag', md5)
  fs.createReadStream(absPath).pipe(res)
}
```

### Revved resources
They are some resources that would benefit the most from caching, but this makes them very difficult to update. This is typical of the resources included and linked from each web pages: JavaScript and CSS files change infrequently, but when they change you want them to be updated quickly.

Web developers invented a technique called `revving`. Infrequently updated files are named in a specific way: a revision (or version) number is added to the filename, and it doesn't need to be a classical version string like `1.1.3`. It can be anything that prevent collisions, like a hash or a date. Each new revision is considered as a resource that never changes and that can have an expiration time very far in the future. In order to have the new versions, all the links to them must be changed. This additional complexity is usually taken care of by the tool chain used by web developers.

## Back/forward cache
Back/forward cache (or bfcache) is a browser optimization that enables instant back and forward navigation. It significantly improves the browsing experience for users especially those with slower networks or devices.

> bfcache has been supported in both Firefox and Safari for many years. In Chrome, bfcache is currently only enabled on mobile. To test bfcache on desktop you need to enable the `#back-forward-cache` flag. If you do not want a page to be stored in the bfcache, you can ensure it's not cached by setting the `Cache-Control` header on the top-level page response to `no-store`.

The cache used by bfcache is different from the HTTP cache. **The bfcache is a snapshot of the entire page in memory (including the JavaScript heap)**, whereas the HTTP cache contains only the responses for previously made requests. In the bfcach, browsers pause running any pending timers or unresolved promises (essentially all pending tasks in the JavaScript task queues) and resume processing tasks when the page is restored from the bfcache.

The primary events used to observe bfcache are the page transition events: `pageshow` and `pagehide`. In browsers that support the Page Lifecycle API, the `resume` event will also fire when pages are restored from bfcache (immediately before the `pageshow` event), though it will also fire when a user revisits a frozen background tab. **The `pageshow` event fires right after the `load` event. It has a `persisted` property which will be true if the page was restored from bfcache** (and false if not).

The `pagehide` event is the counterpart to the `pageshow` event. The `pagehide` event fires when the page is either unloaded normally or when the browser attempts to put it into the bfcache. The `pagehide` event also has a `persisted` property, and if it's false then you can be confident a page is not about to enter the bfcache. However, if the persisted property is true, it doesn't guarantee that a page will be cached. It means that the browser intends to cache the page, but there may be factors that make it impossible to cache. Similarly, the `freeze` event will fire immediately after the `pagehide` event.

```js
window.addEventListener('pageshow', function(event) {
  if (event.persisted === true) {
    console.log('This page was restored from the bfcache.');
  } else {
    console.log('This page was loaded normally.');
  }
});

window.addEventListener('pagehide', function(event) {
  if (event.persisted === true) {
   console.log('This page might be entering the bfcache.');
  } else {
    console.log('This page will unload normally and be discarded.');
  }
});
```

Browsers will not attempt to put a page in bfcache in the following scenarios:
- Pages with an unfinished IndexedDB transaction
- Pages with in-progress `fetch()` or XMLHttpRequest
- Pages with an open WebSocket or WebRTC connection
 
If your page is using any of these APIs, it's best to always close connections and remove observers during the `pagehide` or `freeze` event. Then, if the page is restored from the bfcache, you can re-open or re-connect to those APIs in the `pageshow` or `resume` event.

If you track visits to your site with an analytics tool, you will likely notice a decrease in the total number of pageviews reported. Most of the popular analytics libraries do not track bfcache restores as new pageviews. If you don't want your pageview counts to go down due to enabling bfcache, you can **report bfcache restores as pageviews by listening to the `pageshow` event and checking the `persisted` property**.

```js
// An example shows how to do this with Google Analytics

// Send a pageview when the page is first loaded
gtag('event', 'page_view')

window.addEventListener('pageshow', function(event) {
  if (event.persisted === true) {
    // Send another pageview if the page is restored from bfcache
    gtag('event', 'page_view')
  }
});
```

### Caching strategies used in service worker
- **stale-while-revalidate** strategy has requests attempt to respond with a cached resource if one is available, falling back to a network request if it hasn’t been cached. A network request is used to update a cached resource after the cached resources has been served.

- **network first** strategy will try and fetch the latest version of a resource from the network. If the request is successful, it’ll serve that to the user and store it in the cache. If not, it will respond with the cached resource.

- **cache first** strategy will check to see if resources are in the cache before trying to go to the network. If they are, they’re served, if not, they’re retrieved from the network and a version is stored in the cache. This strategy doesn’t have a built-in mechanism for updating cached items, so be sure to use it in conjunction with another way to update what’s cached, like expire headers or resource hashing.

- **cache only** strategy is similar to the cache first strategy, except that resources can only be retrieved from the cache; you’ll need to get the items into the cache without relying on a network fallback if the resource isn’t there. It’s good for resources that should be updated when your Service Worker updates, like an offline fallback page, as that’s the most common time these resources will be updated.

- **network only** strategy can be thought of as being similar to how browsers behave without the use of a service worker or the Cache Storage API. Requests will only be able to respond with a resource if it can be fetched from the network.
