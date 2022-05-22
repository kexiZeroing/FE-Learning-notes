## Node.js and Nginx/Apache
Developers started simply using the app as an HTTP server. You can serve your node.js application without using any other web servers. Other web development frameworks in Go, Java and Swift also do this. When you serve a node.js app, note that you are the author of your own web server. Any potential bug in your app is a directly exploitable bug on the internet. Some people are not comfortable with this. Adding a layer of Apache or Nginx in front of your app (proxies the requests to a node.js server) means that you have a battle-tested, security-hardened piece of software on the live internet as an interface to your app.

### CGI history
Back at the dawn of the World Wide Web, web servers provided pages containing pre-written HTML code. Web content used to be static and the available webpage was passed from the web server to the browser. **CGI (Common Gateway Interface)** extends what a web server can do beyond just reading static files. It is used as an interface between the web server and the additionally installed applications generating dynamic web content. These applications are called CGI scripts and are written in different programming languages such as PHP, Perl, Python, etc.

If CGI is installed on the server, the specific `cgi-bin` directory is also added and CGI scripts are stored in this directory. Each file in the directory is treated as an executable program (**If the requested file is within a certain directory `cgi-bin`, then that file is a program**). For example, when the CGI script `abc.com/cgi-bin/file.pl` is accessed, the server will run the appropriate Perl application through CGI. The data generated from script execution will be sent by the application to the web server. The server, on the other hand, will transfer data to the browser. If the server did not have CGI, the browser would have displayed the `.pl` file code itself. The server can be configured to recognize not only CGI scripts in the `cgi-bin` directory, but also a specific file extension. For example, all files with a `.php` extension can be treated as CGI scripts.

**FastCGI** is an improved CGI version as the main functionality remains the same. What makes a difference from CGI is that with FastCGI the running process of the application lasts longer and it is not immediately terminated. After the application finishes processing and returns the output data, the process is not terminated and is being used for processing further requests. This results in reduced server load and less page loading time.
 
PHP is the first programing language built for the web. It's original goals are processing web forms and generating web pages (html file is a valid php program). It can be built into web servers like Apache and you can use it to generate your pages dynamically (LAMP stack). You would probably use it in situations you would have otherwise used a CGI script. By using PHP as a module on the server (`mod_php`), the PHP interpreter is in the web server code. The PHP process is part of the web server process.

## Nginx as a reverse proxy
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

```nginx.conf
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

### Nginx command line
> NGINX has only a few command-line parameters. Unlike many other software systems, the configuration is done entirely via the configuration file (`/usr/local/etc/nginx/nginx.conf`).

|  |  |
|  ---  | --- |
| nginx             | start NGINX (`brew install nginx`)
| nginx -s stop     | quick shutdown
| nginx -s quit     | graceful shutdown
| nginx -s reload   | reloade the configuration file
| nginx -c filename | specify a configuration file which is not default
| nginx -t          | don’t run, just test the configuration file 
| nginx -v          | print version
| nginx -V          | print NGINX version, compiler version and configure parameters
