## Redirections
In HTTP, redirection is triggered by a server sending a special redirect response to a request. Redirect responses have status codes that start with `3`, and a `Location` header holding the URL to redirect to. When browsers receive a redirect, they immediately load the new URL provided in the `Location` header. **However, browsers always send a `GET` request to that new URL**.

The `301 (Moved Permanently)` status code indicates that the target resource has been assigned a new permanent URI. A user agent may change the request method from `POST` to `GET` for the subsequent request.

The `302 (Found)` status code indicates that the target resource resides temporarily under a different URI. A user agent may change the request method from `POST` to `GET` for the subsequent request. If this behavior is undesired, the `307 (Temporary Redirect)` status code can be used instead.

The `307 (Temporary Redirect)` status code indicates that the target resource resides temporarily under a different URI and the user agent **must not change the request method and post data** if it performs an automatic redirection to that URI.

The `308 (Permanent Redirect)` status code, that is similar to `301 (Moved Permanently)` but does not allow the request method to be changed from `POST` to `GET`.

### Use cases
- When a site resides at `www.example.com`, but accessing it from `example.com` should also work. Redirections for `example.com` to `www.example.com` are thus set up.
- Your company was renamed, but you want existing links or bookmarks to still find you under the new name.
- Requests to the `http://` version of your site will redirect to the `https://` version of your site.

## Content negotiation
Content negotiation is the mechanism that is used for serving different representations of a resource at the same URI, so that the user agent can specify which is best suited for the user. Specific HTTP headers by the client (server-driven negotiation or proactive negotiation), which is the standard way of negotiating a specific kind of resource. The server uses them as hints and an internal algorithm chooses the best content to serve to the client. 

The HTTP/1.1 standard defines list of the standard headers that start server-driven negotiation (`Accept`, `Accept-Charset`, `Accept-Encoding`, `Accept-Language`). The server uses the `Vary` header to indicate which headers it actually used for content negotiation, so that caches can work optimally.

```
Accept: text/html, application/xhtml+xml, application/xml;q=0.9, image/webp, */*;q=0.8

Accept-Charset: utf-8, iso-8859-1;q=0.5

Accept-Encoding: gzip
Accept-Encoding: br;q=1.0, gzip;q=0.8, *;q=0.1

Accept-Language: en-US,en;q=0.5
```

Quality values (q-factors), are used to describe the order of priority of values in a comma-separated list. The importance of a value is marked by the suffix `';q='` immediately followed by a value between 0 and 1 included, with up to three decimal digits, the highest value denoting the highest priority. When not present, the default value is 1. With the same quality, more specific values have priority over less specific ones.