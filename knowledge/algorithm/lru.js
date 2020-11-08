/* 
LRU cache is implemented using a doubly linked list and hash table.
Map is used to search the node in O(1); 
List maintains the order in O(1) with head and tail.
*/

function DLLNode(key, data) {
  this.key = key;
  this.data = data;
  this.next = null;
  this.prev = null;
}

function LRUCache(capacity) {
  this.map = new Map();
  this.capacity = capacity;
  this.head = new DLLNode("", null);
  this.tail = new DLLNode("", null);
  this.head.next = this.tail;
  this.tail.prev = this.head;
}

LRUCache.prototype.addNode = function(node) {
  let realTail = this.tail.prev;
  realTail.next = node;
  this.tail.prev = node;
  node.prev = realTail;
  node.next = this.tail;
}

LRUCache.prototype.removeNode = function(node) {
  let prev = node.prev;
  let next = node.next;
  prev.next = next;
  next.prev = prev;
}

LRUCache.prototype.get = function(key) {
  let node = this.map.get(key);
  if (node === undefined) {
    return -1;
  } else {
    this.removeNode(node);
    this.addNode(node);
    return node.data;
  }
}

LRUCache.prototype.put = function(key, value) {
  var node = this.map.get(key);
  if (node) {
    this.removeNode(node);
  }
  var newNode = new DLLNode(key, value);
  this.addNode(newNode);
  this.map.set(key, newNode);

  if (this.map.size > this.capacity) {
    var realHead = this.head.next;
    this.removeNode(realHead);
    this.map.delete(realHead.key)
  }
}
