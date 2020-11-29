## Grid layout
Grid is the most powerful layout system available in CSS. It is a 2-dimensional system, meaning it can handle both columns and rows, unlike flexbox which is largely a 1-dimensional system.

### Getting Started
The first step is to add `display: grid` to the parent element. Now every item inside this wrapper will be a grid item. The child items won’t be affected by that, at least we need to define the number of columns we want. By using `grid-template-columns`, we can define how many columns we want, each value is representing a column. To add a space between the items, we can use `grid-column-gap` and `grid-row-gap` to achieve that.

```css
.wrapper {
  display: grid;
  grid-template-columns: 200px 200px 200px;
  grid-template-rows: 100px 100px;
  grid-column-gap: 10px;
  grid-row-gap: 10px;
}
```

- We can divide the columns using `fr` unit which stands for **fraction**. By using it we are using something similar to percentages in CSS. For example, we have 3 columns and each one of them has a width of `1fr`, so each one will take `33%` width from the wrapper.

- There is a concept of **grid lines** for both columns and rows. They're the dividing lines that make up the structure of the grid. For example, we have 3 lines, starting from the top, middle and at the bottom. `grid-row: 1 / 3` means the item should take space from horizontal line 1 to line 3.

- Grid cell is a single unit of the grid. A **grid area** may be composed of any number of grid cells. We can name the areas and use the names to layout different elements by using `grid-template-areas` property.

- When we have a certain columns number to **repeat**, we can use a handy notation `repeat()` that make it easier for us. For example, `grid-template-columns: 100px 100px 100px 100px 100px;` can be replaced by `grid-template-columns: repeat(5, 100px);`

### Example 1
<img alt="grid-1" src="https://ftp.bmp.ovh/imgs/2020/11/fab4ce4cce20ebe9.jpg" width="600">

```css
.wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-gap: 10px;
}

.item:first-child {
  grid-column-start: 1;
  grid-column-end: 3;
  /* 
  grid-column: 1 / 3;  /* as a shorthand */
  /*
}
```

### Example 2
<img alt="grid-2" src="https://ftp.bmp.ovh/imgs/2020/11/ef81e99bcb651471.jpg" width="600">

```html
<form>
  <p>
    <label for="first-name">First Name:</label>
    <input type="text" id="first-name">
  </p>
  <p>
    <label for="last-name">Last Name:</label>
    <input type="text" id="last-name">
  </p>
  <p>
    <label for="email">Email Address:</label>
    <input type="email" id="email">
  </p>
  <p>
    <label for="password">Password:</label>
    <input type="password" id="password">
  </p>
  <p>
    <button>Sign up for free</button>
  </p>
</form>
```

```css
form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 16px;
}

.item:last-child {
  grid-column: 1 / 3;
}
```

### Example 3
<img alt="grid-3" src="https://ftp.bmp.ovh/imgs/2020/11/fa88160c90f5a38f.jpg" width="600">

This time we don’t need to wrap labels and fields in a `<p>` element. Grid layout can align them for us.

```html
<form>
  <label for="first-name">First Name:</label>
  <input type="text" id="first-name">

  <label for="last-name">Last Name:</label>
  <input type="text" id="last-name">

  <label for="email">Email Address:</label>
  <input type="email" id="email">

  <label for="password">Password:</label>
  <input type="password" id="password">

  <button>Sign up for free</button>
</form>
```

```css
form {
  display: grid;
  grid-template-columns: 1fr 2fr;
  grid-gap: 16px;
}

button {
  grid-column: 2 / 3;
}
```

### Example 4
<img alt="grid-4" src="https://ftp.bmp.ovh/imgs/2020/11/0bda5b12d4ae8ce3.jpg" width="600">

```html
<div class="wrapper">
  <header>Header</header>
  <main> ... </main>
  <aside>Aside</aside>
  <footer>Footer</footer>
</div>
```

```css
.wrapper {
  display: grid;
  grid-template-columns: 8fr 4fr;
  grid-template-areas: "header header"
                       "main aside"
                       "footer footer";
}

header {
  grid-area: header;
}

footer {
  grid-area: footer;
}

main {
  grid-area: main;
}

aside {
  grid-area: aside;
}
```

### Example 5
<img alt="grid-5" src="https://ftp.bmp.ovh/imgs/2020/11/1ce7998fe7bb5211.png" width="600">

```html
<ul>
  <li><a href="#"><img src="avatar.jpg" alt="" /></a></li>
  <li><a href="#">About</a></li>
  <li><a href="#">Works</a></li>
  <li><a href="#">Projects</a></li>
  <li><a href="#">Contact</a></li>
</ul>
```

```CSS
ul {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
}

li {
  align-self: center;
}

li:first-child {
  grid-column: 3 / 4;
}
```

### Alignment
We can align all grid items inside the container. `justify-items` aligns grid items along the row axis. `align-items` aligns grid items along the column axis. `stretch` (fills the whole width or height of the cell) is the default value. This behavior can also be set on individual grid items via the `justify-self` and `align-self` property.  

<img alt="grid-justify-items" src="https://cdn.nlark.com/yuque/0/2019/png/398686/1563708047392-2bcc8488-8f93-4246-8529-5703e966d18e.png" width="600">

Sometimes the total size of the grid might be less than the size of its grid container. This could happen if all of the grid items are sized with non-flexible units like `px`. In this case you can set the alignment of the grid within the grid container. `justify-content` aligns the grid along the row axis. `align-content` aligns the grid along the column axis.  

<img alt="grid-justify-content" src="https://cdn.nlark.com/yuque/0/2019/png/398686/1563708186116-cb4bfed5-8010-412e-86b1-d42967249d90.png" width="800">
