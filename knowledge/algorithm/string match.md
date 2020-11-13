## String Matching Algorithms
Find all occurrences of a pattern in a given text (The algorithm behind `Ctrl + F`).

The naive solution is comparing pattern and string character by character.
```js
let match_found = false;
function naiveSearch(string, str) {
  for(let i = 0; i <= string.length - str.length; i++) {
    let counter = 0;
    for(let j = 0; j < str.length; j++) {
        if(string[i + j] === str[j]) {    
          counter++;
        } else { 
          break;
        }
    }
    if(counter === str.length) { 
      console.log('Pattern matched at position' + i);
      match_found = true;
      // can break here, else it will give you all the matches
    }
  }
  if(match_found === false) {
    console.log('Not found');
  }
}
```

### Boyer-Moore Pattern Match
Boyer–Moore string-search algorithm is an efficient string-searching algorithm that is the standard benchmark for practical string-search literature. The insight behind Boyer-Moore algorithm is **starting with the last character in the pattern** rather than the head, and you can **jump the search forward multiple characters** when you hit a mismatch.

Let's say our pattern `p` is the sequence of characters `p1`, `p2`, ..., `pn` and we are searching a string `s`, currently with `p` aligned so that `pn` is at index `i` in `s`.

```
s = WHICH FINALLY HALTS.  AT THAT POINT...
p = AT THAT
i =       ^
```

1. If we try to match a character that is not in `p` then we can jump forward `n` characters. Here, `'F'` is not in `p`, hence we advance `n` characters:
```
s = WHICH FINALLY HALTS.  AT THAT POINT...
p =        AT THAT
i =              ^
```

2. If we try to match a character whose last position is `k` from the end of `p` then we can jump forward `k` characters. Here, `' '`'s last position in `p` is 4 from the end, hence we advance 4 characters:
```
s = WHICH FINALLY HALTS.  AT THAT POINT...
p =            AT THAT
i =                  ^
```

3. Now we scan backwards from `i` until we either succeed or hit a mismatch. If the mismatch occurs `k` characters from the start of `p` and the mismatched character is not in `p`, then we can advance (at least) `k` characters. Here, `'L'` is not in `p` and the mismatch occurred against `p6`, hence we can advance (at least) 6 characters:
```
s = WHICH FINALLY HALTS.  AT THAT POINT...
p =                  AT THAT
i =                        ^
```

4. However, we can actually do better than this. We know that at the old `i` we've already matched some characters. If the matched characters don't match the start of `p`, then we can actually jump forward a little more:
```
s = WHICH FINALLY HALTS.  AT THAT POINT...
p =                   AT THAT
i =                         ^
```

5. At this point, the second rule applies again... and bingo! We're done.
```
s = WHICH FINALLY HALTS.  AT THAT POINT...
p =                       AT THAT
i =                             ^
```

The Boyer-Moore algorithm uses two precomputed tables to give better performance than a naive search especially if the pattern is longer than a few characters. A shift is calculated by applying two rules: **bad character rule** and **good suffix rule**. The actual shifting offset is the maximum of the shifts calculated by these two rules.

- **Bad character rule**: Start by checking if the last character of the pattern matches its current alignment. When hitting a character that doesn't match, shift the pattern so that the last occurrence of the character in the pattern is aligned with the text we're currently looking at. If the character in the text doesn't appear in the pattern, shift the pattern past the mismatching character. (Sometimes the bad character rule fails and could produce a negative shift.)

```
// case 1:
T =        c b a b a b
P =    a b a b a b a b
Shift        a b a b a b a b   

// case 2:
T =        b b a b a b
P =    a b a b a b a b
Shift    a b a b a b a b   
```

- **Good suffix rule**: We're looking for an instance of the already-matched suffix elsewhere in the text. If no such instance can be found, we instead look for a prefix of the pattern which matches a suffix of the "good suffix". If no such prefix, skip forward by the whole pattern.

```
// case 1:
T =            b a b c d e
P =  a b c d e f g b c d e
Shift            a b c d e f g b c d e

// case 2:
T =            b a b c d e
P =  c d e d e f g b c d e
Shift                c d e d e f g b c d e

// case 3:
T =            b a b c d e
P =  a a a a a a a b c d e
Shift                      a a a a a a a b c d e
```

--- 

```js
function boyerMooreSearch(text, pattern) {
  if (pattern.length === 0) return -1;

  let charTable = makeCharTable(pattern);
  let offsetTable = makeOffsetTable(pattern);

  for (let i = pattern.length - 1, j; i < text.length;) {
    for (j = pattern.length - 1; pattern[j] == text[i]; i--, j--) {
      if (j === 0) {
        return i;
      }
    }
    i += Math.max(offsetTable[pattern.length - 1 - j], charTable[text.charCodeAt(i)]);
  }

  return -1;
}

// Makes the jump table based on the mismatched character information.
// Moving the string's pointer by table[c] and it points to the end of the pattern (not shift the whole length of the pattern),
// which means leave a space for the moved pattern, and that space exactly the same as the distance between that charactor and pattern's last character (the value in table[c]).
// This table is for all the alphabets
function makeCharTable(pattern) {
  let table = [];
  for (let i = 0; i < 65536; i++) {
    table.push(pattern.length);
  }

  for (let i = 0; i < pattern.length - 1; i++) {
    const charCode = pattern.charCodeAt(i);
    table[charCode] = pattern.length - 1 - i;
  }

  return table;
}

// Makes the jump table based on the scan offset when mismatch occurs.
// This table is for the pattern, the index is the length of the already matched string starting from the last character.
// The 1st loop is handling the matched part does not occur elsewhere in the pattern, and the 2nd loop is handling it occurs elsewhere.
function makeOffsetTable(pattern) {
  let table = [];
  table.length = pattern.length;
  let lastPrefixPosition = pattern.length;

  for (let i = pattern.length; i > 0; i--) {
    if (isPrefix(pattern, i)) {
      lastPrefixPosition = i;
    }

    table[pattern.length - i] = lastPrefixPosition - i + pattern.length;
  }

  for (let i = 0; i < pattern.length - 1; i++) {
    const slen = suffixLength(pattern, i);
    table[slen] = pattern.length - 1 - i + slen;
  }

  return table;
}

// Return true if the suffix of pattern starting from pattern[idx] is a prefix of the pattern
function isPrefix(pattern, idx) {
  for (let i = idx, j = 0; i < pattern.length; i++, j++) {
    if (pattern[i] !== pattern[j]) {
        return false;
    }

    return true;
  }
}

// Return the maximum length of the substring ends at pattern[idx] and is a suffix
function suffixLength(pattern, idx) {
  let len = 0;
  for (let i = idx, j = pattern.length - 1; i >= 0 && pattern[i] === pattern[j]; i--, j--) {
    len += 1;
  }

  return len;
}
```
