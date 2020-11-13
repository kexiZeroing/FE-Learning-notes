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

<img alt="Boyer–Moore" src="https://ftp.bmp.ovh/imgs/2020/11/1102a76014e669d0.png" width="600" />

- **Bad character rule**: Start by checking if the last character of the pattern matches its current alignment. When you hit a character that doesn't match, shift the pattern so that the last occurrence of the character in the pattern is aligned with the text we're currently looking at. If the character in the text doesn't appear in the pattern, shift the pattern past the mismatching character.

> We shift the pattern until (a) The mismatch becomes a match. (b) Pattern P moves past the mismatched character.

- **Good suffix rule**: We're looking for an instance of the already-matched suffix where the previous character differs. If no such instance can be found, we instead look for a prefix of the pattern which matches a suffix of the "good suffix". If no such prefix, skip forward by the whole pattern.

> Let t be substring of text T which is matched with substring of pattern P. We shift pattern until (a) Another occurrence of t in P matched with t in T. (b) A prefix of P, which matches with suffix of t. (c) P moves past t.

```
Good suffix rule for the string "ANPANMAN":

Mismatch | Shift 
-----------------
        N|   1
       AN|   8 
      MAN|   3
     NMAN|   6
    ANMAN|   6
   PANMAN|   6
  NPANMAN|   6
 ANPANMAN|   6
```
