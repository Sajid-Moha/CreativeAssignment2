class Game {

  /**
   * 
   * @param {HTMLElement[]} obstacles - DOM elements ball should bounce off of
   */
  constructor(obstacles) {
    this.userPoints = 0;
    this.computerPoints = 0;

    this.ball = new Ball(obstacles);
    this.user = new UserPaddle();
    this.comp = new compPaddle();

    document.addEventListener('keydown', (event) => { 
      this.user.keydownBehavior(event);
    });
    document.addEventListener('keyup', (event) => { 
      this.user.keyupBehavior(event);
    });
  }

  resetPositions() {
    this.ball.reset();
    this.user.reset();
    this.comp.reset();
  }

  prevTimestamp;
  gameCycle(timestamp) {
    if (this.prevTimestamp == undefined) this.prevTimestamp = timestamp;

    const deltaTime = timestamp - this.prevTimestamp;
    this.prevTimestamp = timestamp;

    if (this.user.move.size == 1) {
      if (this.user.move.has('left')) {
        this.user.updatePosition(-1, deltaTime);
      } else if (this.user.move.has('right')) {
        this.user.updatePosition(1, deltaTime);
      }
    }
    
    const scoreChange = this.ball.updateBallPosition(deltaTime);
    if (scoreChange != 0) {
      if (scoreChange === 1) this.userPoints += 1;
      if (scoreChange === -1) this.computerPoints += 1;
      this.resetPositions();

      console.log(`${this.userPoints} - ${this.computerPoints}`)
    }
    this.comp.updatePosition(this.ball.properties.position['x'], deltaTime);
  }
};

class Ball {
  /* constant values */
  static INITIAL_VELOCITY = .08; // (delta position / delta time)
  resets = [];

  gameFrame = document.getElementById('gameFrame');
  ballElement = document.getElementById('ball');

  constructor(obstacles=[]) {
    this.reset();

    /* html elements to avoid (make copy since js pass by ref) */
    this.obstacles = Array.from(obstacles);
  }

  reset() {
    this.properties = {
      'direction': this.#generateStartDirection(),
      'velocity': Ball.INITIAL_VELOCITY,
      'position': { 'x': 50, 'y': 50 }
    };
  }

  #generateStartDirection() {
    /* we want to generate a unit vector so that we can multiply it by our 
        ball's velocity to get new position */
    function createUnitVector(x, y) {
      const magnitude = Math.sqrt(x * x + y * y);
      if (magnitude == 0) return { 'x': 0, 'y': 0};
    
      return { 'x': x / magnitude, 'y': y / magnitude };
    }
  
    /* generate random values between -1 to 1 (to support 360 degrees) */
    let x = Math.random() * 2 - 1;
    let y = Math.random() * 2 - 1;
  
    let uv = createUnitVector(x, y);
  
    /* we want to restrict the range of direction for user experience */
    while (Math.abs(uv['x']) < .2 || Math.abs(uv['x']) > .6) {
      x = Math.random() * 2 - 1;
      y = Math.random() * 2 - 1;
    
      uv = createUnitVector(x, y);
    }

    return uv;
  }

  updateBallPosition(deltaTime) {
    const deltaX = this.properties['velocity'] * deltaTime * this.properties['direction']['x'];
    const deltaY = this.properties['velocity'] * deltaTime * this.properties['direction']['y'];
  
    let newX = this.properties['position']['x'] + deltaX;
    let newY = this.properties['position']['y'] + deltaY;
  
    this.properties['position']['x'] = newX;
    this.properties['position']['y'] = newY;
    this.#updateBallVisual();
    this.#avoidObstacles();
    
    const scoreChange = this.#keepBallInbounds();
    return scoreChange;
  }
  
  #updateBallVisual() {
    this.ballElement.style.top = `${this.properties['position']['y']}%`;
    this.ballElement.style.left = `${this.properties['position']['x']}%`;
  }
  
  #keepBallInbounds() {
    const ballRect = this.ballElement.getBoundingClientRect();
    const boundingBoxRect = this.gameFrame.getBoundingClientRect();
  
    const exitLeft = ballRect.left <= 0;
    const exitRight = ballRect.right >= window.innerWidth;
    const dx = this.properties['direction']['x'];
    if ((exitLeft && dx < 0) || (exitRight && dx > 0)) {
      this.properties['direction']['x'] *= -1;
    }

    const exitTop = ballRect.top <= boundingBoxRect.top;
    const exitBottom = ballRect.bottom >= boundingBoxRect.bottom
    const dy = this.properties['direction']['y'];
    if ((exitBottom && dy > 0) || (exitTop && dy < 0)) {
      if (exitTop) {
        return 1;
      } else {
        return -1;
      }
    }
    return 0;
  }

  #avoidObstacles() {
    const ballRect = this.ballElement.getBoundingClientRect();

    this.obstacles.forEach((obstacle) => {
      const oRect = obstacle.getBoundingClientRect();

      const dx = this.properties['direction']['x'];
      const dy = this.properties['direction']['y'];

      const withinWidth = (ballRect.left <= oRect.right && ballRect.left >= oRect.left) ||
                          (ballRect.right <= oRect.right && ballRect.right >= oRect.left);
      const withinHeight = (ballRect.bottom <= oRect.top && ballRect.bottom >= oRect.bottom) ||
                           (ballRect.top <= oRect.top && ballRect.top >= oRect.bottom);

      const intersectRight = ballRect.left <= oRect.right && ballRect.left >= oRect.left && withinHeight;
      const intersectLeft = ballRect.right <= oRect.right && ballRect.right >= oRect.left && withinHeight;
      const intersectTop = ballRect.bottom >= oRect.top && ballRect.bottom <= oRect.bottom && withinWidth;
      const intersectBottom = ballRect.top >= oRect.top && ballRect.top <= oRect.bottom && withinWidth;

      if (false && intersectRight && dx < 0 || intersectLeft && dx > 0) {
        this.properties['direction']['x'] *= -1;
      }
      if (intersectTop && dy > 0 || intersectBottom && dy < 0) {
        this.properties['direction']['y'] *= -1;
      }
    });
  }
};

class UserPaddle {
  /* const variables */
  static USER_VELOCITY = .1;

  constructor() {
    this.reset();
    this.move = new Set();
  }

  reset() {
    this.paddle = {
      'x': 50,
      'y': 90 // will never change
    };
  }

  updatePosition(direction, deltaTime) {
    /* if left, direction = -1 and if right, direction = 1 */
    this.paddle['x'] += UserPaddle.USER_VELOCITY * direction * deltaTime;

    this.#updatePaddleVisual();
  }

  #updatePaddleVisual() {
    const paddleElement = document.getElementById('userPaddle');
    paddleElement.style.left = `${this.paddle['x']}%`;
  }

  keydownBehavior(event) {
    if (event.key == 'ArrowLeft') {
      this.move.add('left');
    } else if (event.key == 'ArrowRight') {
      this.move.add('right')
    }
  }

  keyupBehavior(event) {
    if (event.key == 'ArrowLeft') {
      this.move.delete('left');
    } else if (event.key == 'ArrowRight') {
      this.move.delete('right');
    }
  }
};

class compPaddle {
  /* const variables */
  static COMP_VELOCITY = .08;

  constructor() {
    this.reset();
    this.move = new Set();
  }

  reset() {
    this.paddle = {
      'x': 50,
      'y': 10 // will never change
    };
  }

  updatePosition(goal_location, deltaTime) {
    this.paddle['x'] += compPaddle.COMP_VELOCITY * (goal_location - this.paddle['x']) * deltaTime;

    this.#updatePaddleVisual();
  }

  #updatePaddleVisual() {
    const paddleElement = document.getElementById('compPaddle');
    paddleElement.style.left = `${this.paddle['x']}%`;
  }
};

/* frame updates */
window.requestAnimationFrame(gameCycle);

const U_P = document.getElementById('userPaddle');
const COMP_P = document.getElementById('compPaddle');
let game = new Game([U_P, COMP_P]);

function gameCycle(timestamp) {
  game.gameCycle(timestamp);
  window.requestAnimationFrame(gameCycle);
}

let b_speed = Ball.INITIAL_VELOCITY;
let u_speed = UserPaddle.USER_VELOCITY;
let c_speed = compPaddle.COMP_VELOCITY;

let pause_counter = 1;
document.addEventListener('keydown', (e) => {
  if (e.key == ' ') {
    if (pause_counter % 2 != 0) {
      b_speed = Ball.INITIAL_VELOCITY;
      u_speed = UserPaddle.USER_VELOCITY;
      c_speed = compPaddle.COMP_VELOCITY;

      game.ball.properties.velocity = 0;
      UserPaddle.USER_VELOCITY = 0;
      compPaddle.COMP_VELOCITY = 0;
    } else {
      game.ball.properties.velocity = b_speed;
      UserPaddle.USER_VELOCITY = u_speed;
      compPaddle.COMP_VELOCITY = c_speed;
    }

    pause_counter += 1;
  }
});
