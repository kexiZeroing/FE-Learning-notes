## REST versus GraphQL
REST has become the dominant standard for Web API over the years. It uses standard HTTP methods (GET, POST, PUT, DELETE), and every data is treated as a resource to be sent over when a URL is called using web browsers or cURL requests.

GraphQL is usually described as a frontend-directed API technology as it allows front-end developers to request data in a much simpler way than ever before. It was created by Facebook in 2012 and open-sourced in 2015. GraphQL is not dealing with dedicated resources. Instead everything is regarded as a graph and therefore is connected. You can combine different entities in one query and you are able to specific which attributes should be included in the response on every level.

Both REST and GraphQL are used for building API’s. Plus, both of them can be managed over HTTP. REST is primarily an architectural style, comes with no specification, and acquires no definite set of tools. It concentrates more on API’s durability rather than performance optimization. GraphQL, on the other hand, is a query language devised to work over one endpoint, upgrading performance and adaptability.

### Multiple Endpoints
In a standard REST API, we might require to make requests to numerous endpoints, and therefore lead to multiple round trips for getting all the necessary data. Imagine you’d like to request information from a post entity, and at the same time you’d like to request information of the post author. So first to retrieve the post object `/posts/:id` and second to retrieve the user object `/users/:id`.

The GraphQL in comparison offers single endpoint via which we access data available on the server. We get all the necessary data in just a single request `/graphql`. 

```
// query
query PostsAndUser {
  post(id: 1){
    id
    title
    user {
      name
    }
  }
}

// results
"data": {
  "post": {
    "id": 1,
    "title": "sunt aut facere repellat provident",
    "user": {
      "name": "Leanne Graham"
    }
  }
}
```

### Overfetching or Underfetching Data
It is common to fetch more data than you need in REST as each endpoint includes a settled data formation. There are situations where you may need only 2-3 values but you get around 20-25 values as the response. Similarly, with REST it’s comparatively easier to under fetch the dataset, enabling clients to make additional requests to get relevant data.

GraphQL provides a declarative syntax that allows clients to specify which fields they need exactly, so the users can only get what they actually need from the server.

### API Versioning
API versioning is a method followed to avoid breaking the client application with the changes in response format. When there is an change in the API response format a new version is created. This is done so that production client applications can run as expected and giving some time to developers to migrate to the new API version. Maintenance and consuming of API becomes tough.

GraphQL, in comparison, is schema driven and only rebounds the data that’s needed, so extending it won't be a problem as the new field won't affect the existing fields and GraphQL also introduces `@deprecated` annotation to deprecate fields. This eliminates the need for versioning the API.

### Weakly or Strongly Typed
Property are not strongly typed from REST API, and some are not properly given a particular data. This becomes a problem while documenting APIs as we have to specify what kind of data the client can expect by calling the endpoint.

GraphQL is dominated by schema which are strongly typed. These types can either be primitive or derived. The strong typing system allows the API to be self documented, and making the client aware on what response it will get.

### GraphQL Disadvantages
Although GraphQL solves a number of problems, it still has flaws and deficiencies. 

- Error management in REST is quite simple. With HTTP status code, we can quickly know the error as well as the suitable way to resolve it. But with GraphQL, we always receive a `200 OK` status.
- REST is enforced employing HTTP, so it uses native HTTP caching mechanisms. GraphQL, on the other hand, has no caching system, thus leaving the users with the burden of handling caching on their own.
- Authorization problem is also an important concern that we require to pay attention to while working with GraphQL. Consider GraphQL as a domain specific language. It’s merely a single layer that we could place between the data service and our clients. Authorization is completely a separate layer and the language itself will not assist with the usage of verification.

## Code using GraphQL
To make it work, GraphQL needs a server and a client. Have a query selecting fields that you need, and then perform a request to the GraphQL server with the query attached as a query parameter for GET requests or in body for POST requests.

> This year we’ve begun the process of open-sourcing GraphQL by drafting a [specification](https://spec.graphql.org/June2018/), releasing a reference implementation, and forming a community around it at `graphql.org`. Because GraphQL is a communication pattern, there are many tools to help you get started working which support GraphQL in all sorts of languages.

- GraphQL.js (https://github.com/graphql/graphql-js): The reference implementation of the GraphQL specification, designed for running GraphQL in a Node.js environment.

- Apollo Server (https://github.com/apollographql/apollo-server): A set of GraphQL server packages from Apollo that work with various Node.js HTTP frameworks like Express (most popular), Hapi, Koa, etc.

- Express GraphQL (https://github.com/graphql/express-graphql): The reference implementation of a GraphQL API server over an Express webserver. You can use this to run GraphQL in conjunction with a regular Express webserver, or as a standalone GraphQL server.

- Apollo Client (https://github.com/apollographql/apollo-client): It is a fully-featured caching GraphQL client with integrations for React, Angular, and more. It allows you to easily build UI components that fetch data via GraphQL.

- Relay (https://github.com/facebook/relay): Facebook's framework for building data-driven React applications that talk to a GraphQL backend.

- GraphiQL (https://github.com/graphql/graphiql): An interactive in-browser GraphQL IDE intended for development purposes. We can test most of the features of GraphQL server using GraphiQL.
