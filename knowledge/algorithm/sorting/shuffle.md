## Shuffle an array
The Art of Computer Programming, Vol. 2, section 3.4.2 “Random sampling and shuffling” describes two solutions:
- If the number of items to sort is small, then simply put all possible orderings in a table and select one ordering at random. For example with 5 items, the table would need `5! = 120` rows.
- Fisher-Yates Shuffle

```javascript
/* 
Fisher-Yates Algorithm
To shuffle an array a of n elements (indices 0..n-1):
for i from n−1 downto 1 do
    j ← random integer such that 0 ≤ j ≤ i
    exchange a[j] and a[i]
*/

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}
```

The random sort `() => 0.5 - Math.random()` is not recommended, because **it is inefficient and strongly biased**.

A sorting algorithm requires a certain number `c` of comparisons, e.g. `c = n(n-1)/2` for bubble sort. The random comparison function makes the outcome of each comparison equally likely, and there are `2^c` equally probable results. Now, each result has to correspond to one of the `n!` permutations of the array's entries, which makes an even distribution impossible in the general case.

According to the ECMA spec, if `comparefn` is not a consistent comparison function for the elements of this array (e.g. you first claim A < B and B < C, but then C < A), the sort order is implementation-defined (can do anything or nothing, unpredictably). Depending on the exact algorithm used, it may just do a few exchanges operations and then prematurely stop. Or it could be worse and lead to an infinite loop.

Furthermore, sorting is an `O(N log N)` operation where the Fisher-Yates algorithm is `O(N)`.
