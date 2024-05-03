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


const colorDict = {
  0: '#FFFFFF',
  2: '#8D7273',
  4: '#8D728A',
  8: '#8D72A6',
  16: '#8D72C6',
  32: '#8D72D7',
  64: '#8D72EA',
  128: '#8D72F7',
  256: '#843F5E',
  512: '#B53F5E',
  1024: '#D13F5E',
  2048: '#D13F5E',
  4096: '#FF3F5E' 
};

let b = [[2, 2, 2, 2],
         [2, 2, 2, 2],
         [2, 2, 2, 2],
         [2, 2, 2, 2]];
let curBoard = new Game();
const visualBoard = document.getElementById('board');

function updateVisualBoard(board) {
  let cur_row = visualBoard.firstElementChild;
  board.forEach((row) => {
    let cur_tile = cur_row.firstElementChild;
    row.forEach((tile_value) => {
      cur_tile.innerText = tile_value;
      if (tile_value == 0) {
        cur_tile.innerText = "";
      }

      cur_tile.style.backgroundColor = colorDict[tile_value];

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
