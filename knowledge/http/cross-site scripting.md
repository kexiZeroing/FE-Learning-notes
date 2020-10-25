## Cross-site scripting
Cross-site scripting (XSS) is a security bug that can affect websites. This bug can allow an attacker to add their own malicious JavaScript code onto the HTML pages displayed to the users. Once executed by the victim's browser, this code could then perform actions such as completely changing the behavior or appearance of the website, stealing private data, or performing actions on behalf of the user.

XSS vulnerabilities most often happen when user input is incorporated into a web server's response **without proper escaping or validation**. User input is sent to the server, and the server responds back to the user by displaying a page that includes the user input. XSS also can occur entirely in the client-side (more specifically, in the DOM setting the `innerHTML` value) without data being sent back and forth between the client and server.

- **Stored XSS** refers to malicious code sent in the server response from something like a database. (load comments for articles)
- **Reflected XSS** is where malicious user input in a request is sent back in the immediate server response. (the server uses the entire query string as a parameter)
- **DOM-based XSS** is when JavaScript running on the page uses data from somewhere the attacker can control, such as `window.location`. (the server isn’t involved at all)

For example, open a URL such as: `https://xss-doc.appspot.com/demo#'><img src=x onerror=alert(/DOM-XSS/)>`. The XSS is triggered because the client-side script uses part of the URL to set the innerHTML of one of the elements inside the page. `location.hash` variable is set to `#'><img src=x onerror=alert(/DOM-XSS/)>`, and its substring is used to set the value of `name` variable in `html += "<img src='/static/demos/IMG" + name + ".jpg' />";`, which results in: `<img src='/static/demos/IMG'><img src=x onerror=alert(/DOM-XSS/)>.jpg' />`. This is a valid HTML; however, the browser will fail to load the image(src=x) and will instead execute the onerror code.

### Preventing XSS
A common technique for preventing XSS vulnerabilities is "escaping". The purpose of character and string escaping is to make sure that every part of a string is interpreted as a string primitive, not as a control character or code. **Escape certain characters (like `<`, `>`, `&`, and `"`) with HTML entity to prevent them being executed**. For example, if you include `&lt;script&gt;alert('testing')&lt;/script&gt;` in the HTML of a page, it will print out the text `"<script>alert('testing')</script>"`, and it will not actually execute the script.

A good test string is `>'>"><img src=x onerror=alert(0)>`. If your application doesn't correctly escape this string, you will see an alert and will know that something went wrong. 

We do not recommend that you manually escape user-supplied data. Instead, we strongly recommend that you use a templating system or web development framework that provides context-aware auto-escaping. If this is impossible for your website, use existing libraries and functions that are known to work, and apply these functions consistently to all user-supplied data.

> By default, **React** DOM escapes any values embedded in JSX before rendering them. Thus it ensures that you can never inject anything that’s not explicitly written in your application. Everything is converted to a string before being rendered. This helps prevent XSS attacks.

> To systematically block XSS bugs, **Angular** treats all values as untrusted by default. When a value is inserted into the DOM from a template, via property, attribute, style, class binding, or interpolation, Angular sanitizes and escapes untrusted values. (Recognizes the value as unsafe and automatically sanitizes it, which removes the `<script>` tag but keeps safe content such as the `<b>` element).


## Content Security Policy
Configuring CSP involves adding the Content-Security-Policy HTTP response header to a web page and giving it values to control what resources the user agent is allowed to load for that page. For example, a page that uploads and displays images could allow images from anywhere, but restrict a form action to a specific endpoint. A properly designed Content Security Policy helps protect a page against a cross site scripting attack.

The primary benefit of CSP comes from **disabling the use of unsafe inline JavaScript**. Improperly escaped user-inputs can generate code that is interpreted by the web browser as JavaScript. By using CSP to disable inline JavaScript, you can effectively eliminate almost all XSS attacks against your site. Note that disabling inline JavaScript means that all JavaScript must be loaded from `<script>` src tags. Event handlers such as `onclick` used directly on a tag will fail to work, as will JavaScript inside `<script>` tags but not loaded via src. Furthermore, inline stylesheets using either `<style>` tags or the style attribute could also fail to load.

A policy is described using a series of **policy directives**, each of which describes the policy for a certain resource type or policy area. Your policy should include a `default-src` policy directive, which is a fallback for other resource types when they don't have policies of their own. A policy needs to include a `default-src` or `script-src` directive to prevent inline scripts from running, as well as blocking the use of `eval()`. A policy needs to include a `default-src` or `style-src` directive to restrict inline styles from being applied. There are specific directives for a wide variety of types of items, so that each type can have its own policy, including fonts, frames, images, audio and video media, scripts, and workers.

```
// Allow everything but only from the same origin
Content-Security-Policy: default-src 'self';

// Only allow scripts from the same origin
Content-Security-Policy: script-src 'self';

// Allow Google Analytics, Google AJAX CDN and Same Origin
Content-Security-Policy: script-src 'self' www.google-analytics.com ajax.googleapis.com;

// Allows images, scripts, AJAX, form actions, and CSS from the same origin, and does not allow any other resources to load.
// It is a good starting point for many sites.
default-src 'none'; script-src 'self'; connect-src 'self'; img-src 'self'; style-src 'self'; base-uri 'self'; form-action 'self';
```

```html
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; manifest-src 'none'; prefetch-src 'none'; worker-src 'none'; object-src 'self'; font-src *; connect-src 'self' https://www.google-analytics.com; img-src 'self' https://some-cdn.com; script-src 'self' https://platform.twitter.com https://www.google-analytics.com https://connect.facebook.net https://staticxx.facebook.com; style-src 'self' https://platform.twitter.com">
```

Whenever you see the prefix `unsafe` in a CSP keyword, that means that using this is not the most secure way to go.
- 'none': No URLs match.
- 'self': Refers to the origin site with the same scheme and port number.
- 'unsafe-inline': Allows the usage of inline scripts or styles.
- 'unsafe-eval': Allows the usage of eval in scripts.
- 'unsafe-hashes': Allows the execution of inline scripts within a JavaScript event handler attribute of a HTML element.
