class Ball {
  /* constant values */
  static INITIAL_VELOCITY = .08; // (delta position / delta time)

  gameFrame = document.getElementById('gameFrame');
  ballElement = document.getElementById('ball');

  constructor(obstacles=[]) {
    this.reset();

    /* html elements to avoid (make copy since js pass by ref) */
    this.obstacles = Array.from(obstacles);
  }

  reset() {
    this.ball = {
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
    const deltaX = this.ball['velocity'] * deltaTime * this.ball['direction']['x'];
    const deltaY = this.ball['velocity'] * deltaTime * this.ball['direction']['y'];
  
    let newX = this.ball['position']['x'] + deltaX;
    let newY = this.ball['position']['y'] + deltaY;
  
    this.ball['position']['x'] = newX;
    this.ball['position']['y'] = newY;
    this.#updateBallVisual();
    this.#keepBallInbounds();
    this.#avoidObstacles();
  }
  
  #updateBallVisual() {
    this.ballElement.style.top = `${this.ball['position']['y']}%`;
    this.ballElement.style.left = `${this.ball['position']['x']}%`;
  }
  
  #keepBallInbounds() {
    const ballRect = this.ballElement.getBoundingClientRect();
    const boundingBoxRect = this.gameFrame.getBoundingClientRect();
  
    const exitLeft = ballRect.left <= 0;
    const exitRight = ballRect.right >= window.innerWidth;
    const dx = this.ball['direction']['x'];
    if ((exitLeft && dx < 0) || (exitRight && dx > 0)) {
      this.ball['direction']['x'] *= -1;;
    }

    const exitTop = ballRect.top <= boundingBoxRect.top;
    const exitBottom = ballRect.bottom >= boundingBoxRect.bottom
    const dy = this.ball['direction']['y'];
    if ((exitBottom && dy > 0) || (exitTop && dy < 0)) {
      //this.reset();
      this.ball['direction']['y'] *= -1;;
    }
  }

  #avoidObstacles() {
    const ballRect = this.ballElement.getBoundingClientRect();

    this.obstacles.forEach((obstacle) => {
      const oRect = obstacle.getBoundingClientRect();

      const dx = this.ball['direction']['x'];
      const dy = this.ball['direction']['y'];

      const withinWidth = (ballRect.left <= oRect.right && ballRect.left >= oRect.left) ||
                          (ballRect.right <= oRect.right && ballRect.right >= oRect.left);
      const withinHeight = (ballRect.bottom <= oRect.top && ballRect.bottom >= oRect.bottom) ||
                           (ballRect.top <= oRect.top && ballRect.top >= oRect.bottom);

      const intersectRight = ballRect.left <= oRect.right && ballRect.left >= oRect.left && withinHeight;
      const intersectLeft = ballRect.right <= oRect.right && ballRect.right >= oRect.left && withinHeight;
      const intersectTop = ballRect.bottom >= oRect.top && ballRect.bottom <= oRect.bottom && withinWidth;
      const intersectBottom = ballRect.top >= oRect.top && ballRect.top <= oRect.bottom && withinWidth;

      if (false && intersectRight && dx < 0 || intersectLeft && dx > 0) {
        this.ball['direction']['x'] *= -1;
      }
      if (intersectTop && dy > 0 || intersectBottom && dy < 0) {
        this.ball['direction']['y'] *= -1;
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

/* ball updates */
{
  window.requestAnimationFrame(gameCycle);

  let lastTimestamp;
  
  const U_P = document.getElementById('userPaddle');
  const COMP_P = document.getElementById('compPaddle');
  let ball = new Ball([U_P, COMP_P]);

  /* user paddle behavior */
  let user = new UserPaddle();
  document.addEventListener('keydown', (event) => { 
    user.keydownBehavior(event);
  });
  document.addEventListener('keyup', (event) => { 
    user.keyupBehavior(event);
  });

  function gameCycle(timestamp) {
    if (lastTimestamp == undefined) lastTimestamp = timestamp;

    const deltaTime = timestamp - lastTimestamp;
    lastTimestamp = timestamp;

    if (user.move.size == 1) {
      if (user.move.has('left')) {
        user.updatePosition(-1, deltaTime);
      } else if (user.move.has('right')) {
        user.updatePosition(1, deltaTime);
      }
    }
    ball.updateBallPosition(deltaTime);

    window.requestAnimationFrame(gameCycle);
  }
}


/* testing purposes */
let ball = document.getElementById('ball');
let bRect = ball.getBoundingClientRect();
console.log(bRect);

let userPaddle = document.getElementById('userPaddle');
let uRect = ball.getBoundingClientRect();
console.log(uRect)
