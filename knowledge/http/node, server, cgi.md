## Node.js, Nginx/Apache, CGI
A node.js web application is a full-fledged web server just like Nginx or Apache. You can serve your node.js application without using any other web servers. Other web development frameworks in Go, Java and Swift also do this.

In the beginning was the CGI. CGI was fine and worked OK. Apache would get a request, find that the url needs to execute a CGI app, pass data as environment variables, and serve the data back to the browser. 

> The **common gateway interface (CGI)** is a standard way for data to be passed from the user's request to the application program and back to the user. For example, you might code `<form method="POST" action="http://www.abc.com/cgi-bin/formprog.pl">` and the server at "abc.com" would pass control to the CGI application called "formprog.pl" to record the entered data and return a confirmation message. (The ".pl" indicates a program written in PERL but other languages could also have been used, e.g. C, Java, PHP.) It's a basic way for information to be passed from the web server about your request to the application program and back again no matter which operating system the server uses.

The problem is that it is slow. It's OK when the CGI app was a small statically compiled C program but a group of small statically compiled C programs became hard to maintain. People started developing object oriented MVC frameworks. Now we started having trouble - every request must compile all those classes and create all those objects just to serve some HTML, even if there's nothing dynamic to serve (because the framework needs to figure out that there's nothing dynamic to serve).

There are several strategies trying to solve that problem. One of the earliest was to embed interpreters directly in web servers like `mod_php` in Apache. (`mod_php` means PHP as an Apache module. It allows Apache to interpret PHP files.) Compiled classes and objects can be stored in global variables and therefore cached. Another strategy was web servers using the **FastCGI protocol** to communicate with external applications. (FastCGI means the running process of the application lasts longer and it is not immediately terminated. After the application finishes processing and returns the data, the process is not terminated and is being used for processing further requests.)

Then some developers started simply using the app as an HTTP server. The advantage of this is that you don't need to implement any new protocol and you can debug your app directly using a web browser or a curl. And you don't need a modified web server to support your app, just any web server that can do reverse proxying or redirects.

When you serve a node.js app, note that you are the author of your own web server. Any potential bug in your app is a directly exploitable bug on the internet. Some people are not comfortable with this. Adding a layer of Apache or Nginx in front of your app (proxies the requests to a node.js server) means that you have a battle-tested, security-hardened piece of software on the live internet as an interface to your app.

### Nginx as a reverse proxy
Many modern web applications written in Node.js or Angular can run with their own standalone server but they lack a number of advanced features like load balancing, security, and acceleration that most of these applications demands. Nginx with its advanced features can act as a reverse proxy while serving the request for a Node.js application. The servers that Nginx proxies requests to are known as **upstream servers**.

<img alt="nginx" src="https://cdn.nlark.com/yuque/0/2019/png/398686/1563240316222-1163743b-faf9-4ae2-aec1-7523b688bc77.png" width="700" >

Create a `server` block that will act as a reverse proxy. **The `proxy_pass` directive in the configuration makes the server block a reverse proxy**. All traffic destined to the domain `SUBDOMAIN.DOMAIN.TLD` and those matches with `location` block will be forwarded to `http://PRIVATE_IP:3000` where the node.js or angular application is running. When Nginx proxies a request, it automatically makes some adjustments to the request headers it receives from the client. To adjust or set headers, we can use the `proxy_set_header` directive. For example, the "Host" header by default will be set to the value of `$proxy_host`, a variable that will contain the domain name or IP address taken directly from the `proxy_pass` directive. It can also be set to `$host` which is equal to the "Host" in the header of the request.

```nginx
server {  
    listen 80;
    server_name SUBDOMAIN.DOMAIN.TLD;
    location / {  
        proxy_pass http://PRIVATE_IP:3000;  
        proxy_http_version 1.1;  
        proxy_set_header Host $host;  
    }  
}
```

### Nginx Load Balancing
Nginx can also be configured to act as a load balancer that can **handle a large number of incoming connections and distribute them to separate upstream servers for processing** thereby achieving fault tolerance and better performance of deployed applications. To configure Nginx as a load balancer, the first step is to include the `upstream` in the configuration. Once upstream servers have been defined, you just need to refer them in the `location` block by using `proxy_pass` directive. For example, whenever traffic arrives at port 80 for the domain `SUBDOMAIN.DOMAIN.TLD`, Nginx will forward the request to each upstream servers one by one. The default method of choosing an upstream server will be round robin.

- **round robin**: distributes the traffic to upstream servers equally and is the default scheme if you don’t specify. Each upstream server is selected one by one in turn according to the order you place them in the configuration file. 
- **least connected**: assigns the request to the upstream server with the least number of active connections. To configure the least connected load balancing, add `least_conn` directive at the first line within the upstream module.
- **IP hash**: selects an upstream server by generating a hash value based on the client’s IP address as a key. This allows the request from clients to be forwarded to the same upstream server provided it is available and the clients IP address has not changed. Add `ip_hash` directive at the first line within the upstream module.
- **weighted method**: the upstream server with the highest weight is selected most often. This scheme is useful in the situation where the upstream server’s resources are not equal and favors the one with better available resources. Add `weight` directive after the URL parameter in the upstream section.

```nginx
# backend_servers is the upstream module name
upstream backend_servers {
   # may specify load balancing method here
   server 10.0.2.144;
   server 10.0.2.42;
   server 10.0.2.44;
}

server {
    listen 80; 
    server_name SUBDOMAIN.DOMAIN.TLD;
    location / {
        proxy_pass http://backend_servers;
        proxy_set_header Host $host;   
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```
