## Container Queries
Instead of relying on the viewport for styling input such as available space, developers now have the ability to query the size of in-page elements too. This capability means that a component owns its responsive styling logic.

To build with container queries, you must first set containment on a parent element. Do this by setting a `container-type` on the parent container. Say you might have a card with an image and some text content, setting the `container-type` to `inline-size` queries the inline-direction size of the parent which is the width of the card. Then we can use that container to apply styles to any of its children using `@container`.

```html
<div class="container">
  <div class="card">
    <div class="visual">🚀</div>
    <div class="meta">
      <h1>Rocket</h1>
      <p class="desc">some text here</p>
    </div>
  </div>
</div>
```

```css
.container {
  container-type: inline-size;
}

.card {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

@container (max-width: 400px) {
  .card {
    grid-template-columns: 1fr;
  }
}
```

## The `:has()` parent selector
The CSS `:has()` pseudo-class enables developers to check if a parent element contains children with specific parameters. For example, `p:has(span)` indicates a paragraph selector, which has a `span` inside of it. You can use this to style the parent paragraph itself, or style anything within it.

Let’s expand on the example with the rocket card. What if you had a card without an image? Maybe you want to increase the size of the title and adjust the grid layout to single column so that it looks more intentional without the image.

```css
.card:has(.visual) {
  grid-template-columns: 1fr 1fr;
}

.card:not(:has(.visual)) h1 {
  font-size: 4rem;
}
```

Both of container queries and `:has()` are **landing together in Chromium 105**. 

## Individual transform properties

```css
.target {
  transform: translateX(50%) rotate(30deg) scale(1.2);
}
```

The targeted element is translated by 50% on the X-axis, rotated by 30 degrees, and finally scaled up to 120%.

While the `transform` property does its work just fine, it becomes a bit tedious when you want to alter any of those values individually. To change the scale on hover, you must duplicate all functions in the `transform` property, even though their values remain unchanged.

**Shipping with Chrome 104** are individual properties for CSS transforms. The properties are `scale`, `rotate`, and `translate`, which you can use to individually define those parts of a transformation. By doing so, Chrome joins Firefox and Safari which already support these properties. (Supported in all browser engines!)

```css
.target {
  translate: 50% 0;
  rotate: 30deg;
  scale: 1.2;
}
```

With the individual transformation properties, the order is not the order in which they are declared. The order is always the same: first `translate`, then `rotate`, and then `scale`.
