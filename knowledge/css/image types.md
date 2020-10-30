## Image file types
First, there are two types of compression: Lossless and Lossy.
- **Lossless** means that the image is made smaller, but at no detriment to the quality. You can save the image over and over and never lose any data.
- **Lossy** means the image is made (even) smaller, but at a detriment to the quality. If you saved an image in a Lossy format over and over, the image quality would get progressively worse and worse.

There are also different color depths: Indexed color and Direct color.
- **Indexed** means that the image can only store a limited number of colors (usually 256).
- **Direct** means that you can store millions of colors. The term "true color" is sometimes used to mean direct color. It is also often used to refer to all color depths greater or equal to 24.
  
Then, there are differences between bitmap and vector images.
- **Bitmap (or raster)** images are stored as a series of pixels. Each pixel is actually a very small square that is assigned a color, and then arranged in a pattern to form the image. When you zoom in on a bitmap image you can see the individual pixels that make up that image.
- **Vector** images are not based on pixel, but instead use mathematical formulas to draw lines and curves that can be combined to create an image. When a vector image is scaled up, the image is re-drawn using the mathematical formula, so the resulting image is just as smooth as the original.

### BMP
BMP is an old format. It is lossless but there's also little to no compression at all, meaning saving as BMP results in very large file sizes. It could be both indexed and direct, but the file sizes are so unnecessarily large that nobody ever really uses this format.

### GIF
GIF uses lossless compression. The file sizes are much smaller than BMP, because good compression is actually used, but it can only store an indexed color depths. This means that for most use cases, there can only be a maximum of 256 different colors in the file. GIF images can also be animated and have transparency.

### JPEG
JPEG images were designed to make detailed photographic images as small as possible by removing information that the human eye won't notice. As a result it's a lossy format. It stores direct color depth and so is great for photographs, but the lossy compression means it's bad for logos and line drawings: Not only will they look fuzzy, but such images will also have a larger file-size compared to GIFs.

### PNG-8 
PNG-8 (the indexed version of PNG) is really a good replacement for GIFs. It is also lossless. However, it cannot support animation like GIFs, and it has some support issues with very old browsers. The main thing that PNG-8 does better than GIFs is having support for alpha-transparency.

### PNG-24
PNG-24 is a great format that combines lossless encoding with direct color. Unfortunately PNG-24 files will still be bigger than JPEGs (for photos), and GIFs/PNG-8s (for logos and graphics). They are not intended to replace JPEG images. A photograph saved as a PNG-24 will likely be at least 5 times larger than a equivalent JPEG image, with very little improvement in visible quality. Just like PNG-8, PNG-24 supports alpha-transparency too.

### SVG
SVG is different than all the above in that it's a vector file format (the above are all raster). This means SVG is perfect for logos and icons you wish to retain sharpness on Retina screens or at different sizes. It also means a small SVG logo can be used at a much larger size without degradation in image quality. SVG file sizes are often tiny, even if they're visually very large, which is great. However, it does depend on the complexity of the shapes used, and SVGs require more computing power than raster images because mathematical calculations are involved in drawing the curves and lines.
