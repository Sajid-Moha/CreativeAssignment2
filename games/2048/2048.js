class Game {
  board = [[0, 0, 0, 0],
           [0, 0, 0, 0],
           [0, 0, 0, 0],
           [0, 0, 0, 0]];
  numRows = 4;
  numCols = 4;
  emptyPositions = [];

  /**
   *
   * @param {int[][]} boardState - *optional* set board state
   * @returns 
   */
  constructor(boardState) {
    if (boardState !== undefined) {
      this.board = boardState.map(innerArray => innerArray.slice());
    }
    
    this.updateEmptyPositions();
    this.generateValue();
  }

  reset() {
    this.board = [[0, 0, 0, 0],
             [0, 0, 0, 0],
             [0, 0, 0, 0],
             [0, 0, 0, 0]];
    this.emptyPositions = [];
    this.updateEmptyPositions();
    this.generateValue();
  }

  gameWon() {
    let won = false;
    this.board.forEach((row) => {
      row.forEach((value) => {
        if (value === 2048) {
          won = true;
          return;
        }
      });

      if (won) return;
    });

    return won;
  }

  gameLost() {
    if (this.emptyPositions.length != 0) return false;
    let winnable = false;

    // check rows
    this.board.forEach((row) => {
      for (let i = 1; i < row.length; i++) {
        if (row[i] === row[i - 1]) {
          winnable = true;
          return;
        }
      }
    });

    // check columns
    for (let i = 0; i < this.board.length; i++) {
      const curCol = this.#getCol(i);
      for (let j = 1; j < curCol.length; j++) {
        if (curCol[j] === curCol[j - 1]) {
          winnable = true;
          return;
        }
      }
    }

    return !winnable;
  }

  /**
   * Saves coordinates of all empty tiles. Will be used to set position of
   *  randomly generated values and to determine when game is over
   */
  updateEmptyPositions() {
    this.emptyPositions = [];

    for (let row = 0; row < this.numRows; row++) {
      for (let col = 0; col < this.numCols; col++) {
        if (this.board[row][col] === 0) {
          this.emptyPositions.push([row, col]);
        }
      }
    }
  }

  /**
   * 
   * @param { } row 
   */
  #shiftRowLeft(row) {
    function pushTilesLeft(row) {
      // track last seen empty position in row
      let emptyIndexPointer = 0;
      for (let col = 0; col < row.length; col++) {
        if (row[col] != 0) {
          if (emptyIndexPointer != col) {
            row[emptyIndexPointer] = row[col];
            row[col] = 0;
          }
  
          emptyIndexPointer += 1;
        }
      }
    }

    pushTilesLeft(row);

    // step two: add adjacent tiles if they have the same value
    for (let col = 1; col < this.numRows; col++) {
      if (row[col] == row[col - 1]) {
        row[col - 1] = row[col] * 2;
        row[col] = 0;
      }
    }

    pushTilesLeft(row)
  }

  #shiftRowRight(row) {
    row.reverse();
    this.#shiftRowLeft(row);
    row.reverse();
  }

  shiftLeft() {
    for (let row = 0; row < this.numRows; row++) {
      this.#shiftRowLeft(this.board[row])
    }
    this.updateEmptyPositions();
  }

  shiftRight() {
    for (let row = 0; row < this.numRows; row++) {
      this.#shiftRowRight(this.board[row]);
    }
    this.updateEmptyPositions();
  }

  #getCol(col_index) {
    let col = [];
    for (let row = 0; row < this.numRows; row++) {
      col[row] = this.board[row][col_index];
    }
    return col;
  }

  #updateCol(col_index, col) {
    for (let row = 0; row < this.numRows; row++) {
      this.board[row][col_index] = col[row];
    }
  }

  shiftUp() {
    for (let col = 0; col < this.numCols; col++) {
      const cur_col = this.#getCol(col);
      this.#shiftRowLeft(cur_col);
      this.#updateCol(col, cur_col);
    }
    this.updateEmptyPositions();
  }

  shiftDown() {
    for (let col = 0; col < this.numCols; col++) {
      const cur_col = this.#getCol(col);
      this.#shiftRowRight(cur_col);
      this.#updateCol(col, cur_col);
    }
    this.updateEmptyPositions();
  }

  generateValue() {
    const randomIndex = Math.floor(Math.random() * this.emptyPositions.length);
    const random_row = this.emptyPositions[randomIndex][0];
    const random_col = this.emptyPositions[randomIndex][1];

    this.board[random_row][random_col] = 2;
  }
};

const imgDict = {
  0: '',
  2: '../../src/img/gameImages/2048/2.png',
  4: '../../src/img/gameImages/2048/4.png',
  8: '../../src/img/gameImages/2048/8.png',
  16: '../../src/img/gameImages/2048/16.png',
  32: '../../src/img/gameImages/2048/32.png',
  64: '../../src/img/gameImages/2048/64.png',
  128: '../../src/img/gameImages/2048/128.png',
  256: '../../src/img/gameImages/2048/256.png',
  512: '../../src/img/gameImages/2048/512.png',
  1024: '../../src/img/gameImages/2048/1024.png',
  2048: '../../src/img/gameImages/2048/2048.png',
};

// helper functions

function compareBoards(b1, b2) {
  if (b1.length != b2.length) return false;

  for (let row = 0; row < b1.length; row++) {
    if (b1[row].length != b2[row].length) return false;

    for (let col = 0; col < b1[row].length; col++) {
      if (b1[row][col] != b2[row][col]) return false;
    }
  }

  return true;
}

function updateVisualBoard(boardElement, boardState) {
  let cur_row = boardElement.firstElementChild;
  boardState.forEach((row) => {
    let cur_tile = cur_row.firstElementChild;

    row.forEach((tile_value) => {
      let cur_image = cur_tile.firstElementChild;
      cur_image.src = imgDict[tile_value]

      cur_tile = cur_tile.nextElementSibling;
    });
    cur_row = cur_row.nextElementSibling;
  });
}

function restartVisual(message) {
  let result = document.createElement('section');
  result.classList.add('gameOver');

  let gameStatus = document.createElement('h2');
  gameStatus.id = 'gameStatus';
  gameStatus.textContent = message;

  let restartPrompt = document.createElement('h3');
  restartPrompt.id = 'restart';
  restartPrompt.textContent = 'Play Again?'

  let reset = document.createElement('button');
  reset.id = 'reset';

  let resetImage = document.createElement('img');
  resetImage.id = 'resetter';
  resetImage.src = '../../src/img/gameImages/2048/reset.png';
  reset.appendChild(resetImage);

  result.appendChild(gameStatus);
  result.appendChild(restartPrompt);
  result.appendChild(reset);

  return result;
}

function endVisuals(win, boardElement) {
  boardElement.style.display = 'none';
  const message = win ? "You Win! :D" : "You Lose! :(";

  const main = document.getElementsByTagName('main')[0];
  const restart = restartVisual(message);
  main.appendChild(restart);

  const reset = document.getElementById('resetter');
  reset.addEventListener('click', (e) => {
    boardElement.style.display = 'flex';
    restart.remove()
    curBoard.reset();
    updateVisualBoard(boardElement, curBoard.board);
    gameOver = false;
  });
}

/**
 * Initialize Game State
 */
let test_b = [[1024, 1024, 0, 0],
         [0, 0, 0, 0],
         [0, 0, 0, 0],
         [0, 0, 0, 0]];
let curBoard = new Game();

/* draw initial board */
const visualBoard = document.getElementById('board');
updateVisualBoard(visualBoard, curBoard.board);

/**
 * Game "Loop" Below This Point
 */
let gameOver = false;

/**
 * Helper function that progresses game once play has been recognized+executed
 * @param {int[][]} oldBoardArray - copy of original board state
 * @param {Game} curBoard - Game object that contains current board 
 */
function makePlay(oldBoardArray, curBoard) {
  /* iff pieces move, you should generate a new piece */
  if (!compareBoards(oldBoardArray, curBoard.board)) {
    curBoard.generateValue();
  }
  updateVisualBoard(visualBoard, curBoard.board);

  const win = curBoard.gameWon();
  const loss = curBoard.gameLost();
  if (win || loss) {
    endVisuals(win, visualBoard);
    gameOver = true;
  }
}

/**
 * Supporting keyboard input (arrow keys) for user to make plays
 */
document.addEventListener('keydown', function(event) {
  if (!gameOver) {
    /* create deep copy of boardState to reference later */
    oldBoardArray = curBoard.board.map(innerArray => innerArray.slice());

    if (event.key === 'ArrowLeft') {
      curBoard.shiftLeft();
    } else if (event.key === 'ArrowRight') {
      curBoard.shiftRight();
    } else if (event.key === 'ArrowUp') {
      curBoard.shiftUp();
    } else if (event.key === 'ArrowDown') {
      curBoard.shiftDown();
    }

    makePlay(oldBoardArray, curBoard);
  }
});

/* 
*
  Add Support For Swipe Controls
*
*/

/**
 * Determine the direction of a swipe given start and end coordinates
 * @param {float} xS - starting x value
 * @param {float} yS - starting y value
 * @param {float} xE - ending x value
 * @param {float}} yE - ending y value
 * @returns -2 if gesture was 'swipe right'
 *          +2 if gesture was 'swipe left'
 *          -3 if gesture was 'swipe down'
 *          +3 if gesture was 'swipe up'
 */
function swipeDirection(xS, yS, xE, yE) {
  const dx = xS - xE;
  const xDir = dx / Math.abs(dx);
  const dy = yS - yE;
  const yDir = dy / Math.abs(dy);

  // whichever axis had more movement will be our swipe axis
  if (Math.abs(dx) >= Math.abs(dy)) {
    return xDir * 2;
  } else {
    return yDir * 3;
  }
}

/**
 * {float} xStart : x coordinate of the start of current swipe
 * {float} yStart : y coordinate of the start of current swipe 
 */
let xStart;
let yStart;

visualBoard.addEventListener('touchstart', (e) => {
  xStart = e.changedTouches[0].clientX;
  yStart = e.changedTouches[0].clientY;
});

/**
 * Essentially repeat work for keyboard input with added step of determining
 *  what direction the swipe was in
 */
visualBoard.addEventListener('touchend', (e) => {
  /* create deep copy of boardState to reference later */
  oldBoardArray = curBoard.board.map(innerArray => innerArray.slice());

  const xEnd = e.changedTouches[0].clientX;
  const yEnd = e.changedTouches[0].clientY;
  const dir = swipeDirection(xStart, yStart, xEnd, yEnd)

  switch (dir) {
    case -2:
      /* swipe right */
      curBoard.shiftRight();
      break;
    case 2:
      /* swipe left */
      curBoard.shiftLeft();
      break;
    case 3:
      /* swipe up */
      curBoard.shiftUp();
      break;
    case -3:
      /* swipe down */
      curBoard.shiftDown();
      break;
    default:
      break;
  }

  makePlay(oldBoardArray, curBoard)
});
