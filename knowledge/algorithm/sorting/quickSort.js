function partition(arr, lo, hi) {
  const pivot = arr[hi];
  let i = lo;
  for (let j = lo; j < hi; j++) {
    if (arr[j] <= pivot) {
      [arr[i], arr[j]] = [arr[j], arr[i]];
      i++;
    }
  }
  
  [arr[i], arr[hi]] = [arr[hi], arr[i]];
  return i;
}

function _quickSort(arr, lo, hi) {
  if (lo >= hi) {
    return;
  }
  const pivot = partition(arr, lo, hi);
  _quickSort(arr, lo, pivot - 1);
  _quickSort(arr, pivot + 1, hi);
}
  
function quickSort(arr) {
  const result = arr.slice(0);
  _quickSort(result, 0, result.length - 1);
  return result;
}


// another way to do the partition with two pointers
function partition(arr, left, right) {
  const pivot = arr[Math.floor((right + left) / 2)];
  while (left <= right) {
    while (arr[left] < pivot) {
      left++;
    }
    while (arr[right] > pivot) {
      right--;
    }
    if (left <= right) {
      let temp = arr[left];
      arr[left] = arr[right];
      arr[right] = temp;
      left++;
      right--;
    }
  }
  return left;
}
