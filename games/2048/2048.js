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
    this.updateEmptyPositions();
    if (boardState == undefined) {
      return;
    }

    // create deep copy of boardState
    this.board = boardState.map(innerArray => innerArray.slice());
  }

  /**
   * Saves coordinates of all empty tiles. Will be used to set position of
   *  randomly generated values and to determine when game is over
   */
  updateEmptyPositions() {
    this.emptyPositions = [];

    for (let row = 0; row < this.numRows; row++) {
      for (let col = 0; col < this.numCols; col++) {
        if (this.board[row][col] == 0) {
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
      let cur_col = this.#getCol(col);
      this.#shiftRowLeft(cur_col);
      this.#updateCol(col, cur_col);
    }
    this.updateEmptyPositions();
  }

  shiftDown() {
    for (let col = 0; col < this.numCols; col++) {
      let cur_col = this.#getCol(col);
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

let curBoard = new Game();
const visualBoard = document.getElementById('board');

function updateVisualBoard(board) {
  let cur_row = visualBoard.firstElementChild;
  board.forEach((row) => {
    console.log(row)
    let cur_tile = cur_row.firstElementChild;

    row.forEach((tile_value) => {
      let cur_image = cur_tile.firstElementChild;
      cur_image.src = imgDict[tile_value]

      cur_tile = cur_tile.nextElementSibling;
    });
    cur_row = cur_row.nextElementSibling;
  });
}
curBoard.generateValue();
updateVisualBoard(curBoard.board);
document.addEventListener('keydown', function(event) {

  // create deep copy of boardState
  oldBoard = curBoard.board.map(innerArray => innerArray.slice());

  if (event.key === 'ArrowLeft') {
    curBoard.shiftLeft();
  }
  if (event.key === 'ArrowRight') {
    curBoard.shiftRight();
  }
  if (event.key === 'ArrowUp') {
    curBoard.shiftUp();
  }
  if (event.key === 'ArrowDown') {
    curBoard.shiftDown();
  }

  if (!compareBoards(oldBoard, curBoard.board)) {
    curBoard.generateValue();
  }
  
  updateVisualBoard(curBoard.board);
});

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
