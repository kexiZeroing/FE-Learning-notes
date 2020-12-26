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

### Advanced Guides

#### Code Splitting
Bundling is great, but as your app grows, your bundle will grow too. Especially if you are including large third-party libraries. Code-Splitting is a feature supported by bundlers like Webpack which can create multiple bundles that can be dynamically loaded at runtime. It help you "lazy-load" just the things that are currently needed by the user, which can dramatically improve the performance of your app.

The best way to introduce code-splitting into your app is through the dynamic `import()` syntax. When Webpack comes across this syntax, it automatically starts code-splitting your app. If you’re using Create React App, this is already configured for you and you can start using it immediately.

`React.lazy` takes a function that must call a dynamic `import()`. It resolves to a module with a default export containing a React component. The lazy component should then be rendered inside a `Suspense` component, which allows us to show some fallback content while we’re waiting for the lazy component to load. The bundle containing the lazy component is loaded when this component is first rendered.

```js
import React, { Suspense } from 'react';
const OtherComponent = React.lazy(() => import('./OtherComponent'));

function MyComponent() {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <OtherComponent />
      </Suspense>
    </div>
  );
}
```

#### Context
Context provides a way to pass data through the component tree without having to pass props down manually at every level. Context is designed to share data that can be considered global, such as **the current authenticated user, theme, or preferred language**. Apply context sparingly because it makes component reuse more difficult.

- `const MyContext = React.createContext(defaultValue)` creates a Context object. The `defaultValue` argument is only used when a component does not have a matching Provider.

- Every Context object comes with a Provider React component `<MyContext.Provider value={/* some value */}>` that allows consuming components to subscribe to context changes. The Provider component accepts a `value` prop to be passed to consuming components. All consumers that are descendants of a Provider will re-render whenever the Provider’s `value` prop changes.

- `Class.contextType` can be assigned a Context object. This lets you consume the nearest current value of that Context using `this.context`. You can only subscribe to a single context using this API.

- Wthin a function component, `<MyContext.Consumer>{value => /* render something based on the context value */}</MyContext.Consumer>` requires a function as a child. The function receives the current context value and returns a React node. The `value` argument will be equal to the `value` prop of the closest Provider for this context.

#### Fragments
Fragment lets you group a list of children without adding extra nodes to the DOM. Fragments declared with the explicit `<React.Fragment>` syntax may have keys, and key is the only attribute that can be passed to Fragment. You can use `<></>` as a shorter syntax except that it doesn’t support keys or attributes.

### Hooks
React 16.8.0 is the first release to support Hooks. **Hooks are functions that let you "hook into" React state and lifecycle features from function components**. Hooks don’t replace your knowledge of React concepts. Instead, Hooks provide a more direct API to the React concepts you already know: props, state, context, refs, and lifecycle. 

- With Hooks, you can extract stateful logic from a component so it can be tested independently and reused between components without changing your component hierarchy.
- Hooks let you split one component into smaller functions based on what pieces are related rather than forcing a split based on lifecycle methods. 
- Hooks let you use more of React’s features without classes. Conceptually, React components have always been closer to functions.
- We intend for Hooks to cover all existing use cases for classes, but we will keep supporting class components for the foreseeable future.
- Use [eslint-plugin-react-hooks](https://www.npmjs.com/package/eslint-plugin-react-hooks) to enforce rules of hooks automatically. This plugin is included by default in Create React App.

#### useState
If the new state is computed using the previous state, you can pass a function to `setState`. The function will receive the previous value, and return an updated value.

The `initialState` argument is the state used during the initial render. In subsequent renders, it is disregarded. If the initial state is the result of an expensive computation, you may provide a function instead, which will be executed only on the initial render.

#### useEffect
Think of useEffect Hook as `componentDidMount`, `componentDidUpdate`, and `componentWillUnmount` combined. React guarantees the DOM has been updated by the time it runs the effects.

Every effect may return a function that performs a cleanup. This lets us keep the logic for adding and removing effect close to each other. React performs the cleanup when the component unmounts as well as before running the effects next time.

Use multiple effects to separate concerns. Hooks let us split the code based on what it is doing rather than a lifecycle method name. React will apply every effect in the order they were specified.

You can tell React to skip applying an effect if certain values haven’t changed between re-renders. To do so, pass an array as an optional second argument to useEffect (every value referenced inside the effect function should appear in the dependencies array). If you want to run an effect and clean it up only once, you can pass an empty array as a second argument.

#### useContext
`const value = useContext(MyContext)` accepts a context object (the value returned from `React.createContext`) and returns the current context value. The current context value is determined by the `value` prop of the nearest `<MyContext.Provider>`. A component calling `useContext` will always re-render when the context value changes.

If you’re familiar with the context API before Hooks, `useContext(MyContext)` is equivalent to `static contextType = MyContext` in a class, or to `<MyContext.Consumer>`, but you still need a Provider above in the tree to provide the value for this context.

#### useReducer
`const [state, dispatch] = useReducer(reducer, initialState)` accepts a reducer of type `(state, action) => newState`, and returns the current state paired with a `dispatch` method. `useReducer` is usually preferable to `useState` when you have complex state logic that involves multiple sub-values or when the next state depends on the previous one.

#### useCallback
`const memoizedCallback = useCallback(() => doSomething(a, b), [a, b])`

Pass an inline callback and an array of dependencies. `useCallback` will return a memoized version of the callback that only changes if one of the dependencies has changed. This is useful when passing callbacks to the optimized child components that rely on reference equality to prevent unnecessary renders.

> On every render, everything that's inside a functional component will run again. If a child component has a dependency on a function from the parent component, the child will re-render every time the parent re-renders even if that function "doesn't change" (the reference changes, but what the function does won't).
It's used for optimization by avoiding unnecessary renders from the child, making the function change the reference only when dependencies change.

#### useMemo
`const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b])`

Pass a "create" function and an array of dependencies. `useMemo` will only recompute the memoized value when one of the dependencies has changed. This optimization helps to avoid expensive calculations on every render. `useCallback(fn, deps)` is equivalent to `useMemo(() => fn, deps)`.

#### useRef
`const refContainer = useRef(initialValue)` returns a mutable ref object whose `current` property is initialized to the passed argument. The returned object will persist for the full lifetime of the component. 

You might be familiar with refs primarily as a way to access the DOM. If you pass a ref object to `<div ref={refContainer} />`, React will set its `current` property to the corresponding DOM node.

`useRef()` creates a plain JavaScript object. The only difference between `useRef()` and creating a `{current: ...}` object yourself is that `useRef` will give you the same ref object on every render. Mutating the `current` property doesn’t cause a re-render.

#### useLayoutEffect
The function passed to `useEffect` fires after layout and paint, during a deferred event. This makes it suitable for the many common side effects because most types of work shouldn’t block the browser from updating the screen.

However, not all effects can be deferred. For example, a DOM mutation that is visible to the user must fire synchronously before the next paint so that the user does not perceive a visual inconsistency. For these types of effects, React provides one additional Hook called `useLayoutEffect`. It has the same signature as `useEffect`, and only differs in when it is fired. Use `useLayoutEffect` to read layout from the DOM and synchronously re-render before the browser has a chance to paint. (Prefer the standard `useEffect` when possible to avoid blocking visual updates.)