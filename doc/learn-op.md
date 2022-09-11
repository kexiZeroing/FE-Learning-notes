## A crash course on Docker
Docker offers a way to package and run your code so that it is portable: that is, so that you can run that code just about anywhere—your own computer, a QA server, a production server—and be confident that it will always run exactly the same way.

With Docker, you package your software into a Docker image, which is a self-contained snapshot that includes a file system with your code and your code’s dependencies, and you run that image as a container by using the Docker engine, which virtualizes the user space (processes, memory, mount points, and networking) of your operating system, isolating your code from the host machine and any other containers, and ensuring your code will run the same way in all environments. Since all the containers running on a single server share that server’s OS kernel and hardware, containers can boot up in milliseconds and have little CPU or memory overhead.

> Before Docker came along, it was common to use virtual machines (VMs) to package and run code. One drawback with VMs is that virtualizing all the hardware and running a totally separate OS for each VM image incurs a lot of overhead in terms of CPU usage, memory usage, and startup time.

Once you have Docker installed, you should have the docker command available on your command line. You can run Docker images locally using the `docker run` command. For example, you can run a Bash shell in an Ubuntu 20.04 Docker image by running `docker run -it ubuntu:20.04 bash`. Here `-it` is short for `--interactive` + `--tty`, and it means you will have bash session inside the container. If you omit the flag, the container still executes bash but exits immediately.

First, Docker searches your local file system for the `ubuntu:20.04` image. If you don’t have that image downloaded already, Docker downloads it automatically from Docker Hub, which is a Docker Registry that contains shared Docker images. (It’s also possible to create private Docker images which only certain authenticated users can use.) Once the image is downloaded, Docker runs the image, executing the bash command, which starts an interactive Bash prompt, where you can type. You might notice that’s not your file system. That’s because Docker images run in containers that are isolated at the userspace level. Any data in other containers, or on the underlying host operating system, is not accessible to you.

Next, exit the container by hitting `Cmd-D` on macOS, and you should be back in your original command prompt on your underlying host OS. If you try to look for the file you just wrote in the container, you’ll see that it doesn’t exist: the container’s file system is totally isolated from your host OS.

If you try running the same Docker image again, since the image is already downloaded, the container starts almost instantly. You may also notice that the second time you fired up the container, you’re in a totally new container; any data you wrote in the previous one is no longer accessible to you.

Back on your host OS and run the `docker ps -a` command. This will show you all the containers on your system, including the stopped ones (the ones you exited). You can start a stopped container again by using the `docker start <ID>` command.

Note that every time you run `docker run` and exit, you are leaving behind containers, which take up disk space. You may wish to clean them up with the `docker rm <CONTAINER_ID>` command. Alternatively, you could include the `--rm` flag in your `docker run` command to have Docker automatically clean up when you exit the container.

Docker containers are isolated from the host operating system and other containers, not only at the file system level, but also in terms of networking. So while the container really is listening on port 5000, that is only on a port inside the container, which isn’t accessible on the host OS. If you want to expose a port from the container on the host OS, you have to do it via the `-p` flag. `docker run -p 5000:5000 webapp` tells Docker to expose port 5000 inside the container on port 5000 of the host OS.

You can create your own Docker image, a `Dockerfile` is a text file that consists of a series of commands in capital letters that instruct Docker how to build a Docker image.

```dockerfile
FROM python:3
WORKDIR /usr/src/app
COPY index.html .
CMD ["python", "-m", "http.server", "8000"]
```

- `FROM`: This specifies the base image. One convenient thing about Docker is that you can build on top of officially-maintained images that have the dependencies you need already installed.
- `WORKDIR`: This specifies the working directory for any subsequent commands. If the directory doesn’t already exist, Docker will create it.
- `COPY`: This copies files from the host OS into the Docker image.
- `CMD`: This specifies the default command to execute in the image when someone does `docker run`.

To build a Docker image from your `Dockerfile`, run the `docker build` command. Add the `-t` flag to specify the tag—effectively a name—to use for this image. After the image finishes building, you should be able to see it, along with all other images on your computer, by running the `docker images` command. To make this image accessible to others, you could use the `docker push` command to push it to a Docker Registry (note that this will require authentication).

## A crash course on Kubernetes
Kubernetes is an orchestration tool, which means it’s a tool for running and managing applications across a fleet of servers. More specifically, it is designed to deploy and manage applications packaged as containers. You give Kubernetes a fleet of servers to manage and in return, it gives you all the following functionality, out-of-the-box:

- Scheduling: pick the optimal servers to run your containers.
- Deployment: roll out changes to your containers without downtime.
- Auto healing: automatically redeploy containers that failed.
- Auto scaling: scale the number of containers up and down with load.
- Networking: routing, load balancing, & service discovery for containers.
- Configuration: configure data and secrets for containers.
- Data storage: manage and mount data volumes in containers.

Under the hood, Kubernetes consists of two main pieces: a control plane and worker nodes.

- The control plane is responsible for managing the Kubernetes cluster. It is the “brains” of the operation, responsible for storing the state of the cluster, monitoring containers, and coordinating actions across the cluster. It also runs the API server, which provides an API you can use from command line tools (e.g., kubectl), web UIs (e.g., the Kubernetes Dashboard), and infrastructure as code tools (e.g., Terraform) to control what’s happening in the cluster.
- The worker nodes are the servers used to actually run your containers. The worker nodes are entirely managed by the control plane, which tells each worker node what containers it should run.

Kubernetes is open source, and one of its strengths is that you can run it anywhere: in any public cloud, in your own data center, and even on your own developer workstation. Let’s start small, and run it locally. This is easy to do if you installed a recent version of Docker Desktop, as it has the ability to fire up a Kubernetes cluster locally with just a few clicks.

`kubectl` is the command-line tool for interacting with Kubernetes. To use `kubectl`, you must first update its configuration file, which lives in `$HOME/.kube/config`, to tell it what Kubernetes cluster to connect to. Conveniently, when you enable Kubernetes in Docker Desktop, it updates this config file for you, adding a `docker-desktop` entry to it, so all you need to do is tell `kubectl` to use this configuration: `kubectl config use-context docker-desktop`. Now you can check if your Kubernetes cluster is working with the `kubectl get nodes` command, and it shows you information about all the worker nodes in your cluster. Since you’re running Kubernetes locally, your computer is the only node, and it’s running both the control plane and acting as a worker node.

To deploy something in Kubernetes, you create Kubernetes objects, which are persistent entities you write to the Kubernetes cluster that record your intent: e.g., your intent to have specific Docker images running. There are many different types of Kubernetes objects available. Now let’s use the following two objects:

- Kubernetes Deployment: A Kubernetes Deployment is a declarative way to manage an application in Kubernetes. You declare what Docker images to run, how many copies of them to run (called replicas), a variety of settings for those images (e.g., CPU, memory, port numbers, environment variables), and the strategy to roll out updates to those images, and the Kubernetes Deployment will then work to ensure that the requirements you declared are always met.
- Kubernetes Service: A Kubernetes Service is a way to expose a web app running in Kubernetes as a networked service.

You can create a Deployment using the following command:

```sh
kubectl create deployment simple-webapp \
  --image webapp \
  --replicas=2 \
  --port=5000
```

This command configures the Deployment as follows:
1. Name: `simple-webapp`.
2. Docker image: run the webapp Docker image from Docker Hub, which contains a simple web app that listens on port 5000.
3. Replicas: run two replicas of the webapp image.
4. Ports: listen on port 5000.

Next, create a Service using the command `kubectl create service loadbalancer simple-webapp --tcp=80:5000`

This command configures the Service as follows:
1. Name: `simple-webapp`
2. Type: Load Balancer. This tells Kubernetes to deploy a load balancer to route traffic across your replicas. The exact type of load balancer depends on what sort of Kubernetes cluster you run.
3. Ports: map port 80 in the cluster (on your host OS) to port 5000 in the Docker container.

Give the app a few seconds to boot and then type `curl http://localhost` to test it out. The result is identical to the output of the `docker run` command, so what’s the point of the more complicated `kubectl` commands? Well, let’s look under the hood to see the differences. You can use `kubectl` to explore your cluster. 

First, run `kubectl get deployments` command. You can see your Kubernetes Deployment, named `simple-webapp`, reporting that 2/2 Pods are ready. In Kubernetes, instead of deploying one container at a time, you deploy Pods, which are groups of containers that are meant to be deployed together. To get more info on your Pods, run `kubectl get pods` command. So that’s one difference from `docker run` already: there are multiple containers running here, not just one. Moreover, those containers are being actively monitored and managed. For example, if one crashed, a replacement will be deployed automatically. You can see this in action by running the `docker ps` command, then grab the `CONTAINER ID` of one of those containers and use the `docker kill` command to shut it down. If you run `docker ps` again very quickly, you’ll see just one container left running. But just a few seconds later, the Kubernetes Deployment will have detected that there is only one replica instead of the requested two, and it’ll launch a replacement container automatically. So Kubernetes is ensuring that you always have the expected number of replicas running. Moreover, it is also running a load balancer to distribute traffic across those replicas, which you can see by running the `kubectl get services` command.

Using `kubectl` commands is convenient for learning and testing, but it’s not a great way to manage applications in production. A better option is to manage all of your infrastructure as code. For now, you can improve the situation a little bit by storing the configuration of your Kubernetes objects in YAML files. First, clean up the Service and Deployment from before: `kubectl delete service simple-webapp` and `kubectl delete deployment simple-webapp`. Next, create a file called `deployment.yml`, which configures the exact same Deployment you created earlier with the `kubectl create deployment` command.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: simple-webapp
spec:
  replicas: 2
  template:
    metadata:
      labels:
        app: simple-webapp
    spec:
      containers:
      - name: simple-webapp
        image: webapp
        ports:
        - containerPort: 5000
  selector:
    matchLabels:
      app: simple-webapp
```

Then create a `service.yml` file to configure the same Service as you created earlier with the `kubectl create service` command.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: simple-webapp
spec:
  type: LoadBalancer
  ports:
    - protocol: TCP
      port: 80
      targetPort: 5000
  selector:
    app: simple-webapp
```

Deploy these two YAML files using the `kubectl apply` command, then give the app a few seconds and test the endpoint `curl http://localhost` again. And there you go! Now, all the information about your Kubernetes objects is stored in files that you can check into version control.

更多 k8s 教程: https://github.com/guangzhengli/k8s-tutorials

## 前端相关的部署

### 最基本的 Node 服务
```js
const http = require('node:http')
const server = http.createServer((req, res) => res.end('hello, world'))
server.listen(3000, () => {
  console.log('Listening 3000')
})
```

> Node.js supports a `node:` protocol for built-in modules (`'fs/promises'` -> `'node:fs/promises'`). It’s immediately clear that a built-in Node.js module is imported and there is no risk of a module in `node_modules` overriding the built-in module.

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
使用 CI/CD 对部署进行自动化，即每当将前端代码更新到仓库后，自动拉取仓库代码并部署到服务器。`runner` 表示用来执行 CI/CD 的服务器，`job` 代表任务，比如构建、测试、部署等，每个 `workflow`/`pipeline` 由多个 `job` 组成，每个 `job` 由多个 `step` 组成。

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

使用 GitHub Actions 可以实现自动部署，如果需要 secret 等敏感数据，可以在项目仓库 `Settings -> Secrets` 里面设置。比如下面使用 vuepress 创建的博客部署阿里云 OSS 的配置：

```yaml
name: deploy to aliyun oss

on: [push]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      # 省略下面这些步骤: checkout, setup Node, npm install and build
    
      - name: setup aliyun oss
        uses: actions/setup-aliyun-oss@v1
        with:
          endpoint: oss-cn-beijing.aliyuncs.com
          access-key-id: ${{ secrets.OSS_KEY_ID }}
          access-key-secret: ${{ secrets.OSS_KEY_SECRET }}
      - name: cp files to aliyun
        run: ossutil cp -rf .vuepress/dist oss://xxx
```

GitHub Actions 还可以作为跑定时任务的脚本服务器，比如实现各种社交平台的自动签到。

### 搭建博客
如果你只想搭建一个博客，那么你不需要一个服务器就能完成搭建工作。相对而言使用一个静态网站托管服务，复杂度与工作量就会少了很多，毕竟它部署时只需要维护若干静态文件。

当使用 SSG (hugo, hexo, vuepress, gatsby...) 在本地搭建好一个博客后，需要部署在互联网提供服务，可以使用很多免费的托管平台，其中 Netlify 与 Vercel 都是国外优秀的网站托管平台，全球各地均有 CDN 节点，并支持与 GitHub 协作进行自动部署。如果域名有备案，可以考虑使用阿里云 OSS 托管。使用阿里云的 OSS (object storage service，对象存储服务) 主要是因为国内的网络问题，并且可以结合阿里云的 CDN 使用，按量收费。*注意为带有 hash 的静态资源文件在源站（比如 Netlify）配置永久缓存，能在阿里云上为 CDN 与 https 节省流量费。*

如果你想使用自己的域名，可以在域名提供商 godaddy 或者阿里云注册一个，并且在域名提供商处配置 CNAME，比如 `yourdomain.com -> xxx.netlify.com`。


## The little guide to CI/CD for frontend developers

### Linting, Formatting, and Unit tests
Linting and formatting are essential to keep your codebase consistent and clean. Each team member should follow the same rules and conventions when it comes to writing code.

- [ESlint](https://eslint.org) for linting, it comes with a set of rules to write proper Javascript, and these rules can be customized to your own team's fit.
- [Prettier](https://prettier.io) for formatting. I set it up in my project and editor in a way that saving a file will format it automatically for me.

You can execute this step as a [pre-commit hook](https://githooks.com) as it will ensure that the code is formatted and readable before it's up for review by your teammates.

Unit tests are fast to run, fast to fail. They should not take an extensive amount of time to run and should reveal errors or bugs in a matter of a few seconds or even a few minutes depending on the scale of your project. In a React project, for example, these tests can cover Components, Reducers / State / Actions, Utility functions.

### Integration and end-to-end testing
While unit tests help to test parts of your project in isolation, integration tests help to test whether an entire set of units work together as expected. They also allow you to test full user flows and all the different paths they can take.

- Navigation: Does clicking on the user setting menu item load the expected view?
- Forms: Fill up the form in all possible ways (valid and invalid, with and without optional fields). Test that the expected error messages are displayed when invalid. Validate that clicking on submit sends the right payload when valid.
- Views depending on external data: Test your list view that's fetching some data with different mocked API responses: does it show the proper empty state if there's no data? Is the filter button enabled if your API returned an error? Does it show a notification if the fetch was successful?

End-to-End tests are the set of tests that are the closest to what the user should experience when using your product. In most frameworks like Selenium or Cypress, an e2e test suite is nothing more than a scripted user flow that the computer will go through. Most of these tests will be executed directly within a browser.

### Automation
The objective for your team should be to automate as much as possible, from running the tests to previewing the deployments, to deploying to production. The only manual step left in your CI/CD pipeline should be the code review.

We know how to run these tests locally but we want to ensure that these tests can be run automatically every time a change occurs on the codebase. I am in favor of running these tests on every pull request. Each change has to be tested before it's merged to the main branch without any exception. As my main tool for automation, I've been using [Github CI, Actions and Workflows](https://docs.github.com/en/actions) for both work-related and personal projects. Example of Github Workflow that runs automated tests on every PR:

```yaml
name: Linting Formatting Unit and Integration Tests

on:
  pull_request:
    branch:
      - 'main' # This ensures these tests are run on pull requests that are open against the branch "main"

jobs:
  validate-code-and-test:
    runs-on: ubuntu-20.04
    strategy:
      matrix:
        node: [12.x] # If your app or package needs to be tested on multiple versions of node, you can specify multiple versions here and your workflow will be run on each one of them
    steps:
      - name: Checkout Commit
        uses: actions/checkout@v2
        with:
          ref: ${{ github.event.pull_request.head.sha }}
      - name: Use Node.js ${{ matrix.node }}
        uses: actions/setup-node@v1
        with:
          node: ${{ matrix.node }}
      - name: Install Dependencies
        run: |
          yarn install --non-interactive
      - name: Run Prettier
        run: |
          yarn format
      - name: Run Lint
        run: |
          yarn lint
      - name: Run Unit and Integration tests
        run: |
          yarn jest
```

Another thing I tend to run on every PR is **preview deployments**. You can get a standalone deployment each PR that is accessible through a unique endpoint. Each deployment is a version of your frontend project with a specific change. This can not only help your team to speed up reviews, but it also lets your design and product team validate some new features easily.

The last thing we want to automate is the release process. You do not want to have to run 20 scripts, manually, in a specific order, to get your application from your main branch to production. For this, I tend to favor having a release branch and the automated scripts run every time the main branch is merged on the release branch. Example of Release Github Workflow:

```yaml
name: Build and Deploy to Production

on:
  push:
    branches:
      - 'production' # Any push on the production branch will trigger this workflow
jobs:
  build-and-deploy:
    runs-on: ubuntu-20.04
    strategy:
      matrix:
        node: [12.x] # If your app or package needs to be built on multiple versions of node, you can specify multiple versions here and your workflow will be run on each one of them
    steps:
      - name: Checkout Commit
        uses: actions/checkout@v2
        with:
          ref: ${{ github.event.pull_request.head.sha }}
      - name: Use Node.js ${{ matrix.node }}
        uses: actions/setup-node@v1
        with:
          node: ${{ matrix.node }}
      - name: Install Dependencies
        run: |
          yarn install --non-interactive
      - name: Build UI
        run: yarn build
        env:
          NODE_ENV: production
      - name: Deploy to production
        run: yarn deploy:production
        env: SOME_TOKEN_TO_DEPLOY=${{ secrets.MY_PRODUCTION_TOKEN }} # Never expose tokens! Github has a very handy secrets feature that can store your tokens securely, and allows them to be used in any workflow.
```
