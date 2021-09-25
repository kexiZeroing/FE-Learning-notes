## Debugging CSS

- Vertical padding and margin doesn’t work for inline elements. You would have to change the element’s `display` property to `inline-block` or `block`.

- `input`, `video`, `img`, `iframe`, `embed` are replaced elements whose width and height are predefined, without CSS.

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

- A long word or link can easily cause horizontal overflow (scrolling). The solution is to use `overflow-wrap: break-word`. It’s worth mentioning that the property has been renamed from `word-wrap` to `overflow-wrap`.

- For `text-overflow: ellipsis` to work, the element’s `display` type should be set to `block` and the element must have the `overflow: hidden` and `white-space: nowrap` set.

- Flexbox doesn’t wrap by default, thus may cause horizontal scrolling. Always make sure to add `flex-wrap: wrap`. By default, flexbox stretch its child items to make them equal in height if the direction is set to `row`, and it makes them equal in width if the direction is set to `column`.

- Each flex item has a `flex-basis` property, which acts as the sizing property for that item. When the value is `flex-basis: auto`, the basis is the content’s size. With `.item { flex-grow: 1; flex-basis: 0%; }`, each child item will take up the same space as its siblings.
