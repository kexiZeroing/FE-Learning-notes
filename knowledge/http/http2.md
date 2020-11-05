## HTTP/2
The primary goals for HTTP/2 are to reduce latency by enabling **full request and response multiplexing**, minimize protocol overhead via efficient **compression of HTTP header fields**, and **add support for request prioritization and server push**. HTTP/2 does not modify the application semantics of HTTP in any way. All the core concepts such as HTTP methods, status codes, URIs, and header fields remain in place. Instead, HTTP/2 modifies how the data is formatted (framed) and transported between the client and server.

> SPDY (pronounced "speedy") is a deprecated open-specification networking protocol that was developed primarily at Google for transporting web content. SPDY manipulates HTTP traffic, with particular goals of reducing web page load latency and improving web security. SPDY was chosen as the basis for HTTP/2, and the core developers of SPDY have been involved in the development of HTTP/2. **SPDY is acting as an experimental branch that was used to test new features and proposals for the HTTP/2 standard**. In early 2015, Google announced its plans to remove support for SPDY in favor of HTTP/2.

### Binary Framing Layer
At the core of all performance enhancements of HTTP/2 is the new binary framing layer, which dictates how the HTTP messages are encapsulated and transferred between the client and server.

<img alt="http/2" src="https://ftp.bmp.ovh/imgs/2020/11/9e3ad604cf154c53.png" width="700" />

The "layer" refers to a design choice to introduce a new optimized encoding mechanism. Unlike the newline delimited plaintext HTTP/1.x protocol, **all HTTP/2 communication is split into smaller messages and frames, each of which is encoded in binary format**. As a result, both client and server must use the new encoding mechanism to understand each other: an HTTP/1.x client won’t understand an HTTP/2 only server, and vice versa. Thankfully, our applications remain blissfully unaware of all these changes, as the client and server perform all the necessary framing work on our behalf.

The introduction of the new binary framing mechanism changes how the data is exchanged between the client and server. All communication is performed over a single TCP connection that can carry any number of bidirectional streams. Each **stream** has a unique identifier and optional priority information that is used to carry bidirectional messages. Each **message** is a logical HTTP message, such as a request or response, which consists of one or more frames. The **frame** is the smallest unit of communication that carries a specific type of data, e.g., HTTP headers, message payload. **Frames from different streams may be interleaved and then reassembled via the embedded stream identifier in the header of each frame**.

### Request and Response Multiplexing
With HTTP/1.x, if the client wants to make multiple parallel requests, then multiple TCP connections must be used. This behavior is a consequence of the HTTP/1.x delivery model, which ensures that only one response can be delivered at a time per connection. The new binary framing layer in HTTP/2 removes these limitations, and **enables full request and response multiplexing, by allowing the client and server to break down an HTTP message into independent frames, interleave them, and then reassemble them on the other end**.

<img alt="multiplexing" src="https://ftp.bmp.ovh/imgs/2020/11/d058e930aebac04d.png" width="700" />

The client is transmitting a DATA frame (stream 5) to the server, while the server is transmitting an interleaved sequence of frames to the client for streams 1 and 3. As a result, there are three parallel streams in flight.

- Interleave multiple requests in parallel without blocking on any one
- Interleave multiple responses in parallel without blocking on any one
- Use a single connection to deliver multiple requests and responses in parallel
- Remove unnecessary HTTP/1.x workarounds such as concatenated files, image sprites, and domain sharding

