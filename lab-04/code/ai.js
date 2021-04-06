const AI_CONSTANTS = {
  X: "X",
  O: "O",
  TIE: "TIE",
  EMPTY: "",
}
function getScore(winner, depth) {
  // accout for the depth, the sooner solution is better
  const scoreMap = {
    X: -10 + depth,
    O: 10 - depth,
    TIE: 0,
  }
  return winner && scoreMap[winner]
}

// compare three values
// source: https://github.com/CodingTrain/website/blob/main/CodingChallenges/CC_154_Tic_Tac_Toe_Minimax/P5/sketch.js
function equals3(a, b, c) {
  return a === b && b === c && a !== AI_CONSTANTS.EMPTY
}

// check winner in tic-tac-toe
// source: https://github.com/CodingTrain/website/blob/main/CodingChallenges/CC_154_Tic_Tac_Toe_Minimax/P5/sketch.js
function checkWinner(board) {
  let winner = null

  // horizontal
  for (let i = 0; i < 3; i++) {
    if (equals3(board[i][0], board[i][1], board[i][2])) {
      winner = board[i][0]
    }
  }

  // Vertical
  for (let i = 0; i < 3; i++) {
    if (equals3(board[0][i], board[1][i], board[2][i])) {
      winner = board[0][i]
    }
  }

  // Diagonal
  if (equals3(board[0][0], board[1][1], board[2][2])) {
    winner = board[0][0]
  }
  if (equals3(board[2][0], board[1][1], board[0][2])) {
    winner = board[2][0]
  }

  let openSpots = 0
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[i][j] === AI_CONSTANTS.EMPTY) {
        openSpots++
      }
    }
  }

  if (winner === null && openSpots === 0) {
    return AI_CONSTANTS.TIE
  } else {
    return winner
  }
}

function bestMove(board) {
  let clonedBoard = cloneBoard(board)
  const children = generateChildren(clonedBoard)
  const move = children.reduce(
    (bestChild, child) => {
      let score = alphabeta({
        node: child.state,
        depth: 0,
        alpha: -Infinity,
        beta: Infinity,
        maximizingPlayer: false,
        terminalNodeFunction: checkWinner,
        heuristicFunction: getScore,
        generateChildren: generateChildren,
      })
      if (bestChild.score < score) {
        return {
          score,
          ...child,
        }
      } else {
        return bestChild
      }
    },
    {
      score: alphabeta({
        node: children[0].state,
        depth: 0,
        alpha: -Infinity,
        beta: Infinity,
        maximizingPlayer: false,
        terminalNodeFunction: checkWinner,
        heuristicFunction: getScore,
        generateChildren: generateChildren,
      }),
      ...children[0],
    }
  ).action
  return move
}

function cloneBoard(board) {
  return board.map((row) => [...row])
}

function flat2MatrixBoard(board) {
  return [
    [board[0], board[1], board[2]],
    [board[3], board[4], board[5]],
    [board[6], board[7], board[8]],
  ]
}

function generateChildren(board) {
  let clonedBoard = cloneBoard(board)
  const flattenBoard = [].concat(...clonedBoard)
  const turn =
    flattenBoard.filter((cell) => cell === AI_CONSTANTS.EMPTY).length % 2 === 1 ? AI_CONSTANTS.X : AI_CONSTANTS.O
  const children = []
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (clonedBoard[i][j] === AI_CONSTANTS.EMPTY) {
        let childBoard = cloneBoard(clonedBoard)
        childBoard[i][j] = turn
        children.push({ state: childBoard, action: { i, j } })
      }
    }
  }
  return children
}

// alpha-beta minimax algorithm
// credits: https://en.wikipedia.org/wiki/Alpha%E2%80%93beta_pruning
function alphabeta({
  node,
  depth,
  alpha,
  beta,
  maximizingPlayer,
  terminalNodeFunction,
  heuristicFunction,
  generateChildren,
}) {
  let result = terminalNodeFunction(node)
  if (result !== null) {
    return heuristicFunction(result, depth)
  }

  const children = generateChildren(node).map((child) => child.state)

  if (maximizingPlayer) {
    let value = -Infinity
    for (let child of children) {
      value = Math.max(
        value,
        alphabeta({
          node: child,
          depth: depth + 1,
          alpha,
          beta,
          maximizingPlayer: false,
          terminalNodeFunction,
          heuristicFunction,
          generateChildren,
        })
      )
      alpha = Math.max(alpha, value)
      if (alpha >= beta) {
        break /* beta cutoff */
      }
    }
    return value
  } else {
    value = Infinity
    for (let child of children) {
      value = Math.min(
        value,
        alphabeta({
          node: child,
          depth: depth + 1,
          alpha,
          beta,
          maximizingPlayer: true,
          terminalNodeFunction,
          heuristicFunction,
          generateChildren,
        })
      )
      beta = Math.min(beta, value)
      if (beta <= alpha) {
        break /* alpha cutoff */
      }
    }
    return value
  }
}
