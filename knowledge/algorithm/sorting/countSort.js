function countSort(arr, min, max) {
  let i = min, j = 0, count = [];

  for (i; i <= max; i++) {
    count[i] = 0;
  }
  for (i = 0; i < arr.length; i++) {
    count[arr[i]] += 1;
  }
  for (i = min; i <= max; i++) {
    while (count[i] > 0) {
      arr[j] = i;
      j++;
      count[i]--;
    }
  }
  return arr;
}
