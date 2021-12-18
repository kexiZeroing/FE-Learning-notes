## Authorization and Authentication
**Authorization** deals with granting or denying access to access resources. **Authentication** refers to the process of verifying that a user is who they say they are.

### Token-based authentication
- Browsers will automatically send cookies, whereas bearer tokens need to be added explicitly to the HTTP request. The browser automatically sending cookies has a big downside which is CSRF attack.
- Cookies are for sending and storing arbitrary data, whereas bearer tokens are specifically for sending authorization data. That data is often encoded as a JWT.
- Cookies make it more difficult for non-browser based applications like mobile or tablet apps to consume your API.

We manually store the bearer token in our clients and add that value to the HTTP `Authorization` header (Now in 2020, simply store the JWT token in a cookie with `SameSite=strict` to defeat CSRF. Of course, keep `secure` and `httpOnly` too). JWT is an abbreviation for JSON Web Token. JWTs are nothing more than a cryptographically signed, base64 representation of a JSON object (a signed assertion of some facts). JWT offers many features, and puts them in a standard so they can be used between parties. It can be used from browser to back end, between back ends controlled by different parties, or within back end services of one party.

### Before OAuth
Let's say you used an app called HireMe123. HireMe123 wants to set up a calendar event on your (the user's) behalf. HireMe123 doesn't have its own calendar; it wants to use another service called MyCalApp to add events. Once you were logged into HireMe123, HireMe123 would ask you for your MyCalApp login credentials. You would enter your MyCalApp username and password into HireMe123's site. HireMe123 then used your MyCalApp login to gain access to MyCalApp's API, and could then create calendar events using your MyCalApp credentials.

This approach relied on sharing a user's personal credentials from one app with a completely different app, and this is not good. HireMe123 had too much access to MyCalApp. HireMe123 had the same amount of access that you did, because they used your credentials to gain that access. That meant that HireMe123 could read all your calendar events, delete events, modify your calendar settings, etc.

### Enter OAuth
**OAuth 2.0** is an open standard for performing delegated authorization. It's a specification that tells us how to grant third party access to APIs without exposing credentials. Now MyCalApp can limit access to its API when called by third party clients without the risks of sharing login information or providing too much access. It does this using an **authorization server**. An authorization server is a set of endpoints to interact with the user and issue tokens.

MyCalApp now has an authorization server. HireMe123 wants to create events on your behalf, so HireMe123 sends an authorization request to MyCalApp's authorization server. In response, MyCalApp's authorization server prompts you — the user — to log in with MyCalApp. You authenticate with MyCalApp. The MyCalApp authorization server then prompts you for your consent to allow HireMe123 to access MyCalApp's APIs on your behalf. A prompt opens in the browser and specifically asks for your consent to let HireMe123 add calendar events (but no more than that). If you say yes and grant your consent, MyCalApp will then issue an **access token** to HireMe123. HireMe123 can use that access token to call the MyCalApp API within the scope of permissions that were accepted by you and create events for you using the MyCalApp API.

At this point, it doesn't cover authentication. At any point where authentication was involved, it was managed by whatever login process HireMe123 or MyCalApp had implemented on their own. OAuth 2.0 didn't prescribe how this should be done: it only covered authorizing third party API access.

### Login authentication
The thing that happened after was that apps also wanted to log users in with other accounts. Let's say HireMe123 wanted a MyCalApp user to be able to log into HireMe123 using their MyCalApp account, despite not having signed up for a HireMe123 account. But OAuth 2.0 is not an authentication protocol. It quickly became evident that **formalization of authentication on top of OAuth 2.0 was necessary to allow logins with third party applications** while keeping apps and their users safe.

OIDC (OpenID Connect) is a spec on top of OAuth 2.0 that says how to authenticate users with an authorization server. Remember that an authorization server issues tokens. In the case of authentication, the authorization server issues **ID tokens**. ID tokens are intended for the client, and the client can parse and validate to extract identity information from the token. OIDC declares a fixed format for ID tokens, which is **JSON Web Token**. JWT is composed of three URL encoding string segments concatenated with periods `.`:

- **Header Segment** is a JSON object containing a signing algorithm and token type. It is `base64Url` encoded.
- **Payload Segment** is a JSON object containing data claims, which are statements about the end user (**Identity Claims**) and the authentication event (**Authentication Claims**). This is also `base64Url` encoded. Some of the authentication and identity claims include:
  - iss (issuer): the issuer of the JWT, e.g., the authorization server
  - aud (audience): the intended recipient of the JWT; for ID tokens, this must be the client ID of the application receiving the token
  - exp (expiration time): expiration time; the ID token must not be accepted after this time
  - iat (issued at time): time at which the ID token was issued
  - sub (subject): unique identifier for the user; required
  - name, email, birthdate
- **Crypto Segment**, or signature. JWTs are signed so they can't be modified in transit. When an authorization server issues a token, it signs it using a key. When the client receives the token, the client validates the signature using a key as well.

Let's see OIDC authentication in practice. When a user wants to log in, the app sends an request to the authorization server. The user's credentials are verified by the authorization server, and if everything checks out, the authorization server issues an ID token to the application. The client application then decodes the ID token (which is a JWT) and verifies it. This includes validating the signature and verifying the claims (e.g., was this token issued by the expected authorization server? is our app the target recipient of this token?). Once we've established the authenticity of the ID token, the user is authenticated. We also have access to the identity claims and know who this user is (including details like name and profile picture).

### Accessing APIs with Access Tokens
**Access tokens** are used for granting access to resources, never be used for authentication. With an access token issued by MyCalApp's authorization server, HireMe123 can access MyCalApp's API. MyCalApp sends an access token after the user logs in and provides consent for the app to write the calendar.

Unlike ID tokens (JWT), access tokens have no specific defined format. They do not have to be JWT. Its purpose is to inform the API that the bearer of this token has been authorized to access the API and perform specific actions. Access tokens should be treated as opaque strings by clients. They are only meant for the API. Your client should not attempt to decode them or depend on a particular access token format. Furthermore, access tokens have short expiration (i.e. 30 minutes), and we have to send every short period the username and password if it expires. That's when **refresh tokens** appear to solve this problem. A user can get a new access token using a refresh token (long expiration, i.e. a month) without having to re-authenticate.

When our app wants to interact with the API, we attach the access token in the HTTP Authorization header `Authorization: Bearer <access_token>`. **Bearer tokens** are the predominant type of access token used with OAuth 2.0. A Bearer token basically says "Give the bearer (*a person or thing that carries or holds something*) of this token access". The authorized request is then sent to the API, which verifies the token using middleware. If everything checks out, then the API returns data to the application running in the browser.

### Delegation with Scopes
How does the API know what level of access it should give to the application that's requesting use of its API? We do this with scopes. **Scopes limit what an application can do on behalf of a user**. For example, HireMe123 wants to access the third party MyCalApp API to create events on user's behalf. Remember when the authorization server asked the HireMe123 user for their consent to allow HireMe123 to use the user's privileges to access MyCalApp (in a consent dialog)? HireMe123 could ask for a variety of different scopes, for example: `write:events`, `read:events`, `read:settings`, `write:settings`. So when HireMe123 requested an access token from MyCalApp's authorization server, this token has an important information `scope: write:events` saying HireMe123 has the permission to write events to the calendar. HireMe123 then sends a request to the MyCalApp API with the access token in its authorization header. When the MyCalApp API receives this request, it can see that the token contains a `write:events` scope.

### Netlify uses Github login example
- A third-party OAuth application (Netlify Auth) with `user:email` scope was recently authorized to access your account. Check: Github settings -> Applications -> Authorized OAuth Apps
- Access token is a bearer token used to allow access from a client application **app.netlify.com** to a resource server **api.netlify.com**. (not issued from Github)

```
// netlify 3rd party login choice html page
GET https://app.netlify.com/authorize?
  response_type: code
  client_id: xxxx
  redirect_uri: https://your-year-on.netlify.com/.netlify/functions/auth-callback
  state: csrf=xxxx&provider=netlify

// choose Github login
GET https://api.netlify.com/auth?
  provider: github
  site_id: app.netlify.com
  tracking_session_id: xxxx
  login: true
  redirect: https://app.netlify.com/

// above response will 302 to this location
GET https://github.com/login/oauth/authorize?
  client_id: xxxx
  redirect_uri: https://api.netlify.com/auth/done
  state: xxxx
  scope: user:email

// now click authorize netlify button in the page
POST https://github.com/login/oauth/authorize
  authorize: 1
  authenticity_token: xxxx
  redirect_uri: https://api.netlify.com/auth/done
  state: xxxx
  scope: user:email

// redirect to the authorized application after above submitted 
GET https://api.netlify.com/auth/done?
  code: xxxx
  state: xxxx

// above response will 302 to this location with the access token
GET https://app.netlify.com/auth#access_token=xxxx&new_user=&redirect=/

// now go back to the Netlify app and following requests will have the access token
GET https://api.netlify.com/api/v1/user
  authorization: Bearer xxxx

```
