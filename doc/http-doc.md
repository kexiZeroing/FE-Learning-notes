## Hypertext Transfer Protocol spec

Status Code Definitions: https://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html  

Method Definitions: https://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html  

Header Field Definitions: https://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html  

## RESTful API
Roy Fielding 于 2000 年在博士论文 《Architectural Styles and the Design of Network-based Software Architectures》 提出 REpresentational State Transfer (REST) 概念，它倡导一种新的 web 架构风格，具有面向资源、松耦合、无状态、易扩展等特点，如今被广泛应用。RESTful API 是面向 resource 的，用标准的 HTTP 方法操作资源。

|   | POST | GET	| PUT	| DELETE
|---|---|---|---|---|
| /employees | 创建一个新员工 | 列出所有员工 | 批量更新员工信息 | 删除所有员工
| /employees/56 |（错误）| 获取 56 号员工的信息	| 更新 56 号员工的信息 | 删除 56 号员工

### 返回有用的错误提示
GET /employees?state=super
```
// 400 Bad Request
{
  "message": "You submitted an invalid state. Valid state values are 'internal' or 'external'",
  "errorCode": 352,
  "additionalInformation": "http://www.domain.com/rest/errorcode/352"
}
```

### 提供分页信息
一次性返回数据库所有资源不是一个好主意。因此，需要提供分页机制。通过两个参数来控制要返回的资源结果：
- page：要获取哪一页的资源，默认是第一页
- page_size：每页返回多少资源，如果没提供会使用预设的默认值

这两个参数通常对应数据库中的 offset 和 limit。在分页时，还可以添加获取下一页或上一页的链接。
```
GET /employees?offset=20&limit=10
{
  "offset": 20,
  "limit": 10,
  "total": 3465,
  "employees": [
    //...
  ],
  "links": [
    {
      "rel": "nextPage",
      "href": "/employees?offset=30&limit=10"
    },
    {
      "rel": "previousPage",
      "href": "/employees?offset=10&limit=10"
    }
  ]
}
```

### API 版本
API 版本可以放在两个地方:
- 在 url 中指定 API 的版本，例如 https://example.com/api/v1，这样不同版本的协议解析可以放在不同的服务器上，不用考虑协议兼容性，开发方便，升级也不受影响。
- 放在 HTTP Header 中，url 显得干净，符合 RESTful 惯例，毕竟版本号不属于资源的属性。缺点是需要解析头部，判断返回。

### 连字符
- URI 中尽量使用连字符 `-` 代替下划线 `_` 的使用，连字符用来分割 URI 中出现的字符串/单词，提高 URI 的可读性。下划线会和链接的样式冲突重叠。
- URI 是对大小写敏感的，所以为了避免歧义，我们尽量用小写字符。但主机名（Host）和协议名（Scheme）对大小写是不敏感的。
