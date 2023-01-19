## Learn about Next.js 13

If you create a Next 13 app today, you won't see any of the new React 18 enabled features. And that's because they aren't there... All the new `app` directory is experimental. But there's a lot to explore. We have [new beta docs](https://beta.nextjs.org/docs/getting-started) and a flag that will generate an experimental app with a basic scaffold: `npx create-next-app@latest --experimental-app`

A Next.js 13 app router crash course: https://www.youtube.com/watch?v=zdyftlnWm-E
- ​Create an experimental-app (beta) Next app​
- Define routes with the new `/route/page.jsx` convention​
- Control `<head>` tags with `head.jsx​`
- ​Create client components with the "use client" directive​
- Apply cascading layouts with `layout.jsx` files​
- Use route groups to organize files without impacting URLs

Next's special files for async pages: https://www.youtube.com/watch?v=rYPX_9Qs968
- ​Fetch data in async components​
- ​Render and trigger `loading.jsx​`
- Render and trigger `error.jsx`
- Log errors to error reporting services​
- Render and trigger `not-found.jsx​`
- Understanding why file system routing is important for nested routes​

Building our first Next 13 (beta) app: https://www.youtube.com/watch?v=wcPymhSyoxY
- Capturing url data with dynamic segments​
- Nesting layouts without changing page structure
- Prefetch the page in the background with next/link
- Optimizing images with next/image​
- Demo at https://github.com/chantastic/next-pokedex
