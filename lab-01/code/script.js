const config = {
    verbose: process.argv.slice(2)[0]?.charAt(1) === 'v' || false,
    stepVisualization: process.argv.slice(2)[0] === '-vs' || false,
    lastVisualization: process.argv.slice(2)[0] === '-vl' || false,
    runs: +process.argv.slice(2)[1] || 20
}

const log = (...str) => {
    if(config.verbose) {
        console.log(...str);
    }
}

const fs = require('fs');

function main() {
    fs.writeFileSync("expirements.csv", `i,n,bfs_time,dfs_time\n`);
    new Array(config.runs).fill(0).forEach((_, i) => {
        log(`run ${i + 1}: `);
        const tree = createTree({data: {id: genRandom(0, 50)}}, {...config});

        const randoms = [tree.data().id, ...fillRandom(tree)];
        log(`random data (${randoms.length}): `, randoms);
        log(DIVIDOR);
    
        const goal = {
            id: randoms[genRandom(0, randoms.length)]
        };
    
        const bfsTime = time(() => tree.bfs(goal));
        log("bfs time: ", bfsTime, "ns");
        log(DIVIDOR);
    
        tree.clearGoals();
        tree.clearVisited();
    
        const dfsTime = time(() => tree.dfs(goal));
        log("dfs time: ", dfsTime, "ns");
        log(DIVIDOR);

        log("random goal: ", goal);
        log(DIVIDOR);

        log(SECTION_DIVIDOR);

        fs.appendFileSync("expirements.csv", `${i + 1},${randoms.length},${bfsTime},${dfsTime}\n`);
    });
}

const getNanoSecTime = () => {
    const hrTime = process.hrtime();
    return hrTime[0] * 1000000000 + hrTime[1];
}

// return execution time in nanoseconds
const time = code => {
    const start = getNanoSecTime();
    code();
    const end = getNanoSecTime();
    return end - start;
}

// fill the tree with random values randomly, return random ids created
const fillRandom = (tree, set = genSequenceRandom(0, 122), maxBreadth = 3, maxDepth = 4) => {
    if(maxDepth <= 0) return [];

    let randoms = [];
    for(let i = 0; i < genRandom(1, maxBreadth); i++) {
        const random = set.pop();
        const child = tree.addChild({childData: {id: random}});
        randoms.push(random);
        randoms = [...randoms, ...fillRandom(child, set, maxBreadth, maxDepth - 1)];
    }
    return randoms;
}

// generate a random integer between start and end
const genRandom = (start = 0, end = 6) => {
    return ~~(Math.random() * end + start);
}

const genSequenceRandom = (start = 0, end = 1000) => {
    return new Array(end - start).fill(0).map((_, i) => i).sort(() => Math.random() - 0.5);
}

// create tree object
const createTree = ({data, children = []}, {stepVisualization = false, lastVisualization = false} = {}) => {

    const stepVisualize = () => {
        if(stepVisualization) {
            printPretty();
            return true;
        }
    }

    const lastVisualize = () => {
        if(lastVisualization) {
            printPretty();
        }
    }

    const addChild = ({childData, childChildren = []}) => {
        const child = createTree({data: childData, children: childChildren});
        children = [
            ...children, 
            child
        ];
        return child;
    }

    const clearGoals = () => {
        if(data.goal) {
            data.goal = undefined;
        }

        if(children.length <= 0) {
            return;
        }

        for(const c of children) {
            c.clearGoals();
        }
    }

    const clearVisited = () => {
        if(data.visited) {
            data.visited = undefined;
        }

        if(children.length <= 0) {
            return;
        }

        for(const c of children) {
            c.clearVisited();
        }
    }

    const dfs = (goal) => {
        if(data.id === goal.id) {
            data.goal = true;
            return;
        }

        let stack = [];
 
        stack.push({
            data: () => data,
            children: () => children,
            addChild,
            clearGoals,
            clearVisited,
            dfs,
            bfs,
            printPretty,
        });
 
        while (stack.length > 0) {
            const s = stack.pop();
            s.data().visited = true;
            if(s.data().id === goal.id) {
                s.data().goal = true;
                stepVisualize() || lastVisualize();
                return;
            }
            stack = [...stack, ...s.children()];
            stepVisualize();
        }
    }

    const bfs = (goal) => {
        if(data.id === goal.id) {
            data.goal = true;
            return;
        }

        let queue = [];
 
        queue.push({
            data: () => data,
            children: () => children,
            addChild,
            clearGoals,
            clearVisited,
            dfs,
            bfs,
            printPretty,
        });
 
        while (queue.length > 0) {
            const s = queue.pop();
            s.data().visited = true;
            if(s.data().id === goal.id) {
                s.data().goal = true;
                stepVisualize() || lastVisualize();
                return;
            }
            queue = [...s.children(), ...queue];
            stepVisualize();
        }
    }

    const printPretty = (indent = "", last = true) => {
        const greenBg = txt => {
            const ANSI_GREEN_BACKGROUND = "\u001B[42m";
            const ANSI_RESET = "\u001B[0m";
            return ANSI_GREEN_BACKGROUND + txt + ANSI_RESET;
        }
        const red = txt => {
            const ANSI_RED = "\u001B[31m";
            const ANSI_RESET = "\u001B[0m";
            return ANSI_RED + txt + ANSI_RESET;
        }

        let coloredId = data.id;
        if(data.visited) {
            coloredId = red(coloredId);
        }
        if(data.goal) {
            coloredId = greenBg(coloredId);
        }

        log(`${indent}${last ? "\\-" : "|-"}${coloredId}`);

        if (last){
            indent += "  ";
        } else {
            indent += "| ";
        }
 
        children.forEach((c, i) => c.printPretty(indent, i == children.length - 1));
    }

    return {
        data: () => data,
        children: () => children,
        addChild,
        clearGoals,
        clearVisited,
        dfs,
        bfs,
        printPretty,
    };
}

const DIVIDOR = "----------";
const SECTION_DIVIDOR = "=========="

main();
