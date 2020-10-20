## HTTP caching
The performance of web sites and applications can be significantly improved by reusing previously fetched resources. Caching is a technique that stores a copy of a given resource and serves it back when requested. When a web cache has a requested resource in its store, it intercepts the request and returns its copy instead of re-downloading from the originating server. 

A **private cache** is dedicated to a single user. You might have seen "caching" in your browser's settings already. A browser cache holds all documents downloaded. **This cache is used to make visited documents available for back/forward navigation**. A **shared cache** is a cache that stores responses to be reused by more than one user. For example, an ISP might have set up a web proxy as part of its local network infrastructure to serve many users so that popular resources are reused a number of times, reducing network traffic and latency.

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
```
- no-cache  
The stored response must always go through validation with the origin server first before using it. If you mean to not store the response in any cache, use `no-store` instead. This directive is not effective in preventing caches from storing your response.

- no-store  
The response may not be stored in any cache. Although other directives may be set, this alone is the only directive you need in preventing cached responses on modern browsers. Specifying `no-cache` or `max-age=0` indicates that clients can cache a resource and must revalidate each time before using it.

- public / private  
For example, your ISP could have an invisible proxy between you and the Internet, that is caching web pages to reduce the amount of bandwidth needed and lower costs. By using `cache-control: private`, you are specifying that it shouldn't cache the page but only allowing the final user to do so. If you use `cache-control: public`, you are saying that it's okay for everyone to cache the page, and so the proxy would keep a copy.

- max-age  
The maximum amount of time a resource is considered fresh. One day cache would be `Cache-Control: max-age=86400`.

- max-stale  
Indicates the client will accept a stale response. An optional value in seconds indicates the upper limit of staleness the client will accept.

- min-fresh  
Indicates the client wants a response that will still be fresh for at least the specified number of seconds.

- must-revalidate  
Indicates that once a resource becomes stale, caches must not use their stale copy without successful validation on the origin server. Whereas `no-cache` implies `must-revalidate` plus the fact that the response becomes stale right away.

### Freshness
Before this expiration time, the resource is **fresh**; after the expiration time, the resource is **stale**. Note that a stale resource is not evicted or ignored; when the cache receives a request for a stale resource, it forwards this request with a `If-None-Match` to check if it is in fact still fresh. If so, the server **returns a `304 (Not Modified)` header without sending the body of the requested resource**, saving some bandwidth.

### Cache validation
When a cached document's expiration time has been reached, it is either validated or fetched again. Revalidation is triggered when the user presses the reload button. It is also triggered under normal browsing if the cached response includes the `"Cache-Control: must-revalidate"` header. When a validation request is made, the server can either ignore the validation request and response with a normal `200 OK`, or it can return `304 Not Modified` to instruct the browser to use its cached copy. The latter response can also include headers that update the expiration time of the cached document.

- ETag  
The `ETag` response header is an opaque-to-the-useragent value that can be used as a strong validator. That means that a HTTP user-agent, such as the browser, does not know what this string represents and can't predict what its value would be. If the `ETag` header was part of the response for a resource, the client can issue an `If-None-Match` in the header of future requests in order to validate the cached resource.

- Last-Modified  
The `Last-Modified` response header can be used as a weak validator. If the `Last-Modified` header is present in a response, then the client can issue an `If-Modified-Since` request header to validate the cached resource.

### Revved resources
They are some resources that would benefit the most from caching, but this makes them very difficult to update. This is typical of the resources included and linked from each web pages: JavaScript and CSS files change infrequently, but when they change you want them to be updated quickly.

Web developers invented a technique called `revving`. Infrequently updated files are named in a specific way: a revision (or version) number is added to the filename, and it doesn't need to be a classical version string like `1.1.3`. It can be anything that prevent collisions, like a hash or a date. Each new revision is considered as a resource that never changes and that can have an expiration time very far in the future. In order to have the new versions, all the links to them must be changed. This additional complexity is usually taken care of by the tool chain used by web developers.
