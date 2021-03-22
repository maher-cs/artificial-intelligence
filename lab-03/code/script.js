/*
 * UQU - Computer Science -  Artificial Inteligence - Lab 3
 * Student: MHD Maher Azkoul
 *
 * This script contains a tree implmentation
 * the tree implementation conatains search algorithms applied on 8-puzzle problem:
 * - A Star Algorithm using two different heursitic functions
 *    [Block Manhattan, Missplaced Squares]
 *
 * The script runs an expirement on search algorithms and compute the time and space complexity
 *
 * The script recieves configuration for the:
 * - interactivity and verbosity (outputs on the console)
 * - number of runs of the experiment
 *
 * The script writes the results of the expirement of "expirements.csv"
 * and writes the path from initial state to goal state in "path.txt"
 */

// Getting configuration from the command line options
// verbose: printing on console
// stepVisualization: print the tree in each step of the algorithm
// lastVisualization: print the last tree after the algorithm is finished
// runs: number of runs of the expirement
const config = {
  verbose: process.argv.slice(2)[0]?.charAt(1) === "v" || false,
  stepVisualization: process.argv.slice(2)[0] === "-vs" || false,
  lastVisualization: process.argv.slice(2)[0] === "-vl" || false,
  runs: +process.argv.slice(2)[1] || 1,
};

// wrapper on printing on console function
const log = (...str) => {
  if (config.verbose) {
    console.log(...str);
  }
};

// importing file-system module for dealing with files
const fs = require("fs");

function main() {
  fs.writeFileSync("expirements.csv", `i,h1_time,h1_space,h1_generated_nodes,h1_steps,h2_time,h2_space,h2_generated_nodes,h2_steps\n`);

  // run the expirement n times, where n provided as command line arguemnt
  new Array(config.runs).fill(0).forEach((_, i) => {
    log(`run ${i + 1}: `);

    // creating random initial state
    const initialState = [0, 7, 3, 8, 1, 2, 5, 4, 6];

    log("initial state: ", initialState);

    const goal = [1, 2, 3, 4, 5, 6, 7, 8, 0];
    log("goal state: ", goal);

    log(DIVIDOR);

    // creating root node
    let tree = new Tree({ data: { state: initialState } }, { ...config });

    let finalNode;

    // finding goal using Block Manhattan heuristic and calculating the time and space complexity
    const h1Time = time(() => {
      finalNode = tree.aStar(goal, blockManhattanHeuristic);
    });
    const h1Space = tree.maxSpace;
    const h1Generated = tree.countAllNodes();

    const h1Path = getPath(finalNode);

    log("h1 time: ", h1Time, "ns");
    log("h1 space: ", h1Space);
    log("generated nodes: ", h1Generated);
    log(DIVIDOR);

    // clean up data and state of the tree to start a new search
    tree.clearGoals();
    tree.clearVisited();

    // create new tree
    tree = new Tree({ data: { state: initialState } }, { ...config });

    // finding goal using Missplaced Squares heuristic and calculating the time and space complexity
    const h2Time = time(() => {
      finalNode = tree.aStar(goal, missplacedSquaresHeuristic);
    });
    const h2Space = tree.maxSpace;
    const h2Generated = tree.countAllNodes();

    const h2Path = getPath(finalNode);

    log("h2 time: ", h2Time, "ns");
    log("h2 space: ", h2Space);
    log("generated nodes: ", h2Generated);
    log(DIVIDOR);

    // clean up data and state of the tree to start a new search
    tree.clearGoals();
    tree.clearVisited();

    // writing data on csv file
    fs.appendFileSync(
      "expirements.csv",
      `${i + 1},${h1Time},${h1Space},${h1Generated},${h1Path.length},${h2Time},${h2Space},${h2Generated},${h2Path.length}\n`
    );

    // writing path to path.txt file
    fs.writeFileSync(
      "path.txt",
      `RUN ${i}:\n\n` +
        `Block Manhattan heuristic path: ${h1Path.length} steps\n` +
        `${h1Path.map((node) => {
          const s = node.data.state;
          return `
[${s[0]} ${s[1]} ${s[2]}]
[${s[3]} ${s[4]} ${s[5]}]
[${s[6]} ${s[7]} ${s[8]}]
`;
        })}\n----------\n` +
        `Missplaced Squares heuristic path: ${h2Path.length} steps\n` +
        `${h2Path.map((node) => {
          const s = node.data.state;
          return `
[${s[0]} ${s[1]} ${s[2]}]
[${s[3]} ${s[4]} ${s[5]}]
[${s[6]} ${s[7]} ${s[8]}]
`;
        })}\n==========`
    );
  });
}

// function to get current time in nanoseconds
const getNanoSecTime = () => {
  const hrTime = process.hrtime();
  return hrTime[0] * 1000000000 + hrTime[1];
};

// return execution time in nanoseconds
const time = (code) => {
  const start = getNanoSecTime();
  code();
  const end = getNanoSecTime();
  return end - start;
};

// the heuristic function 1
// the number of missplaced squares
const missplacedSquaresHeuristic = (state, goal, size = 3) => {
  if (state.length !== goal.length) {
    return state.length;
  }

  let countMissPlaced = 0;

  for (let i = 0; i < state.length; i++) {
    if (state[i] !== goal[i]) {
      countMissPlaced++;
    }
  }

  return countMissPlaced;
};

// the heuristic function 2
// city block manhattan distance
const blockManhattanHeuristic = (state, goal, size = 3) => {
  let totalManhattanDistance = 0;

  for (let i = 0; i < goal.length; i++) {
    if (state[i] === goal[i]) {
      continue;
    }
    let goalIndex = i;
    let stateIndex = state.indexOf(goal[goalIndex]);

    let stateRow = ~~(stateIndex / size);
    let goalRow = ~~(goalIndex / size);

    const distance = Math.abs(stateRow - goalRow) + Math.abs((goalIndex % size) - (stateIndex % size));
    totalManhattanDistance += distance;
  }

  return totalManhattanDistance;
};

const getPath = (node) => {
  if (!node) {
    return [];
  }
  const path = [];
  let currentNode = node;
  while (currentNode !== null) {
    path.push(currentNode);
    currentNode = currentNode.parent;
  }
  return path.reverse();
};

// generate children for a given state in 8 puzzle
const generateChild = (tree, createdStates, size = 3) => {
  const possibleChildren = [];
  const emptySquare = tree.data.state.findIndex((e) => e === 0);

  const down = emptySquare + size;
  const up = emptySquare - size;
  const right = (emptySquare + 1) % size === 0 ? -1 : emptySquare + 1;
  const left = emptySquare % size === 0 ? -1 : emptySquare - 1;

  const isValidIndex = (len) => (n) => n >= 0 && n < len;
  const isValidIndexSize = isValidIndex(size * size);

  if (isValidIndexSize(up)) {
    const data = {
      state: [...tree.data.state],
    };
    data.state[emptySquare] = data.state[up];
    data.state[up] = 0;
    const notVisited = !createdStates.find((node) => equals(node.data.state, data.state));
    if (notVisited) {
      const child = tree.addChild({ childData: data, childParent: tree });
      createdStates.push(child);
      possibleChildren.push(child);
    }
  }

  if (isValidIndexSize(down)) {
    const data = {
      state: [...tree.data.state],
    };
    data.state[emptySquare] = data.state[down];
    data.state[down] = 0;
    const notVisited = !createdStates.find((node) => equals(node.data.state, data.state));
    if (notVisited) {
      const child = tree.addChild({ childData: data, childParent: tree });
      createdStates.push(child);
      possibleChildren.push(child);
    }
  }

  if (isValidIndexSize(right)) {
    const data = {
      state: [...tree.data.state],
    };
    data.state[emptySquare] = data.state[right];
    data.state[right] = 0;
    const notVisited = !createdStates.find((node) => equals(node.data.state, data.state));
    if (notVisited) {
      const child = tree.addChild({ childData: data, childParent: tree });
      createdStates.push(child);
      possibleChildren.push(child);
    }
  }

  if (isValidIndexSize(left)) {
    const data = {
      state: [...tree.data.state],
    };
    data.state[emptySquare] = data.state[left];
    data.state[left] = 0;
    const notVisited = !createdStates.find((node) => equals(node.data.state, data.state));
    if (notVisited) {
      const child = tree.addChild({ childData: data, childParent: tree });
      createdStates.push(child);
      possibleChildren.push(child);
    }
  }

  return possibleChildren;
};

// tree class
class Tree {
  constructor({ data, parent = null, children = [] }, { stepVisualization = false, lastVisualization = false }) {
    this.maxSpace = 0;

    this.data = data;
    this.data.heuristic = 0;
    this.data.cost = 0;
    this.data.totalCost = 0;
    this.parent = parent;
    this.children = children;

    this.lastVisualization = lastVisualization;
    this.stepVisualization = stepVisualization;
  }

  // if visualization of each step is enabled, print each step
  stepVisualize() {
    if (this.stepVisualization) {
      this.printPretty();
      return true;
    }
  }

  // if visualization of the last tree is enabled, print the tree
  lastVisualize() {
    if (this.lastVisualization) {
      this.printPretty();
    }
  }

  // add a child to the node
  addChild({ childData, childParent, childChildren = [] }) {
    const child = new Tree({ data: childData, parent: childParent, children: childChildren }, {});
    this.children.push(child);
    return child;
  }

  // clean up goal state of the node and its children
  clearGoals() {
    if (this.data.goal) {
      this.data.goal = undefined;
    }

    if (this.children.length <= 0) {
      return;
    }

    for (const c of this.children) {
      c.clearGoals();
    }
  }

  // clean up visited state of the node and its children
  clearVisited() {
    if (this.data.visited) {
      this.data.visited = undefined;
    }

    if (this.children.length <= 0) {
      return;
    }

    for (const c of this.children) {
      c.clearVisited();
    }
  }

  countAllNodes() {
    if (this.children.length <= 0) {
      return 1;
    } else {
      let count = 0;
      for (const c of this.children) {
        count += c.countAllNodes();
      }
      return count + 1;
    }
  }

  // depth-first search
  dfs(goal) {
    this.maxSpace = 0;
    if (equals(this.data.state, goal)) {
      this.data.goal = true;
      return this;
    }

    let createdStates = [];

    let stack = [];

    stack.push(this);

    while (stack.length > 0) {
      const s = stack.pop();
      s.data.visited = true;
      if (equals(s.data.state, goal)) {
        s.data.goal = true;
        this.stepVisualize() || this.lastVisualize();
        return s;
      }
      s.children = [...generateChild(s, createdStates)];
      stack = [...stack, ...s.children];
      if (stack.length > this.maxSpace) {
        this.maxSpace = stack.length;
      }
      this.stepVisualize();
    }
  }

  // breadth-first search
  bfs(goal) {
    this.maxSpace = 0;
    if (equals(this.data.state, goal)) {
      this.data.goal = true;
      return this;
    }

    let createdStates = [];

    let queue = [];

    queue.push(this);

    while (queue.length > 0) {
      const s = queue.pop();
      s.data.visited = true;
      if (equals(s.data.state, goal)) {
        s.data.goal = true;
        this.stepVisualize() || this.lastVisualize();
        return s;
      }
      s.children = [...generateChild(s, createdStates)];
      queue = [...s.children, ...queue];
      if (queue.length > this.maxSpace) {
        this.maxSpace = queue.length;
      }
      this.stepVisualize();
    }
  }

  // A start
  aStar(goal, heuristic) {
    this.maxSpace = 0;
    if (equals(this.data.state, goal)) {
      this.data.goal = true;
      return this;
    }

    let createdStates = [];

    let priorityQueue = new PriorityQ();

    this.data.heuristic = heuristic(this.data.state, goal, this.data.state.length);
    if (this.parent != null) {
      this.data.cost = this.parent.data.cost + 1;
    }
    this.data.totalCost = this.data.heuristic + this.data.cost;
    priorityQueue.insert(this.data.totalCost, this);

    while (priorityQueue.size() > 0) {
      const s = priorityQueue.extractRoot().value;

      s.data.visited = true;

      if (equals(s.data.state, goal)) {
        s.data.goal = true;
        this.stepVisualize() || this.lastVisualize();
        return s;
      }

      s.children = [...generateChild(s, createdStates)];

      // inserting children after calculating their proirity (f(n) = g(n) + h(n))
      s.children.forEach((c) => {
        c.data.heuristic = heuristic(c.data.state, goal, c.data.state.length);
        if (c.parent != null) {
          c.data.cost = c.parent.data.cost + 1;
        }
        c.data.totalCost = c.data.heuristic + c.data.cost;
        priorityQueue.insert(c.data.totalCost, c);
      });

      // record space complexity
      if (priorityQueue.size() > this.maxSpace) {
        this.maxSpace = priorityQueue.size();
      }

      this.stepVisualize();
    }
  }

  // print the tree on the console
  printPretty(indent = "", last = true) {
    let coloredData = this.data.state;
    if (this.data.visited) {
      coloredData = red(coloredData);
    }
    if (this.data.goal) {
      coloredData = greenBg(coloredData);
    }

    log(`${indent}${last ? "\\-" : "|-"}${coloredData}`);

    if (last) {
      indent += "  ";
    } else {
      indent += "| ";
    }

    this.children.forEach((c, i) => c.printPretty(indent, i == children.length - 1));
  }
}

// implementation of priority queue in javascript using class
// source: https://github.com/datastructures-js/heap

class Heap {
  constructor(nodes, leaf) {
    this._nodes = Array.isArray(nodes) ? nodes : [];
    this._leaf = leaf || null;
  }

  _getLeftChildIndex(parentIndex) {
    return parentIndex * 2 + 1;
  }

  _getRightChildIndex(parentIndex) {
    return parentIndex * 2 + 2;
  }

  _getParentIndex(childIndex) {
    return Math.floor((childIndex - 1) / 2);
  }

  _hasLeftChild(parentIndex) {
    return this._getLeftChildIndex(parentIndex) < this.size();
  }

  _hasRightChild(parentIndex) {
    return this._getRightChildIndex(parentIndex) < this.size();
  }

  _hasParent(childIndex) {
    return this._getParentIndex(childIndex) >= 0;
  }

  _getKey(node) {
    if (typeof node === "object") return node.key;
    return node;
  }

  _swap(i, j) {
    const temp = this._nodes[i];
    this._nodes[i] = this._nodes[j];
    this._nodes[j] = temp;
  }

  _compare(parentNode, childNode) {
    return this._compareKeys(this._getKey(parentNode), this._getKey(childNode));
  }

  _compareByIndex(parentIndex, childIndex) {
    return this._compareKeys(this._getKey(this._nodes[parentIndex]), this._getKey(this._nodes[childIndex]));
  }

  _shouldSwap(parentIndex, childIndex) {
    if (parentIndex < 0 || parentIndex >= this.size()) return false;
    if (childIndex < 0 || childIndex >= this.size()) return false;

    return !this._compareByIndex(parentIndex, childIndex);
  }

  heapifyUp(startingIndex = this.size() - 1) {
    let childIndex = startingIndex;
    let parentIndex = this._getParentIndex(childIndex);
    while (this._shouldSwap(parentIndex, childIndex)) {
      this._swap(parentIndex, childIndex);
      childIndex = parentIndex;
      parentIndex = this._getParentIndex(childIndex);
    }
  }

  _compareChildrenOf(parentIndex) {
    if (!this._hasLeftChild(parentIndex) && !this._hasRightChild(parentIndex)) {
      return -1;
    }

    const leftChildIndex = this._getLeftChildIndex(parentIndex);
    const rightChildIndex = this._getRightChildIndex(parentIndex);

    if (!this._hasLeftChild(parentIndex)) {
      return rightChildIndex;
    }

    if (!this._hasRightChild(parentIndex)) {
      return leftChildIndex;
    }

    return this._compareByIndex(leftChildIndex, rightChildIndex) ? leftChildIndex : rightChildIndex;
  }

  _heapifyDown(startingIndex = 0) {
    let parentIndex = startingIndex;
    let childIndex = this._compareChildrenOf(parentIndex);
    while (this._shouldSwap(parentIndex, childIndex)) {
      this._swap(parentIndex, childIndex);
      parentIndex = childIndex;
      childIndex = this._compareChildrenOf(parentIndex);
    }
  }

  extractRoot() {
    if (this.isEmpty()) return null;

    const root = this.root();
    this._nodes[0] = this._nodes[this.size() - 1];
    this._nodes.pop();
    this._heapifyDown();

    if (root === this._leaf) {
      this._leaf = this.root();
    }

    return root;
  }

  _heapifyDownUntil(index) {
    let parentIndex = 0;
    let leftChildIndex = 1;
    let rightChildIndex = 2;
    let childIndex;

    while (leftChildIndex < index) {
      childIndex = this._compareChildrenBefore(index, leftChildIndex, rightChildIndex);

      if (this._shouldSwap(parentIndex, childIndex)) {
        this._swap(parentIndex, childIndex);
      }

      parentIndex = childIndex;
      leftChildIndex = this._getLeftChildIndex(parentIndex);
      rightChildIndex = this._getRightChildIndex(parentIndex);
    }
  }

  _clone(HeapType) {
    return new HeapType(this._nodes.slice(), this._leaf);
  }

  sort() {
    for (let i = this.size() - 1; i > 0; i -= 1) {
      this._swap(0, i);
      this._heapifyDownUntil(i);
    }

    return this._nodes;
  }

  insert(key, value) {
    const newNode = value !== undefined ? { key, value } : key;
    this._nodes.push(newNode);
    this.heapifyUp();
    if (this._leaf === null || !this._compare(newNode, this._leaf)) {
      this._leaf = newNode;
    }
    return this;
  }

  fix() {
    for (let i = 0; i < this.size(); i += 1) {
      this.heapifyUp(i);
    }
    return this;
  }

  isValid(parentIndex = 0) {
    let isValidLeft = true;
    let isValidRight = true;

    if (this._hasLeftChild(parentIndex)) {
      const leftChildIndex = this._getLeftChildIndex(parentIndex);
      if (!this._compareByIndex(parentIndex, leftChildIndex)) return false;
      isValidLeft = this.isValid(leftChildIndex);
    }

    if (this._hasRightChild(parentIndex)) {
      const rightChildIndex = this._getRightChildIndex(parentIndex);
      if (!this._compareByIndex(parentIndex, rightChildIndex)) return false;
      isValidRight = this.isValid(rightChildIndex);
    }

    return isValidLeft && isValidRight;
  }

  root() {
    if (this.isEmpty()) return null;
    return this._nodes[0];
  }

  leaf() {
    return this._leaf;
  }

  size() {
    return this._nodes.length;
  }

  isEmpty() {
    return this.size() === 0;
  }

  clear() {
    this._nodes = [];
    this._leaf = null;
  }

  static _heapify(list, HeapType) {
    if (!Array.isArray(list)) {
      throw new Error(".heapify expects an array");
    }

    return new HeapType(list).fix();
  }

  static _isHeapified(list, HeapType) {
    return new HeapType(list).isValid();
  }
}

class PriorityQ extends Heap {
  _compareKeys(parentKey, childKey) {
    return parentKey < childKey;
  }

  _compareChildrenBefore(index, leftChildIndex, rightChildIndex) {
    const leftChildKey = this._getKey(this._nodes[leftChildIndex]);
    const rightChildKey = this._getKey(this._nodes[rightChildIndex]);

    if (rightChildKey < leftChildKey && rightChildIndex < index) {
      return rightChildIndex;
    }
    return leftChildIndex;
  }

  clone() {
    return super._clone(MinHeap);
  }

  static heapify(list) {
    return super._heapify(list, MinHeap);
  }

  static isHeapified(list) {
    return super._isHeapified(list, MinHeap);
  }
}

// compare two arrays
const equals = (arr1, arr2) => {
  if (arr1.length !== arr2.length) {
    return false;
  }

  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return false;
    }
  }

  return true;
};

const DIVIDOR = "----------";

const greenBg = (txt) => {
  const ANSI_GREEN_BACKGROUND = "\u001B[42m";
  const ANSI_RESET = "\u001B[0m";
  return ANSI_GREEN_BACKGROUND + txt + ANSI_RESET;
};
const red = (txt) => {
  const ANSI_RED = "\u001B[31m";
  const ANSI_RESET = "\u001B[0m";
  return ANSI_RED + txt + ANSI_RESET;
};

main();
