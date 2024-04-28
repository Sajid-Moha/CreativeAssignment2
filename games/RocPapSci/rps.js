// translates int representation of play to string
const PLAY_TRANSLATOR = {0: 'rock',
                      1: 'paper',
                      2: 'scissors'};

// field announcing what you played
const PLAYER_DISPLAY = document.getElementById('userPlay');
// field announcing what opponent "LeBron" played
const COMP_DISPLAY = document.getElementById('compPlay');
// field announcing who won the game
const WINNER_DISPLAY = document.getElementById('winner');

// user play buttons:
const PLAY_ROCK = document.getElementById('rock');
const PLAY_PAPER = document.getElementById('paper');
const PLAY_SCISSORS = document.getElementById('scissors');

/**
 * Complete one round of rock paper scissors
 * @param {int} play - what user's play was. 0=rock, 1=paper, 2=scissors 
 */
function rockPaperScissors(play) {
  // generate int between 0 and 2 (inclusive)
  let computer_play = Math.floor(Math.random() * 3);
  let result = winTrue(play, computer_play);

  let player_play = PLAY_TRANSLATOR[play];
  computer_play = PLAY_TRANSLATOR[computer_play];
  PLAYER_DISPLAY.innerText = `You played: ${player_play}`;
  COMP_DISPLAY.innerText = `LeBron played: ${computer_play}`;
  
  switch (result) {
    case 0:
      WINNER_DISPLAY.innerText = "TIE! No Winner :(";
      break;
    case 1:
      WINNER_DISPLAY.innerText = "YOU WON! :D";
      break;
    case 2:
      WINNER_DISPLAY.innerText = "You Lost :(, but on the bright side LeBron won!!!" 
      break;
    default:
      WINNER_DISPLAY.innerText = "ERROR!";
  }
}

/**
 * 
 * @param {int} play_one - integer representing player 1's move
 * @param {int} play_two - integer representing player 2's move
 * @returns 0 if tie, 1 if player one wins, 2 if player 2 wins
 */
function winTrue(play_one, play_two) {
  // case one: rock
  if (play_one == 0) {
    switch (play_two) {
      case 0: // rock
        return 0;
      case 1: // paper
        return 2;
      case 2: // scissors
        return 1;
      default:
        return null;
    }
  }

  // case two: paper
  else if (play_one == 1) {
    switch (play_two) {
      case 0: // rock
        return 1;
      case 1: // paper
        return 0;
      case 2: // scissors
        return 2;
      default:
        return null;
    }
  }

  // case three: scissors
  else if (play_one == 2) {
    switch (play_two) {
      case 0: // rock
        return 2;
      case 1: // paper
        return 1;
      case 2: // scissors
        return 0;
      default:
        return null;
    }
  }

  // invalid play number
  else {
    throw new Error('winTrue received an invalid integer for player 1s move');
  }
}

PLAY_ROCK.addEventListener('click', () => { rockPaperScissors(0) });
PLAY_PAPER.addEventListener('click', () => { rockPaperScissors(1) });
PLAY_SCISSORS.addEventListener('click', () => { rockPaperScissors(2) });
