## Cross-Origin Resource Sharing
A web application executes a cross-origin HTTP request when it requests a resource that has a different origin (domain, protocol, or port) from its own. For security reasons, browsers restrict cross-origin HTTP requests initiated from scripts. For example, **XMLHttpRequest and the Fetch API follow the same-origin policy**. This means that a web application using those APIs can only request resources from the same origin unless the response from other origins includes the right CORS headers.

### Overview
CORS works by adding new HTTP headers that let servers describe which origins are permitted to read that information from a web browser. (If *Site A* requests a page from *Site B*, **the browser will actually fetch the requested page on the network level and check if the response headers list *Site A* as a permitted requester domain**.) Additionally, for HTTP request methods other than `GET`, or `POST` with certain MIME types, the specification mandates that browsers **"preflight"** the request, soliciting supported methods from the server with the HTTP `OPTIONS` request method, and then, upon "approval" from the server, sending the actual request. Servers can also inform clients whether "credentials" (such as Cookies and HTTP Authentication) should be sent with requests.

### Simple requests
Simple requests don’t trigger a CORS preflight. It should meet all the following conditions:
- One of the allowed methods: `GET`, `HEAD`, `POST`
- Apart from the headers automatically set by the user agent (for example, Connection, User-Agent), the only headers which are allowed are those defined as a “CORS-safelisted request-header”, which are: `Accept`, `Accept-Language`, `Content-Language`, `Content-Type`, etc.
- The only allowed values for the `Content-Type` header are: `application/x-www-form-urlencoded`, `multipart/form-data`, `text/plain`

To allow the simple requests to access the resource, the **`Access-Control-Allow-Origin` header** should contain the value that was sent in the request's `Origin` header.

```
GET /resources/public-data/ HTTP/1.1
Host: bar.other
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:71.0) Gecko/20100101 Firefox/71.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: en-us,en;q=0.5
Connection: keep-alive
Origin: https://foo.example

HTTP/1.1 200 OK
Date: Mon, 01 Dec 2008 00:23:53 GMT
Server: Apache/2
Access-Control-Allow-Origin: *
Keep-Alive: timeout=2, max=100
Connection: Keep-Alive
Content-Type: application/xml
```

### Preflight requests
```javascript
const xhr = new XMLHttpRequest();
xhr.open('POST', 'https://bar.other/resources/post-here/');
xhr.setRequestHeader('X-PINGOTHER', 'pingpong');
xhr.setRequestHeader('Content-Type', 'application/xml');
```

Preflight requests first send an HTTP request by the `OPTIONS` method to the resource on the other domain, to determine if the actual request is safe to send. **`OPTIONS` is an HTTP/1.1 method that is used to determine further information from servers**, and is a safe method, meaning that it can't be used to change the resource. 

```
Access-Control-Request-Method: POST
Access-Control-Request-Headers: X-PINGOTHER, Content-Type
```

Note that along with the OPTIONS request, two other request headers are sent: `Access-Control-Request-Method` and `Access-Control-Request-Headers`. The `Access-Control-Request-Method` header notifies the server that when the actual request is sent, it will be sent with a POST request method. The `Access-Control-Request-Headers` header notifies the server that when the actual request is sent, it will be sent with a `X-PINGOTHER` and `Content-Type` custom headers. The server now has an opportunity to determine whether it wishes to accept a request under these circumstances.

```
Access-Control-Allow-Origin: http://foo.example
Access-Control-Allow-Methods: POST, GET, OPTIONS
Access-Control-Allow-Headers: X-PINGOTHER, Content-Type
Access-Control-Max-Age: 86400
```

In addition to `Access-Control-Allow-Origin`, the server responds with `Access-Control-Allow-Methods` and says that POST and GET are viable methods to query the resource. The server also sends `Access-Control-Allow-Headers` with a value of "X-PINGOTHER, Content-Type", confirming that these are permitted headers to be used with the actual request. Finally, `Access-Control-Max-Age` gives the value in seconds for how long the response to the preflight request can be cached without sending another preflight request. (Note that each browser has a maximum internal value that takes precedence when the `Access-Control-Max-Age` is greater).

When sending the actual request after preflight is done, the behavior is identical to how a simple request is handled. In other words, a non-simple request whose preflight is successful is treated the same as a simple request, and the server must still send `Access-Control-Allow-Origin` header again for the actual response.

```
OPTIONS /doc HTTP/1.1
Host: bar.other
Origin: http://foo.example
Access-Control-Request-Method: POST
Access-Control-Request-Headers: X-PINGOTHER, Content-Type

HTTP/1.1 204 No Content
Access-Control-Allow-Origin: https://foo.example
Access-Control-Allow-Methods: POST, GET, OPTIONS
Access-Control-Allow-Headers: X-PINGOTHER, Content-Type
Access-Control-Max-Age: 86400
Vary: Origin

POST /doc HTTP/1.1
Host: bar.other
X-PINGOTHER: pingpong
Content-Type: text/xml; charset=UTF-8
Origin: https://foo.example

HTTP/1.1 200 OK
Access-Control-Allow-Origin: https://foo.example
Content-Type: text/plain
```

If the server specifies a single origin rather than the `"*"` wildcard, then the server should also **include Origin in the `Vary` response header** — to indicate clients that server responses will differ based on the value of the Origin request header. (It determines how to match future request headers to decide whether a cached response can be used. `Vary: *` means each request is supposed to be treated as a unique and uncacheable one). The `Origin` is a URI indicating the server from which the request initiated. It does not include any path information, but only the server name. **In any access control request, the `Origin` header is always sent**.

### Requests with credentials
By default, in cross-site XMLHttpRequest or Fetch invocations, **browsers will not send credentials**. A specific flag has to be set on the XMLHttpRequest object or the `Request` constructor when it is invoked. When responding to a credentialed request, the server must specify an origin in the value of the `Access-Control-Allow-Origin` header, instead of specifying the `"*"` wildcard. 

- The server must respond with the `Access-Control-Allow-Credentials: true` header to allow Cookies to be included on cross-origin requests. The browser will **reject** any response that does not have the `Access-Control-Allow-Credentials: true` header, and not make the response available.
- The client must set the `XMLHttpRequest.withCredentials` flag to true in order to make the invocation with Cookies.

```
GET /resources/credentialed-content/ HTTP/1.1
Host: bar.other
Referer: http://foo.example/examples/credential.html
Origin: http://foo.example
Cookie: pageAccess=2

HTTP/1.1 200 OK
Access-Control-Allow-Origin: https://foo.example
Access-Control-Allow-Credentials: true
Set-Cookie: pageAccess=3; expires=Wed, 31-Dec-2008 01:34:53 GMT
Vary: Accept-Encoding, Origin
```
