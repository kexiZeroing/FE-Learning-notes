## Notes From reading offical docs

### Add React to a Website
Adding React as a plain `<script>` tag on an HTML page optionally with JSX is the easiest way to integrate React into an existing website. Adding JSX to a project doesn’t require complicated tools like a bundler or a development server.

React’s release channels: `Latest` (stable, use this for user-facing applications), `Next` (candidates for the next minor semver release), `Experimental` (additional features that are not ready for wider release). All releases are published to npm, but only `Latest` uses semantic versioning. Prereleases have versions generated from a hash of their contents.

### Recommended Toolchains
The React team primarily recommends these solutions:
- If you’re learning React or creating a new single-page app, use [Create React App](https://create-react-app.dev/).
- If you’re building a server-rendered website with Node.js, try Next.js.
- If you’re building a static content-oriented website, try Gatsby.
- If you’re building a component library or integrating with an existing codebase, try more flexible toolchains.

### Main Concepts
React embraces the fact that rendering logic is inherently coupled with other UI logic. Instead of separating technologies by putting markup and logic in separate files, React separates concerns with loosely coupled units called "components" that contain both.

#### JSX and Rendering Elements
JSX produces React elements. After compilation, JSX expressions become regular JavaScript function calls and evaluate to JavaScript objects. React elements are plain objects, and are cheap to create. React DOM takes care of updating the DOM to match the React elements.

Don’t put quotes around curly braces when embedding a JavaScript expression in an attribute. You should either use quotes (for string values) or curly braces (for expressions), but not both in the same attribute.

We split JSX over multiple lines for readability and recommend wrapping it in parentheses.

By default, React DOM escapes any values embedded in JSX before rendering them. Everything is converted to a string before being rendered, which helps prevent XSS (cross-site-scripting) attacks.

React elements are immutable. Once you create an element, you can’t change its children or attributes. An element is like a single frame in a movie: it represents the UI at a certain point in time. React DOM compares the element and its children to the previous one, and only applies the necessary DOM updates.

It can be handy for conditionally rendering an element using logical `&&` operator or conditional (ternary) operator.

React elements are just objects, so you can pass them as props like any other data. This approach may remind you of “slots” in other libraries but there are no limitations on what you can pass as props in React.

#### Components
Conceptually, components are like JavaScript functions. They accept arbitrary inputs called "props" and return React elements describing what should appear on the screen.

Always start component names with a capital letter. React treats components starting with lowercase letters as DOM tags.

There are three things you should know about `setState()`:
- Do not modify state directly which will not re-render a component. Instead, use `setState()`. The only place where you can assign `this.state` is the constructor.
- React may batch multiple `setState()` calls into a single update for performance. There is a second form of `setState()` that accepts a function rather than an object. That function will receive the previous state as the first argument, and the props at the time the update is applied as the second argument: `this.setState((state, props) => ({ counter: state.counter + props.increment }))`
- State updates are merged. When you call `setState()`, React merges the object you provide into the current state.

#### Handling Events
React events are named using camelCase, and with JSX you pass a function as the event handler. You cannot return false to prevent default behavior in React. You must call `preventDefault` explicitly.

React defines synthetic events according to the W3C spec, so you don’t need to worry about cross-browser compatibility. React events do not work exactly the same as native events.

For class components, binding `this.handleClick = this.handleClick.bind(this)` in the constructor is necessary to make `this` work in the callback. This is not React-specific behavior; Class methods are not bound by default. If calling `bind` annoys you, you can 1) use public class fields syntax, or 2) use an arrow function as an event handler.

```js
class Toggle extends React.Component {
  constructor(props) {
    ...
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    this.setState(...);
  }

  // 1. Use class fields to ensure `this` is bound within handleClick
  handleClick = () => this.setState(...);

  render() {
    return (
      <button onClick={this.handleClick}>...</button>
      // 2. Use an arrow function to ensure `this` is bound
      <button onClick={() => this.handleClick()}>
    );
  }
}
```

The problem with `onClick={() => this.handleClick()}` is that a different callback is created each time the component renders. In most cases, this is fine. However, if this callback is passed as a prop to lower components, those components might do an extra re-rendering. We generally recommend binding in the constructor or using the class fields syntax, to avoid this sort of performance problem.

#### List and Form
A "key" is a special string attribute you need to include when creating lists of elements. Keys help React identify which items have changed, are added, or are removed. Keys serve as a hint to React but they don’t get passed to your components.

Keys used within arrays should be unique among their siblings. We don’t recommend using indexes for keys if the order of items may change. This can negatively impact performance and may cause issues with component state.

The React component that renders a form also controls what happens in that form on subsequent user input. An input form element whose value is controlled by React in this way is called a "controlled component". With a controlled component, the input’s value is always driven by the React state.

In HTML, a `<textarea>` element defines its text by its children. In React, a `<textarea>` uses a `value` attribute instead. This way, a form using a `<textarea>` can be written very similarly to a form that uses a single-line input.For `<select>` element, instead of using `selected` attribute on `<option>`, React uses a `value` attribute on the root `select` tag.

#### Lifting State Up
Usually, the state is first added to the component that needs it for rendering. Then, if other components also need it, you can lift it up to their closest common ancestor. In React, this is usually solved by making a component "controlled". Just like the `<input>` accepts both a `value` and an `onChange` prop, so can the custom component `TemperatureInput` accept both `temperature` and `onTemperatureChange` props from its parent component. Now, when the `TemperatureInput` wants to update its temperature, it calls `props.onTemperatureChange` instead of `setState`. The parent component will handle the change by modifying its own local state, thus re-rendering `TemperatureInput` with the new values.

#### Thinking in React
1. Break The UI Into A Component Hierarchy. Use single responsibility principle, that is, **a component should only do one thing**. If it ends up growing, it should be decomposed into smaller subcomponents.
2. Build A Static Version in React. The easiest way is to build a version that takes your data model and renders the UI but has no interactivity. Props are a way of passing data from parent to child, and **don’t use state at all to build this static version (state is reserved only for interactivity)**. At the end of this step, you’ll have a library of reusable components that render your data model.
3. Identify The State. Figure out the absolute minimal representation of the state your application needs and compute everything else you need on-demand. Ask three questions about each piece of data:
  - Is it passed in from a parent via props? If so, it probably isn’t state.
  - Does it remain unchanged over time? If so, it probably isn’t state.
  - Can you compute it based on any other state or props in your component? If so, it isn’t state.
4. Identify Where The State Should Live. We need to identify which component mutates or owns the state.
5. Add Inverse Data Flow. Now it’s time to support data flowing the other way: the components deep in the hierarchy need to update the state in parent. Since components should only update their own state, parent component will pass callbacks to child that will fire whenever the state should be updated.