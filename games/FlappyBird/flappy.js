class bird {
  constructor() {
    this.properties = {
      "gravity" : 0.5,
      'movementSpeed' : 3
    }

    this.domElement = document.getElementById('bird-1');
  }

  reset() {
    this.domElement.style.top = '40vh';
    this.show();
  }

  get rect() {
    return this.domElement.getBoundingClientRect();
  }

  hide() {
    this.domElement.style.display = 'none';
  }

  show() {
    this.domElement.style.display = 'block';
  }

  dy = 0;
  move() {
    /* apply gravity at each cycle */
    this.dy += this.properties['gravity'];

    /* flap animation start */
    document.addEventListener('keydown', (e) => {
        if(e.key == 'ArrowUp' || e.key == ' '){
            this.domElement.src = '../../src/img/gameImages/LeFlappy/squishedBall.png';
            this.dy = -7.6;
        }
    });

    /* flap animation end */
    document.addEventListener('keyup', (e) => {
        if(e.key == 'ArrowUp' || e.key == ' '){
            this.domElement.src = '../../src/img/gameImages/bball.png';
        }
    });

    /* ensure inbounds */
    const bounds = document.getElementById('gameFrame').getBoundingClientRect();
    if(this.rect.top <= bounds.top || this.rect.bottom >= bounds.bottom){
        return false;
    }

    this.domElement.style.top = this.rect.top + this.dy + 'px';
    return true;
  }
};

class pipeGenerator {
  constructor() {
    this.pipeSeparation = 0;
    this.pipeGap = 35;
    this.gameFrame = document.getElementById('gameFrame');
  }

  get pipes() {
    return document.querySelectorAll('.pipe_sprite');
  }

  generate() {
    /* if it's been long enough since the last pipe, generate a pipe */
    if(this.pipeSeparation > 115){
      /* reset for next iteration */
      this.pipeSeparation = 0;

      /* randomize y position between 8 and 38 */
      let pipePosition = Math.floor(Math.random() * 30) + 8;

      /* generate current top pipe */
      let topPipe = document.createElement('div');
      topPipe.className = 'pipe_sprite';
      topPipe.style.top = pipePosition - 70 + 'vh';
      topPipe.style.left = '100vw';
      this.gameFrame.appendChild(topPipe);
      
      /* generate current bottom pipe */
      let bottomPipe = document.createElement('div');
      bottomPipe.className = 'pipe_sprite';
      /* use pipe gap to calc y position */
      bottomPipe.style.top = pipePosition + this.pipeGap + 'vh';
      bottomPipe.style.left = '100vw';
      bottomPipe.increase_score = '1';
      this.gameFrame.appendChild(bottomPipe);
    }

    this.pipeSeparation++;
  }
};

class Game {
  constructor() {
    this.active = false;
    this.bird = new bird();
    this.pipeGen = new pipeGenerator();

    this.properties = {
      "score" : 0,
      "soundPoint" : new Audio('./soundEffects/point.mp3'),
      "soundDie" : new Audio('./soundEffects/die.mp3')
    };

    this.gameElement = document.getElementById('background');
    this.scoreboard = document.getElementById('scoreboard');
    this.scoreCount = document.getElementById('scoreCount');
    this.message = document.getElementById('message');

    this.reset();
  }

  reset() {
    this.properties['score'] = 0;
    this.bird.hide();
    this.scoreboard.display = 'none';

    this.message.classList.add('messageStyle');
  }

  get frameRect() {
    return this.gameElement.getBoundingClientRect();
  }

  startGame() {
    this.active = true;
    this.bird.reset();

    /* set score and show scoreboard */
    this.scoreCount.textContent = this.properties['score'];
    this.scoreboard.style.display = 'block';
    
    this.message.innerHTML = '';
    this.message.classList.remove('messageStyle');

    /* have to create anon function to ensure update receives this object */
    window.requestAnimationFrame(() => {
      this.update()
    });
  }

  endGame() {
    this.active = false;

    this.message.innerHTML = 'Game Over'.fontcolor('red') + '<br>Press Enter To Restart';
    this.message.classList.add('messageStyle');
    this.bird.hide();
    this.properties['soundDie'].play();
  }

  update() {
    if(this.active == false) return;

    this.play();
    this.pipeGen.generate();
    if (!this.bird.move()) {
      this.endGame();
    }

    window.requestAnimationFrame(() => {
      this.update()
    });
  }

  play() {
    this.pipeGen.pipes.forEach((pipeElement) => {
      const pipeRect = pipeElement.getBoundingClientRect();
      const birdRect = this.bird.rect;

      if (pipeRect.right <= 0) {
          pipeElement.remove();
      } else{
          if (this.birdCollision(pipeRect)){
            this.endGame();
            return;
          }else{
              if(pipeRect.right < birdRect.left &&
                 pipeRect.right + this.bird.properties['movementSpeed'] >= birdRect.left &&
                 pipeElement.increase_score === '1'){
                  this.scoreCount.innerText = parseInt(this.scoreCount.innerText) + 1;
                  this.properties['soundPoint'].play();
              }
              pipeElement.style.left = pipeRect.left - this.bird.properties['movementSpeed'] + 'px';
          }
      }
  });
  }

  birdCollision(pipeRect) {
    const birdRect = this.bird.rect;
    return birdRect.left < pipeRect.left + pipeRect.width &&
           birdRect.left + birdRect.width > pipeRect.left &&
           birdRect.top < pipeRect.top + pipeRect.height &&
           birdRect.top + birdRect.height > pipeRect.top;
  }
};

let game = new Game();

/* start game */
document.addEventListener('keydown', (e) => {
  if(e.key == 'Enter' && !game.active){
      game.pipeGen.pipes.forEach((pipeElement) => {
          pipeElement.remove();
      });

      game.startGame();
  }
});


