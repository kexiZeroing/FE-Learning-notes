## POST Requests
The HTTP POST method sends data to the server. The type of the body of the request is indicated by the `Content-Type` header. (`Content-Length` header indicates the size of the body)

### sending form data
A POST request is typically sent via an HTML form and results in a change on the server. In this case, the content type is selected by the string in the **`enctype` attribute** of the `form` element.

- **application/x-www-form-urlencoded**: the keys and values are encoded in key-value tuples separated by `'&'`, with a `'='` between the key and the value. Non-alphanumeric characters in both keys and values are percent encoded. (default type)
- **multipart/form-data**: each value is sent as a block of data ("body part"), with a user agent defined delimiter ("boundary") separating each part. The keys are given in the `Content-Disposition` header of each part.
- **text/plain**

Use `multipart/form-data` when your form includes any `<input type="file">` elements. **Characters are NOT encoded**. This is important when the form has a file upload control. You want to send the file binary and this ensures that bitstream is not altered.

- fields are separated by the given boundary string. The browser must choose a boundary that will not appear in any of the fields, so this is why the boundary may vary between requests.
- Every field gets some sub headers before its data: `Content-Disposition: form-data`, the field name, the filename, followed by the data.

<img alt="form data" src="https://cdn.nlark.com/yuque/0/2019/png/398686/1562326053756-4a5e59d2-9f86-4979-b691-c0ec09c3d27d.png" width="700">  

### using cURL
When the POST request is sent via a method other than an HTML form — like via an XMLHttpRequest — the body can take any type. (e,g, `application/json`)

`-d` means transfer payload, `-H` is the header info included in requests, `GET` is the default one, use `-X` to support other HTTP verbs.

```bash
# application/x-www-form-urlencoded
curl -d "param1=value1&param2=value2" -H "Content-Type: application/x-www-form-urlencoded" -X POST http://localhost:3000/data
# in nodeJs, `req.body` is a string, and use `&` to split the string to get parameters 

# application/json
curl -d '{"key1":"value1", "key2":"value2"}' -H "Content-Type: application/json" -X POST http://localhost:3000/data
# in nodeJs, use `JSON.parse(req.body)` to get parameters 
```

Convert `curl` commands into different languages of code: https://curlconverter.com

More options (`open x-man-page://curl`):
- **-I, --head**: Fetch the headers only. When used on an FTP or FILE, displays the file size and last modification time only.
- **-i, --include**: Include the HTTP response headers in the output.
- **-v, --verbose**: Makes curl verbose during the operation. Useful for seeing what's going on under the hood. A line starting with `>` means header data sent by curl, `<` means header data received by curl. Try `curl -vI https://www.baidu.com` as an exmple.

### POST and PUT
The difference between `PUT` and `POST` is that `PUT` is idempotent (**If you PUT an object twice, it has no effect**). `PUT` implies putting a resource - completely replacing whatever is available at the given URL with a different thing. Do it as many times as you like, and the result is the same. You can PUT a resource whether it previously exists, or not. So consider like this: do you name your URL objects you create explicitly, or let the server decide? If you name them then use `PUT`. If you let the server decide then use `POST`.

```
POST /questions HTTP/1.1

POST /questions/<existing_question> HTTP/1.1

PUT /questions/<new_question> HTTP/1.1

PUT /questions/<existing_question> HTTP/1.1

// Wrong! This should result in a 'resource not found' error
POST /questions/<new_question> HTTP/1.1
```

### POST and GET
GET data is appended to the URL as a query string, so there is a hard limit to the amount of data you can transfer. (GET is idempotent.) POST data is included in the body of the HTTP request and isn't visible in the URL. As such, there's no limit to the amount of data you can transfer over POST. As far as security, **POST method is not more secure than GET as it also gets sent unencrypted over network**.

> Should data in an HTTPS request appear as encrypted in Chrome developer tools? The browser is obviously going to know what data it is sending, and the Chrome developer tools wouldn't be very helpful if they just showed the encrypted data. These tools are located in the network stack before the data gets encrypted and sent to the server.

HTTPS encrypts the data in transit and the remote server will decrypt it upon receipt; it protects against any 3rd parties in the middle being able to read or manipulate the data. A packet sniffer will show that the HTTP message sent over SSL is encrypted on the wire. **The domain names are not encrypted** because those are needed in plain text for DNS and TCP to send your data to the correct server.

JSONP doesn't support other methods than GET and also doesn't support custom headers.

> Enter JSONP, use a script tag (the domain limitation is ignored) and pass a special parameter that tells the server a little bit about your page. Then the server is able to wrap up its response in a way that your page can handle. For example, say the server expects a parameter called `callback` to enable its JSONP capabilities. Then your request would look like `/abc?callback=mycallback`. Without JSONP, this might return some basic JavaScript object, like `{ foo: 'bar' }`. However, with JSONP, it wraps up the result a little differently, returning something like `mycallback({ foo: 'bar' })`, and it will invoke the method specified in your page `mycallback = function(data){ }`

### Navigator.sendBeacon()
This method asynchronously sends an HTTP POST request containing a small amount of data to a web server. It's intended to be used for sending analytics data to a web server.

A site often wants to send analytics when the user has finished with a page. In this situation the browser may be about to unload the page, and in that case the browser may choose not to send asynchronous `XMLHttpRequest` requests. And if web pages try to delay page unload long enough to send data, it slows down navigation to the next page.

With `sendBeacon()` method, the data is sent reliably and asynchronously. It doesn't impact the loading of the next page.

```js
document.addEventListener('visibilitychange', function logData() {
  if (document.visibilityState === 'hidden') {
    navigator.sendBeacon('/log', analyticsData);
  }
});
```

## Connection management
Opening and maintaining connections largely impacts the performance of Web sites and Web applications. In HTTP/1.x, there are several models: **short-lived connections, persistent connections, and HTTP pipelining**.

HTTP mostly relies on TCP for its transport protocol, providing a connection between the client and the server. Opening each TCP connection is a resource-consuming operation. Several messages must be exchanged between the client and the server.

### Short-lived connections
The original model of HTTP, and the default one in HTTP/1.0, is short-lived connections. Each HTTP request is completed on its own connection; this means a TCP handshake happens before each HTTP request, and these are serialized.

### Persistent connections
A persistent connection (also called keep-alive connection) remains open for a period of time, and can be reused for several requests, saving the need for a new TCP handshake, and utilizing TCP's performance enhancing capabilities. This connection will not stay open forever: idle connections are closed after some time (a server may use the `Keep-Alive` header to specify a minimum time the connection should be kept open).

Persistent connections also have drawbacks, even when idling they consume server resources, and under heavy load, DoS attacks can be conducted. In HTTP/1.1, persistence is the default, and the connection header is no longer needed.

### HTTP pipelining
By default, HTTP requests are issued sequentially. Pipelining is the process to **send successive requests, over the same persistent connection, without waiting for the answer**. This avoids latency of the connection. Theoretically, performance could be improved if two HTTP requests were to be packed into the same TCP message. **(Pipelining has been superseded by a better algorithm, `multiplexing`, that is used by HTTP/2)**

### Domain sharding
In HTTP/1.x, the browser naively queue all HTTP requests on the client, sending one after another over a single, persistent connection. However, this is too slow. Hence, the browser vendors are left with no other choice than to **open multiple TCP sessions in parallel**. How many? In practice, most modern browsers, both desktop and mobile, open up to six connections per host. (The higher the limit, the higher the client and server overhead, but at the additional benefit of higher request parallelism. Six connections per host is simply a safe middle ground.)

**Domain sharding** is used to load resources from multiple domains/subdomains in an attempt to overcome a browser’s limit on the number of concurrent requests it can make, and therefore improving load performance. Browsers distinguish domains by name rather than by IP address. With modern browsers the limit connections for each domain is 6, we can boost the connections to 18 if we use 3 domains. 

But another limit is that **browsers have a total limit of concurrent connections regardless of the number of different domains used**. And adding multiple domains can, however, introduce performance losses. Web browsers have to perform a DNS lookup on each additional domain and maintain connections to each domain, resulting in slower initial load times. Unless you have a very specific immediate need, **don't use this deprecated technique; switch to HTTP/2 instead**. In HTTP/2, domain sharding is no longer useful and the HTTP/2 connection is able to handle parallel requests very well.

<img alt="h1 waterfall" src="https://z3.ax1x.com/2021/09/26/4yL7lD.png" width="800">

### HTTP and socket
HTTP is an application protocol and used mostly for browsing the internet. HTTP itself can't be used to transport information to/from a remote end point. Instead it relies on an underlying protocol which in HTTP's case is TCP. TCP provides a reliable link between two computers (if packet get lost - it is re-transmitted). TCP itself rides on top of IP, which provides unified addressing to communicate between computers. Basically it means if you are communicating HTTP, you are doing it with TCP/IP underneath.

Sockets are an **API that most operating systems provide** to be able to talk with the network **at the transport layer**. A socket API provided by the OS can be accessed using libraries in all programming languages. Plain sockets are more powerful and generic. They run over TCP/IP but they are not restricted to browsers or HTTP protocol. They could be used to implement any kind of communication, but you need to take care of all the lower-level details of a TCP/IP connection.

WebSocket is another application level protocol over TCP protocol. A webSocket runs over a regular socket, but runs its own connection scheme and framing protocol on top of the regular socket.

## Always set timeouts when making network calls
Modern applications don’t crash; they hang. One of the main reasons for it is the assumption that the network is reliable. It isn’t. You are leaking sockets if your asynchronous network calls don’t return. Client-side timeouts are as crucial as server-side ones. There is a maximum number of sockets your browser can open for a particular host. If you make network requests that never returns, you are going to exhaust the socket pool. When the pool is exhausted, you are no longer able to connect to the host. So **never use “infinity” as a default timeout**.

Javascript’s XMLHttpRequest is the web API to retrieve data from a server asynchronously. Its default timeout is zero, which means there is no timeout.

```js
const xhr = new XMLHttpRequest();
xhr.open('GET', '/api', true);

// No timeout by default!
xhr.timeout = 10000; 

xhr.onload = function () {
 // Request finished
};

xhr.ontimeout = function (e) {
 // Request timed out
};

xhr.send(null);
```

The fetch web API is a modern replacement for the XMLHttpRequest API, which uses Promises. When the API was initially introduced, there was no way to set a timeout at all. Browsers have recently added experimental support for the `Abort API` to support timeouts.

```js
const controller = new AbortController();

const signal = controller.signal;

const fetchPromise = fetch(url, {signal});  

// No timeout by default!
setTimeout(() => controller.abort(), 10000); 

fetchPromise.then(response => {
 // Request finished
})
```

Things aren’t much rosier in Python. The requests library uses a default timeout of infinity. Go’s HTTP package doesn’t use timeouts by default either. Modern HTTP clients for Java and .NET do a much better job and usually, come with default timeouts. That comes as no surprise since those languages are used to build large scale distributed systems that need to be robust against network failures. As a rule of thumb, always set timeouts when making network calls. And if you build libraries, always set reasonable default timeouts and make them configurable for your clients.

In addition, `addEventListener` accepts an AbortSignal as of Chrome 88. It can be used as an alternate of `removeEventListener`. The listener will be removed when the given AbortSignal object's `abort()` method is called.

```js
const controller = new AbortController();
window.addEventListener("click", () => alert("window"), { signal: controller.signal });
document.addEventListener("click", () => alert("document"), { signal: controller.signal });

// remove listeners
controller.abort();
```

> `addEventListener(type, listener, options)`: options is an object that specifies characteristics about the event listene. The available options are: `capture`, `once`, `passive`, `signal`.
