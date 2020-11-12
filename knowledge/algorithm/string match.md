## String Matching Algorithms
Find all occurrences of a pattern in a given text (The algorithm behind `Ctrl + F`).

The naive solution is comparing pattern and string character by character.
```js
let match_found = false;
function naiveSearch(string, str) {
  for(let i = 0; i <= string.length - str.length; i++) {
    if(string[i] === str[0]) {
      let counter= 1;
      for(let j = 1; j < str.length; j++) {
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
  }
  if(match_found === false) {
    console.log('Not found');
  }
}
```

### Boyer-Moore Pattern Match
Boyer–Moore string-search algorithm is an efficient string-searching algorithm that is the standard benchmark for practical string-search literature. The insight behind Boyer-Moore algorithm is starting with the last character in the pattern rather than the head, and you can jump the search forward multiple characters when you hit a mismatch.

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
