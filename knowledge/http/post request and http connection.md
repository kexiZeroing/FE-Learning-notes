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

But another limit is that **browsers have a total limit of concurrent connections regardless of the number of different domains used**. And adding multiple domains can, however, introduce performance losses. Web browsers have to perform a DNS lookup on each additional domain and maintain connections to each domain, resulting in slower initial load times.

**Unless you have a very specific immediate need, don't use this deprecated technique; switch to HTTP/2 instead. In HTTP/2, domain sharding is no longer useful: the HTTP/2 connection is able to handle parallel requests very well.**
