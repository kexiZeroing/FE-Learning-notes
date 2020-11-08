function createBinaryNode(key) {
  return {
    key,
    left: null,
    right: null,
    addLeft(leftKey) {
      const newLeft = createBinaryNode(leftKey)
      this.left = newLeft
      return newLeft
    },
    addRight(rightKey) {
      const newRight = createBinaryNode(rightKey)
      this.right = newRight
      return newRight
    }
  }
}

const TRAVERSALS = {
  IN_ORDER: (node, visitFn) => {
    if (node !== null) {
      TRAVERSALS.IN_ORDER(node.left, visitFn)
      visitFn(node)
      TRAVERSALS.IN_ORDER(node.right, visitFn)
    }
  },
  PRE_ORDER: (node, visitFn) => {
    if (node !== null) {
      visitFn(node)
      TRAVERSALS.PRE_ORDER(node.left, visitFn)
      TRAVERSALS.PRE_ORDER(node.right, visitFn)
    }
  },
  POST_ORDER: (node, visitFn) => {
    if (node !== null) {
      TRAVERSALS.POST_ORDER(node.left, visitFn)
      TRAVERSALS.POST_ORDER(node.right, visitFn)
      visitFn(node)
    }
  }
}

function createBinaryTree(rootKey) {
  const root = createBinaryNode(rootKey)

  return {
    root,
    print(traversalType = 'IN_ORDER') {
      let result = ''

      const visit = node => {
        result += result.length === 0 ? node.key : ` => ${node.key}`
      }

      TRAVERSALS[traversalType](this.root, visit)

      return result
    }
  }
}

// iterative pre-order and in-order traversal
var preorderTraversal = function(root) {
  if (root == null) return [];
  let stack = [];
  let result = [];
  stack.push(root);

  while (stack.length > 0) {
    let node = stack.pop();
    result.push(node.val);
    if (node.right) {
      stack.push(node.right);
    }
    if (node.left) {
      stack.push(node.left);
    }
  }
  return result;
};

var inorderTraversal = function(root) {
  if (root == null) return [];
  let result = [];
  let stack = [];
  let pointerNode = root;

  while (stack.length > 0 || pointerNode !== null) {
    if (pointerNode !== null) {
      stack.push(pointerNode);
      pointerNode = pointerNode.left;
    } else {
      pointerNode = stack.pop();
      result.push(pointerNode.val);
      pointerNode = pointerNode.right;
    }
  }
  return result;
};

// Level-Order traversal
var levelOrderTraversal = function(root) {
  if (!root) return [];
  let result = [];
  let queue = [root, null];
  let levelNodes = [];

  while (queue.length) {
    const t = queue.shift();

    if (t) {
      levelNodes.push(t.val)
      if (t.left) {
        queue.push(t.left);
      }
      if (t.right) {
        queue.push(t.right);
      }
    } else {
      result.push(levelNodes);
      levelNodes.length = 0 ;
      if (queue.length > 0) {
        queue.push(null)
      }
    }
  }

  return result;
};
