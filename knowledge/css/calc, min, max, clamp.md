## calc()
`calc()` has a wide range of uses for any time you'd like to be able to do client-side math within your styles. For example, you may want something to take up most of the viewport height except the height of the navigation. For this purpose, you can mix units to pass a relative `vh` unit with an absolute pixel unit: `height: calc(100vh - 60px)`. As the viewport resizes or a user visits on larger or smaller devices, the value of `100vh` will dynamically update, and therefore so will the calculation.

The benefit of `calc()` is in allowing you to avoid either hard-coding a range of magic numbers or adding a JavaScript solution to calculate the value needed to apply it as an inline style.

## min()
> The `ch` unit is equal to the width of the `0` character given all current font properties at the time it is applied. This makes it an excellent choice for approximating line length for a better reading experience.

Given `width: min(80ch, 100vw - 2rem)`, the outcome is that on larger viewports, the element can grow to a max of `80ch`, and once the viewport shrinks below that width, it will be allowed to grow to `100vw - 2rem`. This definition effectively produces `1rem` of "padding" on either side of the element. (This is my preferred way to define a `.container` class.)

Any time you would like to size an element responsively, `min()` can be a great choice. Consider the following example, where `min()` is used to ensure the image doesn't exceed `600px` while being allowed to respond down with the element by also setting `100%`. In other words, it will grow up to `600px` and then resize itself down to match the element's width when it is less than `600px`.

```css
.background-image {
  background: #1F1B1C url(...) no-repeat center;
  background-size: min(600px, 100%);
}
```

## max()
Given `margin-top: max(8vh, 2rem)`. On the taller viewports, `8vh` will be used, and on smaller viewports, `2rem` will be used. It gives us one way to handle margins more gracefully, which allows relative growth for tall viewports and reduces distance for shorter viewports. (I prefer `rem` for smaller spaces, but for larger spaces intended to separate content sections.)

Have you ever experienced forced browser zoom once you focused a form input on iOS? This consequence will happen for any input that has a `font-size` less than `16px`. Here's the fix which ensures that the `font-size` will be at least `16px` and therefore prevent the forced browser zoom.

```css
input {
  font-size: max(16px, 1rem);
}
```

> Practical purpose of `min()` and `max()`: `min()` is setting boundaries on the *maximum* allowed value in a way that encompasses the responsive context of an element, whereas `max()` are setting up definitions for the *minimum* allowed values.

## clamp()
The `clamp()` function takes three values, and order matters. The first is the lowest value in your range, the middle is your ideal value, and the third is the highest value in your range.

An area you may have already encountered the use of `clamp()` is for fluid typography. The essential concept is that the `font-size` value can fluidly adjust based on the viewport size: `font-size: clamp(1rem, 2.5vw, 2rem)`.

Another example is responsive padding. The interesting thing about using percentages for padding is that it is relative to the element's width. Given `padding: clamp(1rem, 5%, 3rem)`, where the padding will grow and shrink relative to the element's width. It will never be less than `1rem`, and never greater than `3rem`. (You may have realized this removes some scenarios where you might have previously reached for media queries.)

### New syntax for range media queries
Media Queries enabled responsive design, and the range features that enable testing the minimum and maximum size of the viewport are used by around 80% of sites that use media queries. e.g., `@media (min-width: 400px) { ... }`.

The new syntax makes media queries less verbose, and has been available in Firefox since Firefox 63, and will be available in Chrome from 104.

```css
@media (width >= 400px) {
  /* Styles for viewports with a width of 400 pixels or greater. */
}

@media (400px <= width <= 600px )  {
  /* Styles for viewports between 400px and 600px. */
}
```
