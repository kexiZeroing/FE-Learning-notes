## String
### string primitives and String objects
Note that JavaScript distinguishes between String objects and primitive string values (The same is true of Boolean and Numbers). In contexts where a method is to be invoked on a primitive string or a property lookup occurs, JavaScript will **automatically wrap the string primitive and call the method or perform the property lookup**. A String object can always be converted to its primitive counterpart with the `valueOf()` method.

### Template literals (Template strings)
```javascript
`string text ${expression} string text`

// Multi-line string
// newline characters inserted in the source are part of the template literal
console.log(`string text line 1
string text line 2`);
// "string text line 1
// string text line 2"

// nested template literals
const classes = `header ${ isLargeScreen() ? '' :
 `icon-${item.isCollapsed ? 'expander' : 'collapser'}` }`;
```

A more advanced form of template literals are **tagged templates**. Tags allow you to parse template literals with a function, which you can **manipulate before outputting**. The first argument is a string array containing string literals from the template: First element in the array is string starting from index 0 to the first interpolated value, second element is string after first interpolated value to next interpolation and so on until end of template is reached. All the interpolated expressions are evaluated and passed to the tag as second argument in order of their occurrence. In the end, your function can return your manipulated string or it can return something completely different.

The special `raw` property, **available on the first argument to the tag function**, allows you to access the raw strings as they were entered, without processing escape sequences.

```javascript
var person = 'Mike';
var age = 28;

function myTag(strings, ...keys) {
  var str0 = strings[0]; // "That "
  var str1 = strings[1]; // " is a "
  var str2 = strings[2]; // There is an empty string after the final expression
 
  var ageStr = keys[1] > 99 ? 'centenarian' : 'youngster';
  
  return `${str0}${keys[0]}${str1}${ageStr}`;
}

var output = myTag`That ${ person } is a ${ age }`;
console.log(output);  // That Mike is a youngster

// raw property
function tag(strings) {
  console.log(strings[0]);     // escape \n to a new line
  console.log(strings.raw[0]); // include \n in the string
}
tag`string text line 1 \n string text line 2`;
```

### String.prototype.match() / matchAll()
It **returns an Array** whose contents **depend on the presence or absence of the global (g) flag**, or null if no matches are found.
- If the `g` flag is used, all results matching the complete regular expression will be returned, but capturing groups will not.
- If the `g` flag is not used, only the first complete match and its related capturing groups are returned. In this case, the returned item will have additional properties (groups, index, input).
- If regexp is a non-RegExp object, it is implicitly converted to a RegExp by using `new RegExp(regexp)`. If you don't give any parameter, you will get an Array with an empty string `[""]`.

```javascript
const str = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const regexp = /[A-E]/gi;
str.match(regexp);
// ['A', 'B', 'C', 'D', 'E', 'a', 'b', 'c', 'd', 'e']

const str = 'For more information, see Chapter 3.4.5.1';
const re = /see (chapter \d+(\.\d)*)/i;
str.match(re);
// logs [ 'see Chapter 3.4.5.1',
//        'Chapter 3.4.5.1',
//        '.1',
//        index: 22,
//        input: 'For more information, see Chapter 3.4.5.1' ]
```

Using `matchAll` method, you get an **iterator** to use with the more convenient `for...of`, array spread, or Array.from() constructs. Capture groups are ignored when using `match()` with the global flag, but with `matchAll` you can access them. **`matchAll` will throw an error if the `g` flag is missing**.

```javascript
let regexp = /t(e)(st(\d?))/g;
let str = 'test1test2';

str.match(regexp); 
// ['test1', 'test2']

let matches = [...str.matchAll(regexp)];
matches[0];
// ['test1', 'e', 'st1', '1', index: 0, input: 'test1test2']
matches[1];
// ['test2', 'e', 'st2', '2', index: 5, input: 'test1test2']
```

### String.prototype.replace() / replaceAll()
It returns a new string with some or all matches of a pattern replaced by a replacement. The pattern can be a string or a RegExp, and the replacement can be a string or a function. The function's result (return value) will be used as the replacement string. The original string is left unchanged. **If not using `replaceAll` and the pattern is a string, only the first occurrence will be replaced**.

The replacement string can include the following special replacement patterns:
- `$&`: the matched substring
- `$\`\`: the portion of the string that precedes the matched substring
- `$'`:	the portion of the string that follows the matched substring
- `$n`: the nth parenthesized submatch string

```javascript
'John Smith'.replace(/(\w+)\s(\w+)/, '$2, $1'); // Smith, John
'abc5885c'.replace(/(\d)(\d)\2\1/g, '-$&-'); // abc-5885-c

// When using a regular expression search value, must set the global flag
'aabbcc'.replaceAll(/b/g, '.');  // aa..cc

// the matched substring
// capture groups
// offset of the matched substring within the whole string being examined
// the whole string being examined
function replacer(match, p1, p2, p3, offset, string) {
  // p1 is nondigits, p2 digits, and p3 non-alphanumerics
  return [p1, p2, p3].join('-');
}
'abc123#$'.replace(/([^\d]*)(\d*)([^\w]*)/, replacer); // abc-123-#$
```

### startsWith/endsWith, includes, padStart/padEnd, repeat
```javascript
str.startsWith(searchString[, position])
str.endsWith(searchString[, length])
str.includes(searchString[, position])
str.padStart(targetLength [, padString])
str.padEnd(targetLength [, padString])
str.repeat(count)

const str = 'To be, or not to be, that is the question.'
str.startsWith('To be')         // true
str.startsWith('not to be', 10) // true
str.endsWith('question.')       // true
str.endsWith('to be', 19)       // true

'abc'.padStart(10, "foo")   // "foofoofabc"
'abc'.padStart(6, "123465") // "123abc"
'abc'.padStart(1)           // "abc"
'abc'.padEnd(10)            // "abc       "
'abc'.padEnd(10, "foo")     // "abcfoofoof"
'abc'.padEnd(6, "123456")   // "abc123"

'abc'.repeat(-1)    // RangeError
'abc'.repeat(0)     // ''
'abc'.repeat(1)     // 'abc'
'abc'.repeat(2)     // 'abcabc'
```