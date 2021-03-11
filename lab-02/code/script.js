/*
 * UQU - Computer Science -  Artificial Inteligence - Lab 2
 * Student: MHD Maher Azkoul
 *
 * This script contains a tree implmentation
 * the tree implementation conatains search algorithms applied on 8-puzzle problem:
 * - Depth-first search
 * - Breadh-first search
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
  fs.writeFileSync("expirements.csv", `i,bfs_time,bfs_space,bfs_generated_nodes,dfs_time,dfs_space,dfs_generated_nodes\n`);

  // run the expirement n times, where n provided as command line arguemnt
  new Array(config.runs).fill(0).forEach((_, i) => {
    log(`run ${i + 1}: `);

    // creating random initial state
    const initialState = [1, 2, 3, 0, 5, 6, 4, 7, 8];
    log("initial state: ", initialState);

    const goal = [1, 2, 3, 4, 5, 6, 7, 8, 0];
    log("goal state: ", goal);

    log(DIVIDOR);

    // creating root node
    let tree = createTree({ data: { state: initialState } }, { ...config });

    let finalNode;

    // finding goal using breadth-first search and calculating the time and space complexity
    const bfsTime = time(() => {
      finalNode = tree.bfs(goal);
    });
    const bfsSpace = tree.maxSpace();
    const bfsGenerated = tree.countAllNodes();

    const bfsPath = getPath(finalNode);

    log("bfs time: ", bfsTime, "ns");
    log("bfs space: ", bfsSpace);
    log("generated nodes: ", bfsGenerated);
    log(DIVIDOR);

    // clean up data and state of the tree to start a new search
    tree.clearGoals();
    tree.clearVisited();

    // create new tree
    tree = createTree({ data: { state: initialState } }, { ...config });

    // finding goal using depth-first search and calculating the time and space complexity
    const dfsTime = time(() => {
      finalNode = tree.dfs(goal);
    });
    const dfsSpace = tree.maxSpace();
    const dfsGenerated = tree.countAllNodes();

    const dfsPath = getPath(finalNode);

    log("dfs time: ", dfsTime, "ns");
    log("dfs space: ", dfsSpace);
    log("generated nodes: ", dfsGenerated);
    log(DIVIDOR);

    // clean up data and state of the tree to start a new search
    tree.clearGoals();
    tree.clearVisited();

    // writing data on csv file
    fs.appendFileSync("expirements.csv", `${i + 1},${bfsTime},${bfsSpace},${bfsGenerated},${dfsTime},${dfsSpace},${dfsGenerated}\n`);

    // writing path to path.txt file
    fs.writeFileSync(
      "path.txt",
      `RUN ${i}:\n\n` +
        `Breadth-first search path:\n` +
        `${bfsPath.map((node) => {
          const s = node.data().state;
          return `
[${s[0]} ${s[1]} ${s[2]}]
[${s[3]} ${s[4]} ${s[5]}]
[${s[6]} ${s[7]} ${s[8]}]
`;
        })}\n----------\n` +
        `Depth-first search path:\n` +
        `${dfsPath.map((node) => {
          const s = node.data().state;
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

const getPath = (node) => {
  if (!node) {
    return [];
  }
  const path = [];
  let currentNode = node;
  while (currentNode !== null) {
    path.push(currentNode);
    currentNode = currentNode.parent();
  }
  return path.reverse();
};

// generate children for a given state in 8 puzzle
const generateChild = (tree, createdStates, size = 3) => {
  const possibleChildren = [];
  const emptySquare = tree.data().state.findIndex((e) => e === 0);

  const down = emptySquare + size;
  const up = emptySquare - size;
  const right = (emptySquare + 1) % size === 0 ? -1 : emptySquare + 1;
  const left = emptySquare % size === 0 ? -1 : emptySquare - 1;

  const isValidIndex = (len) => (n) => n >= 0 && n < len;
  const isValidIndexSize = isValidIndex(size * size);

  if (isValidIndexSize(up)) {
    const data = {
      state: [...tree.data().state],
    };
    data.state[emptySquare] = data.state[up];
    data.state[up] = 0;
    const notVisited = !createdStates.find((node) => equals(node.data().state, data.state));
    if (notVisited) {
      const child = tree.addChild({ childData: data, childParent: tree });
      createdStates.push(child);
      possibleChildren.push(child);
    }
  }

  if (isValidIndexSize(down)) {
    const data = {
      state: [...tree.data().state],
    };
    data.state[emptySquare] = data.state[down];
    data.state[down] = 0;
    const notVisited = !createdStates.find((node) => equals(node.data().state, data.state));
    if (notVisited) {
      const child = tree.addChild({ childData: data, childParent: tree });
      createdStates.push(child);
      possibleChildren.push(child);
    }
  }

  if (isValidIndexSize(right)) {
    const data = {
      state: [...tree.data().state],
    };
    data.state[emptySquare] = data.state[right];
    data.state[right] = 0;
    const notVisited = !createdStates.find((node) => equals(node.data().state, data.state));
    if (notVisited) {
      const child = tree.addChild({ childData: data, childParent: tree });
      createdStates.push(child);
      possibleChildren.push(child);
    }
  }

  if (isValidIndexSize(left)) {
    const data = {
      state: [...tree.data().state],
    };
    data.state[emptySquare] = data.state[left];
    data.state[left] = 0;
    const notVisited = !createdStates.find((node) => equals(node.data().state, data.state));
    if (notVisited) {
      const child = tree.addChild({ childData: data, childParent: tree });
      createdStates.push(child);
      possibleChildren.push(child);
    }
  }

  return possibleChildren;
};

// create tree object
const createTree = (
  { data, parent = null, children = [] },
  { stepVisualization = false, lastVisualization = false } = {}
) => {
  // track max space of fringes (space complexity)
  let maxSpace = 0;

  // if visualization of each step is enabled, print each step
  const stepVisualize = () => {
    if (stepVisualization) {
      printPretty();
      return true;
    }
  };

  // if visualization of the last tree is enabled, print the tree
  const lastVisualize = () => {
    if (lastVisualization) {
      printPretty();
    }
  };

  // add a child to the node
  const addChild = ({ childData, childParent, childChildren = [] }) => {
    const child = createTree({ data: childData, parent: childParent, children: childChildren });
    children = [...children, child];
    return child;
  };

  // clean up goal state of the node and its children
  const clearGoals = () => {
    if (data.goal) {
      data.goal = undefined;
    }

    if (children.length <= 0) {
      return;
    }

    for (const c of children) {
      c.clearGoals();
    }
  };

  // clean up visited state of the node and its children
  const clearVisited = () => {
    if (data.visited) {
      data.visited = undefined;
    }

    if (children.length <= 0) {
      return;
    }

    for (const c of children) {
      c.clearVisited();
    }
  };

  const countAllNodes = () => {
    if (children.length <= 0) {
      return 1;
    } else {
      let count = 0;
      for (const c of children) {
        count += c.countAllNodes();
      }
      return count + 1;
    }
  }

  let current = {
    data: () => data,
    children: children,
    parent: () => parent,
    maxSpace: () => maxSpace,
    addChild,
    clearGoals,
    clearVisited,
    countAllNodes,
  };

  // depth-first search
  const dfs = (goal) => {
    current = { ...current, dfs };
    maxSpace = 0;
    if (equals(data.state, goal)) {
      data.goal = true;
      return current;
    }

    let createdStates = [];

    let stack = [];

    stack.push(current);

    while (stack.length > 0) {
      const s = stack.pop();
      s.data().visited = true;
      if (equals(s.data().state, goal)) {
        s.data().goal = true;
        stepVisualize() || lastVisualize();
        return s;
      }
      s.children = [...generateChild(s, createdStates)];
      stack = [...stack, ...s.children];
      if (stack.length > maxSpace) {
        maxSpace = stack.length;
      }
      stepVisualize();
    }
  };

  // breadth-first search
  const bfs = (goal) => {
    current = { ...current, bfs };
    maxSpace = 0;
    if (equals(data.state, goal)) {
      data.goal = true;
      return current;
    }

    let createdStates = [];

    let queue = [];

    queue.push(current);

    while (queue.length > 0) {
      const s = queue.pop();
      s.data().visited = true;
      if (equals(s.data().state, goal)) {
        s.data().goal = true;
        stepVisualize() || lastVisualize();
        return s;
      }
      s.children = [...generateChild(s, createdStates)];
      queue = [...s.children, ...queue];
      if (queue.length > maxSpace) {
        maxSpace = queue.length;
      }
      stepVisualize();
    }
  };

  // print the tree on the console
  const printPretty = (indent = "", last = true) => {
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

    let coloredData = data.state;
    if (data.visited) {
      coloredData = red(coloredData);
    }
    if (data.goal) {
      coloredData = greenBg(coloredData);
    }

    log(`${indent}${last ? "\\-" : "|-"}${coloredData}`);

    if (last) {
      indent += "  ";
    } else {
      indent += "| ";
    }

    children.forEach((c, i) => c.printPretty(indent, i == children.length - 1));
  };

  // public fields and methods
  return {
    data: () => data,
    children: children,
    parent: () => parent,
    maxSpace: () => maxSpace,
    addChild,
    clearGoals,
    clearVisited,
    countAllNodes,
    dfs,
    bfs,
    printPretty,
  };
};

const DIVIDOR = "----------";

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

main();
