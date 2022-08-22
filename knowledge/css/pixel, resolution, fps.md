## Pixel, resolution, PPI
Pixel is the unit of measurement for digital images. **Resolution** is the number of pixels on a device found in each dimension (width × height) that can be displayed on the screen. For example, a device with the resolution of “1024 × 768” has a 1024-pixel width and a 768-pixel height. **Pixel Density** is usually measured in PPI (Pixels Per Inch), which refers to the number of pixels present per inch on the display. A higher pixel density per inch allows for more sharpness and clarity when using the device.

The Retina screen doubled the PPI while keeping the same screen size, meaning the number of pixels that fit into the same space had quadrupled (twice the number of pixels across and twice the number of pixels down). But all the old graphics had to be drawn at the same size on the higher density phone. If the phone had drawn all the graphics at a 1:1 scale like it did originally, everything would have been drawn at a quarter the size in the new screen. To prevent this, Apple started **using points as a way of separating the drawing of the graphics from the density of the screen they were on**. Points (abstract unit) are equal to different pixels based on PPI. On a standard-resolution screen, 1 point (1pt) is equivalent of 1 pixel (1px). High-resolution screens or Retina displays have a higher pixel density and as a result, 1 point is equal to 2 pixels across and 2 pixels down, or 4 total pixels.

> There is a distinction between the physical pixels in a screen and the software pixels we write in CSS. Every time a user changes their screen's resolution or zooms in, they're changing how software pixels map onto hardware pixels.

A standard resolution image has a scale factor of 1.0 and is referred to as an @1x image. High resolution images have a scale factor of 2.0 or 3.0 and are referred to as @2x and @3x images. Suppose you have a standard resolution @1x image that’s 100px by 100px, then the @2x version of this image would be 200px by 200px. The @3x version would be 300px by 300px. *(iPhone X, iPhone 8 Plus, iPhone 7 Plus, and iPhone 6s Plus = @3x; Retina displays and all other high-resolution iOS devices = @2x)*

There is another issue in the workplace. Look at the number of pixels in the PSDs. The @2x PSD has four times as many pixels. The @3x has nine times as many. Designers have been working @2x or @3x and then begin to spec their design for developers. The developers get a complete spec in which they need to divide everything by 2 or 3.

### Window.devicePixelRatio
The devicePixelRatio interface returns the ratio of the resolution in physical pixels to the resolution in CSS pixels for the current display device. This tells the browser **how many of the screen's actual pixels should be used to draw a single CSS pixel**. A value of 1 indicates a classic display, while a value of 2 is expected for Retina displays. Other values may be returned as well in the case of when a screen has a higher pixel density than simply double the standard resolution.

```javascript
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Set display size (css pixels)
const size = 200;
canvas.style.width = size + "px";
canvas.style.height = size + "px";

// Set actual size scaled to pixel density
const scale = window.devicePixelRatio;
canvas.width = Math.floor(size * scale);
canvas.height = Math.floor(size * scale);
```

```css
/*
The -webkit-device-pixel-ratio is a non-standard CSS media feature which is an alternative to the standard resolution media feature.
*/
@media (-webkit-device-pixel-ratio: 1) {}
@media (-webkit-min-device-pixel-ratio: 2) {}
@media (-webkit-max-device-pixel-ratio: 3) {}

@media (resolution: 150dpi) {}
@media (min-resolution: 72dpi) {}
@media (max-resolution: 300dpi) {}

/* 
`image-set()` method lets the browser pick the most appropriate CSS image from a given set, primarily based on pixel density of the screen and image type.
*/
background-image: image-set("cat.png" 1x, "cat-2x.png" 2x);
```

## requestAnimationFrame
The smoothness of an animation depends on the frame rate of the animation. Frame rate is measured in **frames per second (fps)**. More frames, means more processing, which can often cause skipping. This is what is meant by the term **dropping frames**. Most screens have a refresh rate of 60Hz (`1000ms / 60fps = 16.7ms`), it’s useless to perform a repaint if the screen cannot show it due to its limitations.

```js
// normal refresh rate
let last = Date.now();
requestAnimationFrame(function cb() {
  console.log("time passed from the last frame:", Date.now() - last);
  last = Date.now();
  requestAnimationFrame(cb);
});

// long task
document.addEventListener("click", function () {
  let now = Date.now();
  requestAnimationFrame(() => console.log("time passed from the last frame:" + (Date.now() - now)));
  while (Date.now() < now + 1000);
});
```

> If you often use DevTools to debug performance problems, you will find that most of the obvious performance issues are caused by the codes we write in event handlers, not the repaint or reflow that are often asked in interviews.

What’s wrong with creating animations using `setTimeout` or `setInterval`? First, the browser might be busy performing other operations, and the `setTimeout` calls might not make it in time for the repaint, and it’s going to be delayed to the next cycle. This is bad because we lose one frame, and in the next cycle the animation is performed 2 times, causing the eye to notice the awkward animation. Second, the tab is being hidden, or the animation itself could have been scrolled off the page making the update call unnecessary. Chrome does throttle `setInterval` and `setTimeout` to max 1 execution per second in hidden tabs, but this isn’t to be relied upon for all browsers.

`requestAnimationFrame` is a native API for running any type of animation in the browser. (Browser vendors have decided, *“hey, why don’t we just give you an API for that, and we can probably optimize some things for you.”* So it’s a basic API using for animation, whether that be DOM-based styling changes, canvas or WebGL) You don’t need to specify an interval rate, and that all depends on the frame rate of the browser, typically it’s 60fps. **The key difference here is that you are requesting the browser to draw your animation at the next available opportunity, not at a predetermined interval**. It has also been hinted that browsers could choose to optimize performace based on element visibility and battery status, causing animations to stop if the current window is not visible. Using `requestAnimationFrame`, it will group all of your animations into a single repaint, and all the animation code runs before the rendering and painting event.

```javascript
var globalID;

function repeatOften() {
  $("<div>").appendTo("body");
  globalID = requestAnimationFrame(repeatOften);
}

globalID = requestAnimationFrame(repeatOften);

$("#start").on("click", function() {
  cancelAnimationFrame(globalID);
  globalID = requestAnimationFrame(repeatOften);
});

$("#stop").on("click", function() {
  cancelAnimationFrame(globalID);
});
```

## Animations Overview
Modern browsers can animate two CSS properties cheaply: `transform` and `opacity`. If you animate anything else, the chances are you're not going to hit a silky smooth 60 frames per second.

To display something on a webpage the browser has to go through the following sequential steps, and these four steps are known as the browser's **rendering pipeline**.

1. Style: Calculate the styles that apply to the elements.
2. Layout: Generate the geometry and position for each element.
3. Paint: Fill out the pixels for each element into layers.
4. Composite: Draw the layers to the screen.

When you animate something on a page that has already loaded these steps have to happen again. For example, if you animate something that changes layout, the paint and composite steps also have to run again. Animating something that changes layout is therefore more expensive than animating something that only changes compositing.

By placing the things that will be animated or transitioned onto a new layer, the browser only needs to repaint those items and not everything else. Browsers will often make good decisions about which items should be placed on a new layer, but you can manually force layer creation with the `will-change` property. However, creating new layers should be done with care because each layer uses memory.

**Hardware acceleration** is a general term for offloading CPU processes onto another dedicated piece of hardware. In the world of CSS transitions, transforms, and animations, it implies that we’re offloading the process onto the GPU, and hence speeding it up. This occurs by pushing the element to a layer of its own, where it can be rendered independently while undergoing its animation.

1. Hardware-accelerated layer compositing is enabled in the browser.
2. Only compositing CSS properties (`opacity`, `transform: translate / scale / rotate`, etc) are acceleratable.
3. The element has been given its own compositing layer. (it may be forced by using a "go faster" hack like `transform: translate3d`)

## Fluid Typography

```css
html {
  font-size: 16px;
}
@media screen and (min-width: 320px) {
  html {
    font-size: calc(16px + 6 * ((100vw - 320px) / 680));
  }
}
@media screen and (min-width: 1000px) {
  html {
    font-size: 22px;
  }
}
```

That would scale `font-size` from a minimum of 16px (at a 320px viewport) to a maximum of 22px (at a 1000px viewport). So rather than always being the same size, or jumping from one size to the next at media queries, the size can be fluid based on the size of the screen. Here’s the math:

```css
font-size: calc([minimum size] + ([maximum size] - [minimum size]) * ((100vw - [minimum viewport width]) / ([maximum viewport width] - [minimum viewport width])));
```

Despite the amount of the required boilerplate, this approach became so popular for handling fluid sizing in general, and it became clear that a more streamlined approach was needed. This is where the CSS clamp function comes in.

CSS `clamp` function takes three values — a minimum bound, preferred value, and a maximum bound. The preferred value usually includes viewport units, percentages, or other relative units to achieve the fluid effect.

```css
font-size: [value-fallback];
font-size: clamp([value-min], [value-preferred], [value-max]);

html {
  font-size: 16px;
  /* 375px -> 414px */
  font-size: clamp(16px, calc(16px + 2 * (100vw - 375px) / 39), 22px);
}
```

### Strategic unit deployment
Changing the default font size in our [browser settings](https://support.google.com/chrome/answer/96810) will redefine the default font size that all relative units will be based on (rem, em, %). When we use a pixel value for a font-size, it will no longer be affected by the user's chosen default font size. When the user zooms in or out, it essentially applies a multiple to every unit, including pixels. 

So asking yourself: “Should this value scale up as the user increases their browser's default font size?” If the value should increase with the default font size, use `rem`. Otherwise, use `px`.
