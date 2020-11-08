## Union-Find Data Structure
Given a set of N objects, we want to:
- Union command: connect two objects.
- Find/connected query: is there a path connecting the two objects?

Our goal is to design an efficient data structure for union-find.

### Quick Find
Use integer array `id[]` of lenght N, p and q are connected iff (if and only if) they have the same id. When merge components containning p and q, change all entries whose id equals `id[p]` to `id[q]`. Find/connected is O(1), but union is O(N), which leads to O(N^2) array accesses to process a sequence of N union commands on N objects.

```js
function QuickFind(size) {
  this._ids = [];
  for (let i = 0; i < size; i++) {
    this._ids[i] = i;
  }
}

QuickFind.prototype.union = function(p, q) {
  const size = this._ids.length;
  const pval = this._ids[p];
  const qval = this._ids[q];
  for (let i = 0; i < size; i++) {
    if (this._ids[i] === pval) {
      this._ids[i] = qval;
    }
  }
}

QuickFind.prototype.connected = function(p, q) {
  return this._ids[p] === this._ids[q];
}
```

### Quick Union
Integer array `id[]` of length N, where `id[i]` is parent of i, and the root of i is id[id[…id[i]…]] (keep going until it doesn’t change). Find operation is to check if p and q have the same root. Union is to merge components containing p and q, set the id of p’s root to the id of q’s root. Becuase trees can get tall, the union and find operation are O(N).

```js
function QuickUnion(size) {
  this._ids = [];
  for (let i = 0; i < size; i++) {
    this._ids[i] = i;
  }
}

QuickUnion.prototype._root = function(i) {
  while (i !== this._ids[i]) {
    i = this._ids[i];
  }
  return i;
}

QuickUnion.prototype.union = function(p, q) {
  const pRoot = this._root(p);
  const qRoot = this._root(q);
  this._ids[pRoot] = qRoot;
}

QuickUnion.prototype.connected = function(p, q) {
  return this._root(p) === this._root(q);
}
```

### Weighted Quick Union
To avoid tall trees, we keep track of the size of each tree (number of objects), and balance by linking root of smaller tree to root of larger tree when doing the union operation. Now both find and union are O(lgN) because the depth of any node is at most lgN. 

```js
function WeightedQuickUnion(n) {
  this._ids = [];
  this._size = [];
  for (let i = 0; i < n; i++) {
    this._ids[i] = i;
    this._size[i] = 1;
  }
}

WeightedQuickUnion.prototype._root = function(i) {
  while (i !== this._ids[i]) {
    i = this._ids[i];
  }
  return i;
}

WeightedQuickUnion.prototype.union = function(p, q) {
  const proot = this._root(p);
  const qroot = this._root(q);
  if (proot === qroot) {
    return;
  }
  const psz = this._size[proot];
  const qsz = this._size[qroot];
  if (psz < qsz) {
    this._ids[proot] = qroot;
    this._size[qroot] += psz;
  } else {
    this._ids[qroot] = proot;
    this._size[proot] += qsz;
  }
}

WeightedQuickUnion.prototype.connected = function(p, q) {
  return this._root(p) === this._root(q);
}
```
