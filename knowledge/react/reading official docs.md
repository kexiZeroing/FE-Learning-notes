## Notes from reading offical docs

### Getting Started
Check this: https://reactjs.org/blog/all.html

#### Recommended Toolchains
The React team primarily recommends these solutions:
- If you’re learning React or creating a new single-page app, use [Create React App](https://create-react-app.dev/).
- If you’re building a server-rendered website with Node.js, try Next.js.
- If you’re building a static content-oriented website, try Gatsby.
- If you’re building a component library or integrating with an existing codebase, try more flexible toolchains.

---

### Main Concepts
React embraces the fact that rendering logic is inherently coupled with other UI logic. Instead of separating technologies by putting markup and logic in separate files, React separates concerns with loosely coupled units called "components" that contain both.

#### JSX and Rendering Elements
JSX produces React elements. After compilation, JSX expressions become regular JavaScript function calls (JSX is syntactic sugar for calling `React.createElement(component, props, ...children)`) and evaluate to React elements which are plain JavaScript objects. React DOM takes care of updating the DOM to match the React elements.

Don’t put quotes around curly braces when embedding a JavaScript expression in an attribute. You should either use quotes (for string values) or curly braces (for expressions), but not both in the same attribute.

We split JSX over multiple lines for readability and recommend wrapping it in parentheses. It can be handy for conditionally rendering an element using logical `&&` operator or conditional (ternary) operator.

By default, React DOM escapes any values embedded in JSX before rendering them. Everything is converted to a string before being rendered, which helps prevent XSS (cross-site-scripting) attacks.

You cannot use a general expression as the React element type. If you do want to use a general expression to indicate the type of the element, just assign it to a capitalized variable first.

```js
import React from 'react';
import { PhotoStory, VideoStory } from './stories';

const components = {
  photo: PhotoStory,
  video: VideoStory
};

function Story(props) {
  // render a component based on the prop, but using `<components[props.storyType] />` is wrong
  const SpecificStory = components[props.storyType];
  return <SpecificStory />;
}
```

React elements are just objects, so you can pass them as props like any other data. This approach may remind you of “slots” in other libraries but there are no limitations on what you can pass as props in React.

#### Props and Children in JSX
- You can pass any JavaScript expression as a prop.
- If you pass no value for a prop, it defaults to `true`. 
- If you already have props as an object, and you want to pass it in JSX, you can use spread operator to pass the whole props object `<Hello {...props} />`.
- The content between an opening tag and a closing tag is passed as a special prop: `props.children`. **JSX removes blank lines and whitespace at the beginning and ending of a line**. New lines that occur in the middle of string literals are condensed into a single space.
- `false`, `true`, `null`, and `undefined` are valid children. They simply don’t render. This can be useful to conditionally render React elements. One caveat is that some falsy values, such as `0`, are still rendered.

```js
// `0` is still printed when `props.messages` is an empty array
<div>
  { props.messages.length && <MessageList messages={props.messages} /> }
</div>

// To fix this, make sure that the expression before `&&` is always boolean
<div>
  { props.messages.length > 0 && <MessageList messages={props.messages} /> }
</div>
```

#### Component and State
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

#### Lists and Keys
A "key" is a special string attribute you need to include when creating lists of elements. Keys help React identify which items have changed, are added, or are removed. Keys serve as a hint to React but they don’t get passed to your components.

Keys used within arrays should be unique among their siblings (not globally unique). We don’t recommend using indexes for keys if the order of items may change. This can negatively impact performance and may cause issues with component state.

- Never use random value in the "key" attribute: it will cause the item to re-mount on every render.
- There is no harm in using the array’s index as "key" in static lists - those whose items number and order stay the same.
- Use item unique identifier as "key" when the list can be re-sorted or items can be added in random places.

> Why "index" as a "key" attribute is not a good idea? When React does the comparison, it sees the item with the `key="0"` in both "before" and "after" lists, so it thinks that the item with `key="0"` (first item in the array) is exactly the same before and after the state change, so it re-uses the same component instance, keeps the state as it was (i.e. the first item stays selected), and just updates the props values.

#### Forms
The React component that renders a form also controls what happens in that form on subsequent user input. An input form element whose value is controlled by React in this way is called a "controlled component". With a controlled component, the input’s value is always driven by the React state.

> The alternative is uncontrolled components, where form data is handled by the DOM itself. To write an uncontrolled component, instead of writing an event handler for every state update, you can use a ref to get form values from the DOM.

In HTML, a `<textarea>` element defines its text by its children. In React, a `<textarea>` uses a `value` attribute instead. This way, a form using a `<textarea>` can be written very similarly to a form that uses a single-line input. For `<select>` element, instead of using `selected` attribute on `<option>`, React uses a `value` attribute on the root `select` tag.

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
5. Add Inverse Data Flow. Now it’s time to support data flowing the other way: the components deep in the hierarchy need to update the state in parent. Since **components should only update their own state, parent component will pass callbacks to child** that will fire whenever the state should be updated.

---

### Advanced Guides

#### Code Splitting
Bundling is great, but as your app grows, your bundle will grow too. Code-Splitting is a feature supported by bundlers like Webpack which can create multiple bundles that can be dynamically loaded at runtime. It help you "lazy-load" just the things that are currently needed by the user, which can dramatically improve the performance of your app.

The best way to introduce code-splitting into your app is through the dynamic `import()` syntax. When Webpack comes across this syntax, it automatically starts code-splitting your app. If you’re using Create React App, this is already configured for you and you can start using it immediately.

`React.lazy` takes a function that must call a dynamic `import()`. It resolves to a module with a default export containing a React component. The lazy component should then be rendered inside a `Suspense` component, which allows us to show some fallback content while we’re waiting for the lazy component to load (render in the UI). The bundle containing the lazy component is loaded when this component is first rendered.

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

#### Reconciliation
You can think of the `render()` function as creating a tree of React elements. On the next state or props update, that `render()` function will return a different tree of React elements. React then needs to figure out how to efficiently update the UI to match the most recent tree (The Diffing Algorithm).

- Whenever the root elements have different types, React will tear down the old tree and build the new tree from scratch.
- When comparing two React DOM elements of the same type, React looks at the attributes of both, keeps the same underlying DOM node, and only updates the changed attributes.
- When recursing on the children of a DOM node, React supports a `key` attribute, using the `key` to match children in the original tree with children in the subsequent tree.

#### Refs and the DOM
There are a few good use cases for refs:
- Managing focus, text selection, or media playback.
- Triggering imperative animations.
- Integrating with third-party DOM libraries.

Avoid using refs for anything that can be done declaratively. By default, you may not use the ref attribute on function components because they don’t have instances. You can, however, use the ref attribute inside a function component (using `useRef` hook) as long as you refer to a DOM element or a class component.

Ref forwarding is an opt-in feature that lets some components take a ref they receive, and pass it further down to a child. In the example below, the component using `FancyButton` can get a ref to the underlying button DOM node and access it if necessary—just like if they used a DOM button directly.

```js
// `React.forwardRef` accepts a rendering function as an argument
const FancyButton = React.forwardRef((props, ref) => (
  <button ref={ref} className="FancyButton">
    {props.children}
  </button>
));

// You can now get a ref directly to the DOM button
const ref = React.createRef();
<FancyButton ref={ref}>Click me</FancyButton>;
```

#### Error Boundaries
Error boundaries are React components that catch errors anywhere in their child component tree, log those errors, and display a fallback UI instead of the component tree that crashed. (Error boundaries do not catch errors for event handlers, asynchronous code, and server side rendering.)

Error boundaries work like a JavaScript `catch {}` block, but for components. Only class components can be error boundaries. Use `static getDerivedStateFromError()` to render a fallback UI after an error has been thrown. Use `componentDidCatch()` to log error information. Note that error boundaries only catch errors in the components below them in the tree, and it can’t catch an error within itself.

```js
class ErrorBoundary extends React.Component {
  // ...
  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can log the error to an error reporting service
    logErrorToMyService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children; 
  }
}
```

As of React 16, errors that were not caught by any error boundary will result in unmounting of the whole React component tree. Adding error boundaries lets you provide better user experience when something goes wrong.

#### Render Props
Components are the primary unit of code reuse in React, but it’s not always obvious how to share the state or behavior that one component encapsulates to other components that need that same state.

```js
class MouseTracker extends React.Component {
  constructor(props) {
    super(props);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.state = { x: 0, y: 0 };
  }

  handleMouseMove(event) {
    this.setState({
      x: event.clientX,
      y: event.clientY
    });
  }

  render() {
    return (
      <div style={{ height: '100vh' }} onMouseMove={this.handleMouseMove}>
        <p>The current mouse position is ({this.state.x}, {this.state.y})</p>
      </div>
    );
  }
}
```

Now if another component needs to know about the cursor position, can we encapsulate that behavior so that we can easily share it with that component? For example, let’s say we have a `<Cat>` component that renders the image of a cat chasing the mouse around the screen. We might use a `<Cat mouse={{ x, y }}>` prop to tell the component the coordinates of the mouse. At first, you might try rendering the `<Cat>` inside `<Mouse>`’s render method, like this `<Cat mouse={this.state} />`, but we haven’t achieved the objective of truly encapsulating the behavior in a reusable way. Now, every time we want the mouse position for a different use case, we have to create a new `<MouseWithSomethingElse>` component that renders something specifically for that use case.

Here’s where the render prop comes in: Instead of hard-coding something else in the render method to solve for a specific use case, we provide `<Mouse>` with a function prop that it uses to dynamically determine what to render. More concretely, **a render prop is a function prop that a component uses to know what to render**.

```js
class Cat extends React.Component {
  render() {
    const mouse = this.props.mouse;
    return (
      <img src="/cat.jpg" style={{ position: 'absolute', left: mouse.x, top: mouse.y }} />
    );
  }
}

class Mouse extends React.Component {
  // ...
  render() {
    return (
      <div style={{ height: '100vh' }} onMouseMove={this.handleMouseMove}>
        {this.props.render(this.state)}
      </div>
    );
  }
}

class MouseTracker extends React.Component {
  render() {
    return (
      <div>
        <Mouse render={mouse => (
          <Cat mouse={mouse} />
        )}/>
      </div>
    );
  }
}
```

It’s important to remember that just because the pattern is called "render props" you don’t have to use a prop named render to use this pattern. In fact, any prop that is a function that a component uses to know what to render is technically a "render prop".

#### Higher-Order Components
A higher-order component is a function that takes a component and returns a new component. Whereas a component transforms props into UI, a higher-order component transforms a component into another component. HOCs are common in third-party React libraries.

```js
// This function takes a component and returns another component
function withSubscription(WrappedComponent) {
  return class extends React.Component {
    // ...
    render(){
      // render the wrapped component with the fresh data and pass through any additional props
      return <WrappedComponent data={this.state.data} {...this.props} />;
    }
  }
}

// When `CommentListWithSubscription` is rendered `<CommentListWithSubscription />`, component `CommentList` will be passed a prop with the most current data
const CommentListWithSubscription = withSubscription(CommentList);
```

Note that a HOC doesn’t modify the input component, but composes the original component by wrapping it in a container component. The wrapped component receives all the props of the container, along with a new prop, data, which it uses to render its output. The HOC isn’t concerned with how or why the data is used, and the wrapped component isn’t concerned with where the data came from.

#### Type Checking
As your app grows, you can catch a lot of bugs with typechecking. React has some built-in typechecking abilities. To run typechecking on the props for a component, you can assign the special `propTypes` property. [PropTypes](https://www.npmjs.com/package/prop-types) exports a range of validators that can be used to make sure the data you receive is valid. When an invalid value is provided for a prop, a warning will be shown in the JavaScript console. For performance reasons, `propTypes` is only checked in development mode.

We recommend using Flow or TypeScript instead of PropTypes for larger code bases to typecheck the whole application. Being a typed language, TypeScript can catch errors and bugs at build time, long before your app goes live. Create React App supports TypeScript out of the box. To create a new project with TypeScript support, run `npx create-react-app my-app --template typescript`. If you are not Create React App users, you need to add TypeScript to your project and setup in `tsconfig.json`. We have two file extensions for TypeScript: `.ts` is the default file extension while `.tsx` is a special extension used for files which contain JSX.

#### Profiler
A Profiler can be added anywhere in a React tree to measure the cost of rendering that part of the tree. The purpose is to help identify parts of an application that are slow and may benefit from optimizations. Profiling adds some additional overhead, so it is disabled in the production build.

It requires two props: an `id` and an `onRender` callback which React calls any time a component within the tree "commits" an update. The `onRender` function receives parameters describing what was rendered and how long it took.

> React does work in two phases:
> - The **render** phase determines what changes need to be made to the DOM. During this phase, React calls `render` and then compares the result to the previous render.
> - The **commit** phase is when React applies any changes. In the case of React DOM, this is when React inserts, updates, and removes DOM nodes. React also calls lifecycles like `componentDidMount` and `componentDidUpdate` during this phase.

```js
render(
  <App>
    <Profiler id="Navigation" onRender={onRenderCallback}>
      <Navigation {...props} />
    </Profiler>
    <Main {...props} />
  </App>
);

function onRenderCallback(
  id, // the "id" prop of the Profiler tree that has just committed
  phase, // either "mount" or "update"
  actualDuration, // time spent rendering the committed update
  baseDuration, // estimated time to render the entire subtree without memoization
  startTime, // when React began rendering this update
  commitTime, // when React committed this update
  interactions // the Set of interactions belonging to this update
) {
  // Aggregate or log render timings...
}
```

#### Optimizing Performance
Using React will lead to a fast user interface without doing much work to specifically optimize for performance.

`shouldComponentUpdate` is triggered before the re-rendering process starts. The default implementation of this function returns `true`, leaving React to perform the update. If you know that in some situations your component doesn’t need to update, you can return `false` from your overriding lifecycle function `shouldComponentUpdate` to skip the whole rendering process, including calling `render` function on this component and below.

`React.PureComponent` is equivalent to implementing `shouldComponentUpdate` with a shallow comparison of current and previous props and state. If you shallow compare a nested object it will just check the reference, not the value inside the object. (Using spread syntax or `Object.assign` to return a new object rather than mutating the old one, otherwise a shallow comparison would miss it). 

Use `React.memo` to implement `shouldComponentUpdate`. You can wrap a function component with `React.memo` to shallowly compare its props. `React.memo` is equivalent to `React.PureComponent`, but it only compares props. `React.memo` only exists as a performance optimization.

```js
// skips rerendering the child component if the prop hasn’t changed
const ChildComponent = React.memo(function ChildComponent({ count }) {
  console.log("child component is rendering");
  return (
    <div>
      <h2>This is a child component.</h2>
      <h4>Count: {count}</h4>
    </div>
  );
});
```

> When we pass down object, array, or function as a prop, the memoized component always rerenders.
> - To prevent the function from always redefining, we use a `useCallback` Hook that returns a memoized version of the callback between renders.
> - When the prop we pass down to a child component is an array or object, we can use a `useMemo` Hook to memoize the value between renders.

---

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

Unlike the `setState` method in class components, `useState` does not automatically merge update objects. We recommend to split state into multiple state variables.

If you update to the same value as the current state, React will bail out without rendering the children or firing effects. (React uses the `Object.is` comparison)

#### useEffect
Think of useEffect Hook as `componentDidMount`, `componentDidUpdate`, and `componentWillUnmount` combined. React guarantees the DOM has been updated by the time it runs the effects.

Every effect may return a function that performs a cleanup. This lets us keep the logic for adding and removing effect close to each other. React performs the cleanup when the component unmounts as well as before running the effects next time.

Use multiple effects to separate concerns. Hooks let us split the code based on what it is doing rather than a lifecycle method name. React will apply every effect in the order they were specified.

You can tell React to skip applying an effect if certain values haven’t changed between re-renders. To do so, pass an array as an optional second argument to useEffect (**recommend to declare functions needed by an effect inside of the effect. Then it’s easy to see what values the effect uses, and every value referenced inside the effect function should appear in the dependencies array**). If you want to run an effect and clean it up only once, you can pass an empty array as a second argument.

```js
// declare `fetchProduct` function inside the effect
// also handle out-of-order responses with a local variable inside the effect
useEffect(() => {
  let ignore = false;
  async function fetchProduct() {
    const response = await fetch('http://myapi/product/' + productId);
    const json = await response.json();
    if (!ignore) setProduct(json);
  }

  fetchProduct();
  return () => { ignore = true };
}, [productId]);
```

```js
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Every second, this callback calls `setCount(0 + 1)`, so the count never goes above 1.
    const id = setInterval(() => {
      setCount(count + 1); // This effect depends on the `count` state
    }, 1000);
    return () => clearInterval(id);
  }, []); // Bug: `count` is not specified as a dependency

  return <h1>{count}</h1>;
}

// Specifying `count` as a dependency would fix the bug, but would cause the interval to be reset on every change. That may not be desirable.
// To fix it, we can use the functional update form of `setState`
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCount(c => c + 1); // This doesn't reference the current state
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return <h1>{count}</h1>;
}
```

#### useContext
`const value = useContext(MyContext)` accepts a context object (the value returned from `React.createContext`) and returns the current context value. The current context value is determined by the `value` prop of the nearest `<MyContext.Provider>`. A component calling `useContext` will always re-render when the context value changes.

If you’re familiar with the context API before Hooks, `useContext(MyContext)` is equivalent to `static contextType = MyContext` in a class, or to `<MyContext.Consumer>`, but you still need a Provider above in the tree to provide the value for this context.

#### useReducer
`const [state, dispatch] = useReducer(reducer, initialState)` accepts a reducer of type `(state, action) => newState`, and returns the current state paired with a `dispatch` method. `useReducer` is usually preferable to `useState` when you have complex state logic that involves multiple sub-values or when the next state depends on the previous one.

```js
// In large component trees, passing `dispatch` down via context is the recommended pattern for deep updates.
const TodosDispatch = React.createContext(null);

function TodosApp() {
  // Note: `dispatch` won't change between re-renders
  const [todos, dispatch] = useReducer(todosReducer);

  return (
    <TodosDispatch.Provider value={dispatch}>
      <DeepTree todos={todos} />
    </TodosDispatch.Provider>
  );
}

function DeepChild(props) {
  const dispatch = useContext(TodosDispatch);
  function handleClick() {
    dispatch({ type: 'add', text: 'hello' });
  }

  return (
    <button onClick={handleClick}>Add todo</button>
  );
}
```

#### useCallback
`const memoizedCallback = useCallback(() => doSomething(a, b), [a, b])`

Pass an inline callback and an array of dependencies. `useCallback` will return a memoized version of the callback that only changes if one of the dependencies has changed. This is useful when passing callbacks to the optimized child components that rely on reference equality to prevent unnecessary renders.

On every render, everything that's inside a functional component will run again. If a child component has a dependency on a function from the parent component, the child will re-render every time the parent re-renders even if that function "doesn't change" (the reference changes, but what the function does won't).
It's used for optimization by avoiding unnecessary renders from the child, making the function change the reference only when dependencies change.

#### useMemo
`const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b])`

Pass a "create" function and an array of dependencies. `useMemo` will only recompute the memoized value (call that function) when one of the dependencies has changed. This optimization helps to avoid expensive calculations on every render. `useMemo` is similar to `useCallback` except it allows you to apply memoization to any value type, not just functions. `useCallback(fn, deps)` is equivalent to `useMemo(() => fn, deps)`.

Most of the time you should not bother optimizing unnecessary rerenders. React is very fast and the need to optimize stuff is so rare. **The reasons why `useCallback` and `useMemo` exist are referential equality and computationally expensive calculations**.

```js
// Referential equality
// {} === {} is false
// () => {} === () => {} is false
function Foo({bar, baz}) {
  React.useEffect(() => {
    const options = {bar, baz}
    buzz(options)
  }, [bar, baz])
  return <div>foobar</div>
}
function Blub() {
  const bar = React.useCallback(() => {}, [])
  const baz = React.useMemo(() => [1, 2, 3], [])
  return <Foo bar={bar} baz={baz} />
}

// Computationally expensive calculations
function RenderPrimes({iterations, multiplier}) {
  const primes = React.useMemo(() => calculatePrimes(iterations, multiplier), [
    iterations,
    multiplier
  ])
  return <div>Primes! {primes}</div>
}
```

#### useRef
`const refContainer = useRef(initialValue)` returns a mutable ref object whose `current` property is initialized to the passed argument. The returned object will persist for the full lifetime of the component. 

You might be familiar with refs primarily as a way to access the DOM. If you pass a ref object to `<div ref={refContainer} />`, React will set its `current` property to the corresponding DOM node. 

`useRef()` isn’t just for DOM refs. `useRef()` creates a plain JavaScript object which is a generic container whose `current` property is mutable and can hold any value. The only difference between `useRef()` and creating a `{current: ...}` object yourself is that `useRef` will give you the same ref object on every render. Mutating the `current` property doesn’t cause a re-render.

```js
// use `ref` to get the previous state
function Counter() {
  const [count, setCount] = useState(0);
  const prevCount = usePrevious(count);
  return <h1>Now: {count}, before: {prevCount}</h1>;
}

function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}
```

Every function inside the component (including event handlers, effects, timeouts or API calls) **captures the props and state from the render call that defined it**. If you intentionally want to read the latest state from some asynchronous callback, you could keep it in a `ref`, mutate it, and read from it.

```js
function Example(props) {
  // Keep latest props in a ref
  const latestProps = useRef(props);
  useEffect(() => {
    latestProps.current = props;
  });

  useEffect(() => {
    function tick() {
      // Read latest props at any time
      console.log(latestProps.current);
    }

    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
}
```

#### useLayoutEffect
The function passed to `useEffect` fires after layout and paint, during a deferred event. This makes it suitable for the many common side effects because most types of work shouldn’t block the browser from updating the screen.

However, not all effects can be deferred. For example, a DOM mutation that is visible to the user must fire synchronously before the next paint so that the user does not perceive a visual inconsistency. For these types of effects, React provides one additional Hook called `useLayoutEffect`. It has the same signature as `useEffect`, and only differs in when it is fired. Use `useLayoutEffect` to read layout from the DOM and synchronously re-render before the browser has a chance to paint. (Prefer the standard `useEffect` when possible to avoid blocking visual updates.)

#### Custom Hooks
Building your own Hooks lets you extract component logic into reusable functions. We don’t make any changes to the behavior but extract some common code between two components into a separate function.  

A custom Hook is a function whose name starts with "use" and that may call other Hooks. A custom Hook doesn’t need to have a specific signature. We can decide what it takes as arguments and what it should return. Every time you use a custom Hook, all state and effects inside of it are fully isolated.

Now function components can do more, it’s likely that the average function component in your codebase will become longer. This is normal — don’t feel like you have to immediately split it into Hooks. But we also encourage you to start spotting cases where a custom Hook could hide complex logic behind a simple interface.
