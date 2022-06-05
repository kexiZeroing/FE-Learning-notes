## 前端相关的部署

https://shanyue.tech/op  
https://shanyue.tech/no-vps  

### 最基本的 Node 服务
```js
const http = require('node:http')
const server = http.createServer((req, res) => res.end('hello, world'))
server.listen(3000, () => {
  console.log('Listening 3000')
})
```

自己写代码无论从开发效率还是性能都会比专业工具 nginx 之类的静态资源服务差很多。从开发而言，基本的 rewrite, redirect, cache 都需要重新开发，比如单页应用中所有的 `*.html` 均为读取根目录 `index.html`。静态网站生成器将会有 `.html` 后缀，此时可通过 rewrite 去除后缀，比如将 `/hello` rewrite 到 `/hello.html`。

应用有很多服务，通过 nginx 进行路由转发至不同的服务，这就是反向代理，否则需要通过端口号去访问不同的应用。另外 TLS、GZIP、HTTP2 等诸多功能，也需要使用 nginx 进行配置。

https://surge.sh  
https://github.com/vercel/serve  

### 基于 Docker 部署
使用 Docker 部署用以隔离环境。假设你有三个后端服务，分别用 Java、Go、Node 编写，你需要在服务器分别安装三者的环境，才能运行所有语言编写的代码；假设你有三个 Node 服务，分别用 node10、node12、node14 编写，需要安装三个版本 nodejs 才能运行。而 Docker 可以单独提供某种语言的运行环境，并同时与宿主机隔离起来。

编写 Dockerfile -》 构建镜像 `docker build` -》 运行容器 `docker run`

```Dockerfile
# 选择一个体积小的镜像（内置了 node14/npm/yarn 等运行环境）
FROM node:14-alpine

# 设置为工作目录，以下 RUN/CMD 命令都是在工作目录中进行执行
WORKDIR /code

# 把宿主机的代码添加到镜像中
ADD . /code

# 安装依赖
RUN yarn

EXPOSE 3000

# 启动 Node Server
CMD npm start
```

```sh
# 基于 Dockerfile 构建一个名为 simple-app 的镜像
# -t: "name:tag" 构建镜像名称
$ docker build -t simple-app .

# git rev-parse --short HEAD: 列出当前仓库的 CommitId
# 如果该前端项目使用 git tag 以及 package.json 中的 version 进行版本维护，也可将 version 作为生产环境镜像的 Tag
$ docker build -t simple-app:$(git rev-parse --short HEAD)

# 构建成功后，列出所有的镜像
$ docker images
```

```sh
# 根据该镜像运行容器
# --rm: 当容器停止运行时，自动删除容器
# -p: 3000:3000，将容器中的 3000 端口映射到宿主机的 3000 端口，左侧为宿主机端口，右侧为容器端口
$ docker run --rm -p 3000:3000 simple-app

# 运行成功后可查看所有容器
$ docker ps
```

更高效的方式是使用 docker-compose，将命令行的选项翻译成配置文件。编写 `docker-compose.yaml`，然后执行 `docker-compose up` 代替之前构建及运行容器的命令。

```yaml
version: "3"
services:
  app:
    # build: 从当前路径构建镜像
    build: .
    ports:
      - 3000:3000
```

```sh
# up: 创建并启动容器
# --build: 每次启动容器前构建镜像
$ docker-compose up --build
```

对于仅仅提供静态资源服务的前端，实际上是不必将 nodejs 作为运行环境的。一般选择体积更小，性能更好，基于 nginx 的镜像。通过 `docker images` 查看镜像体积，发现 `node:alpine` 体积是 `nginx:alpine` 的数倍大小。

```Dockerfile
FROM nginx:alpine

ADD index.html /usr/share/nginx/html/

# nginx 镜像会默认将 80 端口暴露出来
```

### 单页应用的部署
部署一个 creact-react-app 单页应用，这里由于需要构建，因此选择 node 运行环境。更进一步，可以使用多阶段构建进行优化，第一步使用 node 镜像对单页应用进行构建并生成静态资源，之后使用 nginx 镜像对单页应用的静态资源进行服务化。执行 `docker-compose up --build simple` 启动容器, 然后访问 http://localhost:4000

```Dockerfile
FROM node:14-alpine

WORKDIR /code

# 对于 ADD 指令来讲，如果添加文件内容的 `checksum` 没有发生变化，则可以利用构建缓存
ADD . /code
RUN yarn && npm run build

CMD npx serve -s build
EXPOSE 3000
```

```yaml
version: "3"
services:
  simple:
    build:
      context: .
      dockerfile: simple.Dockerfile
    ports:
      - 4000:80
```

这里注意单页应用的路由问题，访问 https://localhost:4000/about 会显示 404。这是因为 `/about` 是由前端通过 history API 进行控制的，而在静态资源中并没有 `about` 或者 `about.html` 资源。解决方法也很简单，在服务端将所有页面路由均指向 `index.html`，这可以通过 nginx 配置。

```conf
location / {
  # 避免非 root 路径 404
  try_files  $uri $uri/ /index.html;
}
```

另外，对于构建后的前端静态资源进行缓存优化，nginx 配置的缓存策略：带有 hash 的资源一年长期缓存，非带 hash 的资源配置 `Cache-Control: no-cache`，避免浏览器默认为强缓存。

```conf
location / {
  # 解决单页应用服务端路由的问题
  try_files  $uri $uri/ /index.html;  

  # 非带 hash 的资源，比如 index.html
  expires -1;
}

location /static {
  # 带 hash 的资源，需要配置长期缓存
  expires 1y;
}

# 解决跨域
location /api {
  proxy_pass http://api.foo.com;
}
```

### 持续集成
使用 CI/CD 对部署进行自动化，即每当将前端代码更新到仓库后，自动拉取仓库代码并部署到服务器。`Runner` 表示用来执行 CI/CD 的服务器，`job` 代表任务，比如构建、测试、部署等，每个 `workflow`/`pipeline` 由多个 `job` 组成。

```yaml
# 关于本次 workflow 的名字
name: CI

# 执行 CI 的时机: 当 git push 代码到 github 时
on: [push]

# 执行所有的 jobs
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      # 切出代码，使用该 Action 将可以拉取最新代码
      - uses: actions/checkout@v2

      # 配置 node.js 环境，此时使用的是 node14, 与 Docker 中版本一致
      - name: Setup Node
        uses: actions/setup-node@v1
        with:
          node-version: 14.x

      # 安装依赖
      - name: Install Dependencies
        run: yarn

      # 在 cra 中，使用 npm run build 来模拟 ESLint
      - name: ESLint
        run: npm run build
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node
        uses: actions/setup-node@v1
        with:
          node-version: 14.x
      - name: Install Dependencies
        run: yarn
      - name: Test
        run: npm run test
```

```yaml
name: Production

# 执行 CI 的时机: 当 git push 到 master 分支时
on:
  push:
    branches:    
      - master

# 执行所有的 jobs
jobs:
  deploy:
    # 该 Job 在自建的 Runner 中执行
    runs-on: self-hosted
    environment:
      name: Deploy
      url: 
    steps:
      # 切出代码，使用该 Action 将可以拉取最新代码
      - uses: actions/checkout@v2
      - name: Deploy
        run: docker-compose -f domain.docker-compose.yaml up --build -d domain
```
