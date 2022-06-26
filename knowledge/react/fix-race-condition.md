## Race condition with useEffect

When fetching data with useEffect, you notice something strange: sometimes the component displays correct data, and sometimes it's invalid, or out of date. You would typically notice a race condition in React when two slightly different requests for data have been made, and the application displays a different result depending on which request completes first.

### useEffect Clean-up Function with Boolean Flag
If a component renders multiple times (as they typically do), the previous effect is cleaned up before executing the next effect. You'll still have a race-condition in the sense that multiple requests will be in-flight, but this time only the results from the last one will be used.

```jsx
useEffect(() => {
  let active = true;

  const fetchData = async () => {
    setTimeout(async () => {
      const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${props.id}/`);
      const newData = await response.json();
      if (active) {
        setData(newData);
      }
    }, Math.round(Math.random() * 12000));
  };

  fetchData();
  return () => {
    active = false;
  };
}, [props.id]);
```

### useEffect Clean-up Function with AbortController
As with the previous example, we use the fact that React runs the clean-up function before executing the next effect. This time we drop support for Internet Explorer/use a polyfill, in exchange for the ability to cancel in-flight HTTP requests (avoid wasting user bandwidth).

```jsx
useEffect(() => {
  const abortController = new AbortController();

  const fetchData = async () => {
    setTimeout(async () => {
      try {
        const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${props.id}/`, {
          signal: abortController.signal,
        });
        const newData = await response.json();

        setData(newData);
      } catch (error) {
        if (error.name === 'AbortError') {
          // Aborting a fetch throws an error, so we can't update state afterwards
        }
        // Handle other request errors here
      }
    }, Math.round(Math.random() * 12000));
  };

  fetchData();
  return () => {
    abortController.abort();
  };
}, [props.id]);
```
