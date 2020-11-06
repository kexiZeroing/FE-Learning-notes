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

The client is transmitting a DATA frame (stream 5) to the server, while the server is transmitting an interleaved sequence of frames to the client for streams 1 and 3. As a result, there are three parallel streams in flight. All HTTP/2 connections are persistent, and only one connection per origin is required.

- Interleave multiple requests in parallel without blocking on any one
- Interleave multiple responses in parallel without blocking on any one
- Use a single connection to deliver multiple requests and responses in parallel
- Remove unnecessary HTTP/1.x workarounds such as concatenated files, image sprites, and domain sharding

### Stream Prioritization
HTTP/2 standard **allows each stream to have an associated weight and dependency**: Each stream may be assigned an integer weight between 1 and 256; Each stream may be given an explicit dependency on another stream. The combination of stream dependencies and weights allows the client to expresses how it would prefer to receive the responses. In turn, the server can use this information to prioritize stream processing by controlling the allocation of CPU, memory, and other resources, and once the response data is available, allocation of bandwidth to ensure optimal delivery of high-priority responses to the client.

> Not all resources have equal priority when rendering a page in the browser: the HTML document itself is critical to construct the DOM; the CSS is required to construct the CSSOM; both DOM and CSSOM construction can be blocked on JavaScript resources; and remaining resources, such as images, are often fetched with lower priority. 

HTTP/1.x must rely on the use of parallel connections, which enables limited parallelism of up to six requests per origin. As a result, requests are queued on the client until a connection is available, which adds unnecessary network latency. It is eliminated in HTTP/2 because the browser can dispatch all requests the moment they are discovered, and the browser can communicate its stream prioritization preference via stream dependencies and weights, allowing the server to further optimize response delivery.

### Server Push
**HTTP/2 breaks away from the strict request-response semantics and enables one-to-many and server-initiated push workflows** that open up a world of new interaction possibilities both within and outside the browser. 

Why would we need such a mechanism in a browser? A typical web application consists of dozens of resources, all of which are discovered by the client by examining the document provided by the server. As a result, why not eliminate the extra latency and let the server push the associated resources ahead of time? The server already knows which resources the client will require; that’s server push. Each pushed resource is a stream that allows it to be individually multiplexed, prioritized, and processed by the client.

All server push streams are initiated via `PUSH_PROMISE` frames. The delivery order is critical: the client needs to know which resources the server intends to push to avoid creating own and duplicate requests for these resources. The simplest strategy to satisfy this requirement is to send all `PUSH_PROMISE` frames (just contain the HTTP headers) ahead of the parent’s response (DATA frames). Pushed resources can be prioritized by the server and declined by the client.

### Header Compression
Each HTTP transfer carries a set of headers that describe the transferred resource and its properties. In HTTP/1.x, this metadata is always sent as plain text and adds 500–800 bytes of overhead per transfer, and sometimes kilobytes more if HTTP cookies are being used. To reduce this overhead and improve performance, HTTP/2 compresses request and response header metadata using the **HPACK** compression format (header compression algorithm) which uses two techniques:

- It allows the transmitted header fields to be encoded via a static Huffman code, which reduces their individual transfer size.
- It requires that both the client and server maintain and update an indexed list of previously seen header fields, which is then used as a reference to efficiently encode previously transferred values.

The definitions of the request and response header fields in HTTP/2 remain unchanged, with a few minor exceptions: all header field names are lowercase, and **the request line is now split into `:method`, `:scheme`, `:authority`, and `:path` pseudo-header fields**.
