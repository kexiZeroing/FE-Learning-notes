/*
Trie (Prefix Tree) 
A trie is a tree-like data structure whose nodes store the letters of an alphabet.
Words and strings can be retrieved from the structure by traversing down a branch path of the tree.
The term “trie” comes from the word retrieval, and is usually pronounced “try”, to distinguish it from other “tree” structures.
*/

function TrieNode() {
  this.children = {}
  this.endOfWord = false;
}

function Trie() {
  this.root = new TrieNode();
}

Trie.prototype.insert = function(word) {
  var current = this.root;
  for (var i = 0; i < word.length; i++) {
    var ch = word.charAt(i);
    var node = current.children[ch];
    if (node == null) {
      node = new TrieNode();
      current.children[ch] = node;
    }
    current = node;
  }
  current.endOfWord = true;
}

Trie.prototype.search = function(word) {
  var current = this.root;
  for (var i = 0; i < word.length; i++) {
    var ch = word.charAt(i);
    var node = current.children[ch];
    if (node == null) {
      return false;
    }
    current = node;
  }
  return current.endOfWord;
}

Trie.prototype.delete = function(word) {
  this.deleteRecursively(this.root, word, 0);
}

// only the node that does not have any children should be deleted
Trie.prototype.deleteRecursively = function(current, word, index) {
  if (index == word.length) {
    if (!current.endOfWord) {
      return false;
    }
    current.endOfWord = false;
    return Object.keys(current.children).length === 0;
  }

  var ch = word.charAt(index);
  var node = current.children[ch];
  if (node == null) {
    return false;
  }
  var shouldDeleteCurrentNode = this.deleteRecursively(node, word, index + 1);
  if (shouldDeleteCurrentNode) {
    delete current.children[ch];
    return Object.keys(current.children).length === 0;
  }
  return false;
}

const trie = new Trie();
trie.insert ("Edison");
trie.insert ("Edis");
trie.insert ("Edi");

trie.search ("Edison");
trie.search ("Edis");
trie.search ("Edi");
trie.search ("Ed");
