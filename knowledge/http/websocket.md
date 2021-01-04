## WebSocket
The web is built around the idea that a client’s job is to request data from a server, and a server’s job is to fulfill those requests. Traditional HTTP model is of **client initiated transactions**. To overcome this, many different strategies were devised to allow servers to push data to the client. **Regular polling** periodically sends a request to the server like asking “Hey do you have any new information for me?” **Long polling** is similar, but after a request to the server, the connection hangs and the server will only close the connection with a response once there’s new information.

WebSocket provides a persistent, full-duplex connection between a client and server that **both parties can start sending data at any time**. The client establishes a WebSocket connection through a process known as the **WebSocket handshake**. This process starts with the client sending a regular HTTP request to the server. An `Upgrade` header is included in this request that informs the server that the client wishes to establish a WebSocket connection. Note that WebSocket URLs use the `ws` scheme (`wss` for secure WebSocket connections). If the server supports the WebSocket protocol, it sends the **HTTP 101 Switching Protocols** response code and includes an `Upgrade` header in the response to indicate the protocol it switched to as requested by a client. Now the handshake is complete, and the initial HTTP connection is replaced by a WebSocket connection that uses the same underlying TCP connection. 

```
// General
Request URL: wss://chatroom-react-socketio.herokuapp.com/
Request Method: GET
Status Code: 101 Switching Protocols

// Response Headers
Connection: Upgrade
Upgrade: websocket

// Request Headers
Connection: Upgrade
Host: chatroom-react-socketio.herokuapp.com
Upgrade: websocket
```

### WebSocket clients
The WebSocket API is purely **event driven**.
- Call WebSocket constructor and pass in the URL of your server to create a WebSocket connection. Once the connection has been established, the `open` event will be fired on the WebSocket instance.
- You can handle any errors that occur by listening the `error` event.
- To send a message, call `send` method on your WebSocket instance, passing in the data you want to transfer.
- When a message is received, the `message` event is fired. This event includes a property called `data` that can be used to access the contents of the message.
- Once you’re done with the WebSocket you can terminate your connection using the `close` method.
- After the connection has been closed, the browser will fire a `close` event that allows you to perform any clean up you might need to do.

```js
// Create a new WebSocket.
let socket = new WebSocket('wss://echo.websocket.org');

// Handle any errors that occur.
socket.onerror = function(error) {
  console.log('WebSocket Error: ' + error);
};

// Show a connected message when the WebSocket is opened.
socket.onopen = function(event) {
  socketStatus.innerHTML = 'Connected to: ' + event.currentTarget.url;
};

// Handle messages sent by the server.
socket.onmessage = function(event) {
  const message = event.data;
  messagesList.innerHTML += '<li class="received"><span>Received:</span>' + message + '</li>';
};

// Send a message when the form is submitted.
form.onsubmit = function() {
  const message = messageField.value;
  socket.send(message);

  messagesList.innerHTML += '<li class="sent"><span>Sent:</span>' + message + '</li>';
  messageField.value = '';
  return false;
};

// Show a disconnected message when the WebSocket is closed.
socket.onclose = function(event) {
  socketStatus.innerHTML = 'Disconnected from WebSocket.';
};

// Close the WebSocket connection when the close button is clicked.
closeBtn.onclick = function() {
  socket.close();
  return false;
};
```

The `WebSocket.readyState` read-only property returns the current state of the WebSocket connection.
- `CONNECTING (0)`: Socket has been created. The connection is not yet open.
- `OPEN (1)`: The connection is open and ready to communicate.
- `CLOSING (2)`: The connection is in the process of closing.
- `CLOSED (3)`:	The connection is closed or couldn't be opened.

### WebSocket servers
So far we have mainly focused on how to use WebSockets from a client-side perspective. If you’re looking to build your WebSocket server, there are plenty of libraries that can help you out.

```js
// A simple Node.js WebSocket server using the `ws` module
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', function connection(ws) {
  ws.on('message', function(msg) { 
    console.log(`Received message ${msg}`);
  });

  ws.send('something');
});

// broadcast to all connected WebSocket clients
wss.on('connection', function connection(ws) {
  ws.on('message', function(data) {
    wss.clients.forEach(function(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  });
});
```

**Socket.IO** is a library that enables real-time, bidirectional and event-based communication between the browser and the server. It consists of a Node.js server and a Javascript client library for the browser, allowing the server and client to emit arbitrary events with arbitrary data.

**The client will try to establish a WebSocket connection if possible, and will fall back on HTTP long polling if not**. So in the best-case scenario, you can consider the Socket.IO client as a "slight" wrapper around the WebSocket API.

```js
// handle the event sent with socket.send()
socket.on('message', data => { });

// handle the event sent with socket.emit()
socket.on('greetings', (elem1, elem2, elem3) => { });
```

Socket.IO is not a WebSocket implementation. Although Socket.IO indeed uses WebSocket as a transport when possible, it adds additional metadata to each packet. That is why a WebSocket client will not be able to successfully connect to a Socket.IO server, and a Socket.IO client will not be able to connect to a plain WebSocket server either.
