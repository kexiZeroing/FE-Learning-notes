## Debugging CSS

- Vertical padding and margin doesn’t work for inline elements. You would have to change the element’s `display` property to `inline-block` or `block`.

- `input`, `video`, `img`, `iframe`, `embed` are replaced elements whose width and height are predefined, without CSS. `iframe` has the default width `300px` and height `150px`.

- When an element has a `position` value of `absolute`, it becomes a block-level element by default. This means that adding `inline-block` or `block` as the display type won’t affect it at all.

- When you apply a `float` to an element with a display type of `flex` or `inline-flex`, it won’t affect the element at all.

- Say you have two elements, the one above with `margin-bottom`, and the one below with `margin-top`. The greater of the two values will be used as the margin between the elements, and the other will be ignored by the browser.

- `margin: auto` is a popular way to center an element, and it’s important to mention that it only works with block-level elements.

- Fixed width is not recommended. Using `max-width` is better because it will prevent the element from being wider than the viewport.

- You can’t set a percentage-based height for an element unless the height of its parent is explicitly defined. You can use `body { height: 100vh }` to make the `body` element take up the full height of the viewport.

- Some properties will trigger a new stacking context. They include a `position` value other than `static`, `opacity`, `transform`, `filter`, `perspective`. When `z-index` is not behaving as expected, check whether any properties have triggered a new stacking context.

- The `::before` pseudo-element becomes the first child of its parent, whereas
`::after` is added as the last child. The default display value of a pseudo-element is `inline`. So when you add a width, height, vertical padding or vertical margin, it won’t work unless the `display` type is changed.

- By default, the `color` property is inherited by child elements such as `p` and `span`. Instead of setting the color property on each element, add it to the `body`, and then all `p` and `span` elements will inherit that color. However, the `a` element doesn’t inherit `color` by default. You can override its color or use the `inherit` keyword.

- A common mistake when showing a border on hover is to add the border only on hover. If the border is 1 pixel, then the element will jump by that much when the user hovers over it. To avoid the jump, add the border to the normal state with a transparent color.

- A `border-width` that works for laptop or desktop screens might be too big for mobile. We can use CSS comparison function that respond to screen size without having to use a media query: `border: min(1vw, 10px) solid #eee`.

- Unlike border, `outline` is drawn outside the element's border and may overlap other content. Also, the outline is not a part of the element's dimensions; the element's total width and height is not affected by the width of the outline. You can override it with a custom one, but don’t remove that outline under any circumstances, because it will affect the accessibility of the website.

```css
/* debug your CSS layouts with one line */
* {
  outline: 1px solid #f00 !important;
}
```

- Find element that is causing the showing of horizontal scrollbar.

```js
var all = document.getElementsByTagName("*"),
    i = 0, 
    rect,
    docWidth = document.documentElement.offsetWidth;
for (; i < all.length; i++) {
  rect = all[i].getBoundingClientRect();
  if (rect.right > docWidth || rect.left < 0){
    console.log(all[i]);
    all[i].style.outline = '1px solid red';
  }
}
```

- A long word or link can easily cause horizontal overflow (scrolling). The solution is to use `overflow-wrap: break-word`. It’s worth mentioning that the property has been renamed from `word-wrap` to `overflow-wrap`.

- For `text-overflow: ellipsis` to work, the element’s `display` type should be set to `block` and the element must have the `overflow: hidden` and `white-space: nowrap` set.

- Flexbox doesn’t wrap by default, thus may cause horizontal scrolling. Always make sure to add `flex-wrap: wrap`. By default, flexbox stretch its child items to make them equal in height if the direction is set to `row`, and it makes them equal in width if the direction is set to `column`.

- Each flex item has a `flex-basis` property, which acts as the sizing property for that item. When the value is `flex-basis: auto`, the basis is the content’s size. With `.item { flex-grow: 1; flex-basis: 0%; }`, each child item will take up the same space as its siblings.

- How we compare a design against implementation? We can take the original design as an image and place it above the page in the browser. Thanks to CSS backgrounds and pseudo-elements, this is possible. Please make sure that the browser width is equal to the design width and no other element in the same stacking context has a higher `z-index` than the pseudo-element. Also, you will notice that nothing is hoverable or clickable, that’s because the pseudo-element is covering the page. We can allow interactivity by setting `pointer-events: none` (the specified HTML element is never the target of pointer events).

  > The prime use case for `pointer-events` is to allow click or tap behavior to “pass through” an element to another element below it on the Z axis. For example, this would be useful for graphic overlays, or hiding elements with opacity and still allowing text-selection on the content below it.

```css
body {
    position: relative;
}

body:after {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    z-index: 100;
    width: 100%;
    height: 100%;
    background-image: url('example.png');
    background-size: 100% auto;
    background-repeat: no-repeat;
    opacity: 0.5;
    pointer-events: none;
}
```

- The key realization I had is that CSS is so much more than a collection of properties. CSS properties on their own are meaningless. It's up to the layout algorithm to define what they do, how they're used in the calculations.
  - `z-index` property is not implemented in the Flow layout; Flexbox algorithm implements the `z-index` property.
  - In the Flexbox algorithm, `width` is more of a suggestion. (It's that the Flexbox algorithm implements the `width` property in a different way than the Flow algorithm.)
  - Flow layout is designed for documents, similar to word-processing software.
  - Inline elements are meant to be used in the middle of paragraphs, not as part of the layout. For example, maybe we want to add a little icon to the middle of a sentence.
  - The Flow layout algorithm is treating `<image>` as if it was a character in a paragraph, and adding a bit of space below to ensure it isn't uncomfortably close to the characters on the next line of text. ("inline magic space": **Because images are inline elements by default!**)

- You can add infinite borders using `box-shadow` if you want to apply multiple borders on one div. `box-shadow` is described by X and Y offsets relative to the element, blur and spread radius, and color. You can set multiple effects separated by commas.

```css
/* <img src="https://www.w3schools.com/howto/img_avatar.png" alt="Avatar"> */
img {
  margin: 40px;
  width: 90px;
  border-radius: 50%;
  /* box-shadow: x-offset y-offset blur spread color */
  box-shadow:
    0 0 0 10px #817dd1,
    0 0 0 20px #5c58aa,
    0 0 0 30px #3d3a84,
    0 0 0 40px #211f56;
}
```

- A simple example of how to stick an element to the bottom of a page in case the window was too big in height. But still be part of the flow of the page if there was not enough screen size. (using Tailwind CSS)

```html
<html>
  <!-- set the minimum height to the screen-->
  <body class="text-center min-h-screen flex flex-col">
    <p class="flex-grow">test</p>
    <p>&copy; 2022</p>
  </body>
</html>
```

- Example of using `:has()` pseudo-class (will be supported in Chrome 105)
```css
/* 5 or more items display next to each other */
ul:has(:nth-child(n + 5)) li {
  display: inline;
}

/* Adds semicolon after each item except the last item */
ul:has(:nth-child(n + 5)) li:not(:last-child)::after {
  content: ';';
}
```

- `position:sticky` not working
  1. In order for the sticky element to function correctly, it needs to have at least one of it's `top`, `right`, `left`, or `bottom` placement properties set.
  2. If the sticky element has a parent with `overflow: hidden`, `overflow: auto`, or `overflow: scroll`, then `position: sticky` will not work properly.
  3. The sticky element will not have a place to stick if the parent's `height` property is not set.

- Elements are grouped into **stacking contexts**. When we give an element a `z-index`, that value is only compared against other elements in the same context. `z-index` values are not global. By default, a plain HTML document will have a single stacking context that encompasses all nodes. But there are many ways to create stacking contexts, e.g., combining relative or absolute positioning with `z-index`; Setting position to `fixed` or `sticky` (No `z-index` needed for these values); Setting `opacity` to a value less than 1; Adding a `z-index` to a child inside a `display: flex` or `display: grid` container; Using `transform`, `filter`, `clip-path`, or `perspective`.

- `:nth-child()` and `:nth-last-child()` pseudo-class matches elements based on their position among a group of siblings. Element indices are 1-based.
  - `tr:nth-child(odd)` or `tr:nth-child(2n+1)` represents the odd rows: 1, 3, 5, etc.
  - `tr:nth-child(even)` or `tr:nth-child(2n)` represents the even rows: 2, 4, 6, etc.
  - `:nth-child(5n)` represents elements 5, 10, 15, etc.
  - `:nth-child(n+7)` represents elements 7, 8, 9, etc.
  - `:nth-child(-n+3)` represents the first three elements. [=-0+3, -1+3, -2+3]
  - `:nth-last-child(5n)` represents elements 5, 10, 15, etc., counting from the end.
  - `:nth-last-child(3n+4)` represents elements 4, 7, 10, 13, etc., counting from the end.
  - `:nth-last-child(-n+3)` represents the last three elements among a group of siblings.

- Position `fixed` doesn’t work with `transform` CSS property. It happens because transform creates a new coordinate system and your `position: fixed` element becomes fixed to that transformed element.
