## Fetch API
Fetch method allows you to make network requests similar to `XMLHttpRequest`. The main difference is that the Fetch API uses `Promise`, which enables a simpler and cleaner API, avoiding callback hell and having to remember the complex API of XHR. 

The `fetch()` method takes one mandatory argument, the path to the resource you want to fetch. It returns a `Promise` containing the response (see `Response`). You can also optionally pass in an init options object as the second argument (see `Request`). Once a `Response` is retrieved, there are a number of methods available to define what the body content is and how it should be handled (see `Body`).

- The `Promise` returned from `fetch()` **won’t reject on HTTP error status even if the response is an HTTP 404 or 500**. Instead, it will resolve normally and only reject on network failure or if anything prevented the request from completing. So a `then()` handler must check the `Response.ok` and/or `Response.status` properties.
- `fetch()` won’t send cookies, unless you set the credentials in init option. To cause browsers to send credentials in a cross-origin call, add `credentials: 'include'`.
- CORS mode is enabled by default in `fetch()`.

### init option
- **method**: e.g., GET, POST. Note that the `Origin` header is not set on Fetch requests with a method of HEAD or GET. (GET is default)
- **headers**: Any headers you want to add to your request, contained within a `Headers` object or an object literal.
- **body**: Any body that you want to add to your request. Note that a request using the GET or HEAD method cannot have a body.
- **mode**: The mode you want to use for the request, e.g., `cors`, `no-cors`, or `same-origin`. (`cors` is default)
- **credentials**: The request credentials you want to use for the request, e.g., `omit`, `same-origin`, or `include`. To automatically send cookies for the current domain, this option must be provided. (`same-origin` is default)

```javascript
async function postData(url = '', data = {}) {
  const response = await fetch(url, {
    method: 'POST',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data) // body data type must match "Content-Type" header
  });

  return response.json();
}

postData('https://example.com/answer', { answer: 42 })
  .then(data => {
    console.log(data);
  });
```

```javascript
// Checking if the fetch is successful
fetch('flowers.jpg')
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.blob();
  })
  .then(myBlob => {
    myImage.src = URL.createObjectURL(myBlob);
  })
  .catch(error => {
    console.error('There has been a problem with your fetch operation:', error);
  });
```

```javascript
// Uploading a file
const formData = new FormData();
const fileField = document.querySelector('input[type="file"]');

formData.append('username', 'abc123');
formData.append('avatar', fileField.files[0]);

fetch('https://example.com/profile/avatar', {
  method: 'PUT',
  body: formData
})
  .then(response => response.json())
  .then(result => {
    console.log('Success:', result);
  })
  .catch(error => {
    console.error('Error:', error);
  });
```

## Headers
The Headers interface allows you to create your own headers object via the `Headers()` constructor. A Headers object has an associated header list, and you can add to this using methods like `append()`. For security reasons, **some headers can only be controlled by the user agent**. These headers cannot be modified programmatically, like `Accept-Charset`, `Accept-Encoding`, `Access-Control-Request-Headers`, `Access-Control-Request-Method`, `Cookie`, `Date`, `Host`, `Origin`. All of the Headers methods throw a `TypeError` if a header name is used that is not a valid HTTP Header name.

```javascript
const content = 'Hello World';

// add a new header using append()
const myHeaders = new Headers();
myHeaders.append('Content-Type', 'text/plain');
myHeaders.append('Content-Length', content.length.toString());
myHeaders.append('X-Custom-Header', 'ProcessThisImmediately');

// passing an object literal to the constructor
const myHeaders = new Headers({
  'Content-Type': 'text/plain',
  'Content-Length': content.length.toString(),
  'X-Custom-Header': 'ProcessThisImmediately'
});

console.log(myHeaders.has('Content-Type')); // true
console.log(myHeaders.has('Set-Cookie'));   // false

myHeaders.append('X-Custom-Header', 'AnotherValue');
console.log(myHeaders.get('X-Custom-Header')); // ['ProcessThisImmediately', 'AnotherValue']

myHeaders.delete('X-Custom-Header');
console.log(myHeaders.get('X-Custom-Header')); // null
```

## Request
```javascript
const myHeaders = new Headers();
myHeaders.append('Content-Type', 'image/jpeg');

const myInit = { 
    method: 'GET',
    headers: myHeaders,
    mode: 'cors'
};
const myRequest = new Request('flowers.jpg', myInit);

fetch(myRequest).then(function(response) {});
```

## Response
You can create a new Response object using the `Response()` constructor, but you are more likely to encounter a Response object being returned as the result of another API.

- **Response.headers**: The Headers object associated with the response.
- **Response.ok**: A boolean indicating whether the response was successful (status in the range 200–299) or not.
- **Response.status**: The status code of the response.
- **Response.statusText**: The status message corresponding to the status code. (e.g., OK for 200).
- **Response.url**: The URL of the response. It will be the final URL obtained after any redirects.

The `Body` mixin of the Fetch API represents the body of the response/request, allowing you to declare what its content type is and how it should be handled. Since `Response` implements `Body`, some methods available to it: `Body.json()`, `Body.blob()`, `Body.arrayBuffer()`, `Body.formData()`, `Body.text()`.

> **Mixin** is a generic object-oriented programming term: a class that contains methods for use by other classes without having to be the parent class of those other classes. For instance, we have a class `User` and a class `EventEmitter` that implements event generation, and we’d like to add the functionality of `EventEmitter` to `User`. Mixin can help here. **A mixin provides methods with certain behavior, but we do not use it alone, we use it to add that behavior to other classes**. (JavaScript does not support multiple inheritance, but mixins can be implemented by copying methods into prototype). 

## Blob object and URL
Blob stands for "Binary Large Object", which is a **file-like object of immutable, raw data**. Blobs can represent data that isn't necessarily in a JavaScript-native format. The `File` interface is based on Blob.

The `Blob(array, options)` constructor returns a new Blob object. The content of the blob consists of the concatenation of the values given in the parameter array. The MIME type of the data that will be stored into the blob is in the second optional object.

**Blob URLs** are generated by the browser and are internal references. Given a blob, you can generate a URL to it using the `URL.createObjectURL()` function. **The new object URL represents the specified `File` object or `Blob` object**. Having converted the data into an object URL, it can be **used as the value of the `<img>` element's src attribute**, for example. A Blob URL starts with the `blob://` scheme. It does not refer to data that exists on the server, it refers to data that your browser currently has in memory for the current page. It will not be available on other pages or in other browsers. Once you generate a blob URL, you can remove it calling the `URL.revokeObjectURL()` and passing that URL.

```javascript
// new URL(url [, base])
const url = new URL('/cats?id=1#abc', 'http://www.example.com');
console.log(url.href);      // "http://www.example.com/cats?id=1#abc"
console.log(url.hostname);  // "www.example.com"
console.log(url.pathname);  // "/cats"
console.log(url.protocol);  // "http:"
console.log(url.hash);      // "#abc"
console.log(url.search);    // "?id=1"
console.log(url.searchParams.get('id'));  // "1"

// blob url as the image source
const input = document.querySelector('input');

input.addEventListener('change', e => {
  const img = document.createElement('img');
  const imageBlob = URL.createObjectURL(input.files[0]);
  img.src = imageBlob;

  img.onload = function() {
    URL.revokeObjectURL(imageBlob);
  }

  input.parentNode.replaceChild(img, input);
});

// creates a typed array containing the ASCII codes and converts it to an object URL
// `TypedArray` object is an array-like view of an underlying binary data buffer
// `Uint8Array`: each item is 1 byte (8-bit unsigned integers) 
const bytes = new Uint8Array(59);  
for(let i = 0; i < 59; i++) {
  bytes[i] = 32 + i;
}

// The computer doesn't know what type a specific address in memory is, that knowledge is baked into the instructions of your program.
// `text` means characters of readable material but not its graphical representation nor other objects like floating-point numbers, images, etc. 
const url = URL.createObjectURL(new Blob([bytes.buffer], {type: 'text/plain'}));

const link = document.createElement('a');
link.href = url;
link.innerText = 'Open the array URL';
document.body.appendChild(link);
```
