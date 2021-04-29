
// Grabs the HTML element that contains the grid
const gameBoard = document.getElementById('game-board');
let snakeSpeed = 10;
const GRID_SIZE = 30; // Has to be changed concurrently with grid-template
const GROW_RATE = 4; // When the snake eats a food
let lastTime = 0;
let snakeGrow = 0;

let snakeBody = [{ x: Math.floor(GRID_SIZE/2), y: Math.floor(GRID_SIZE/2) }];
let food = [randomFood()];
let inputQueue = [];
let lastInput = { x: 0, y: 0 };


function main(currentTime) {
  if (SnakeTrapped()) {
    showGameOver();
    window.requestAnimationFrame(main);
    return;
  }

  window.requestAnimationFrame(main);
  if ((currentTime - lastTime) / 1000 < 1 / snakeSpeed) {
    return;
  }
  lastTime = currentTime;
  update();
  draw();
}

function update() {
  let input = getInput();
  // You can't lose - you can't run into yourself or into a wall
  if ( !(snakeHitsWall(input) || snakeHitsSelf(input)) ) {
    updateSnake(input);
  }
  updateFood();
}

function draw() {
  gameBoard.innerHTML = '';
  drawSquare(gameBoard, food, 'food');
  drawSquare(gameBoard, snakeBody, 'snake');
}

function showGameOver() {
  // Shows an overlay where it basically says that you lost
  document.getElementById('gameover-overlay').style.display = 'block';
}

function remove() {
  // Click to restart the game
  document.getElementById("gameover-overlay").style.display = "none";
  restart();
}

function restart() {
  // Start the gameBoard as new
  snakeBody = [{ x: Math.floor(GRID_SIZE/2), y: Math.floor(GRID_SIZE/2) }];
  food = [randomFood()];
  inputQueue = [];
  lastInput = { x: 0, y: 0 };
}

function drawSquare(gameBoard, squares, type) {
  squares.forEach(square => {
    const typeElement = document.createElement('div');
    typeElement.style.gridRowStart = square.y;
    typeElement.style.gridColumnStart = square.x;
    typeElement.classList.add(type);
    gameBoard.appendChild(typeElement);
  })
}

function updateFood() {
  // If the snake ate a food, make the snake grow, also spawn a new food
  for (let i = 0; i < food.length; i++) {
    snakeBody.forEach(snakeSegment => {
      if(food[i].x === snakeSegment.x && food[i].y === snakeSegment.y) {
        snakeGrow += GROW_RATE;
        food[i] = randomFood();
      }
    })
  }
}

function updateSnake(input) {
  growSnake();
  // Shifts the body up by one and then move the head depending on what user wants
  for (let i = snakeBody.length - 2; i >= 0; i--) {
    snakeBody[i + 1] = {...snakeBody[i]};
  }
  snakeBody[0].x += input.x;
  snakeBody[0].y += input.y;
}

function snakeHitsWall(move) {
    return (
    (snakeBody[0].x === GRID_SIZE && move.x === 1) ||
    (snakeBody[0].x === 1 && move.x === -1) ||
    (snakeBody[0].y === GRID_SIZE && move.y === 1) ||
    (snakeBody[0].y === 1 && move.y === -1)
  )
}

function snakeHitsSelf(move) {
  let headx = snakeBody[0].x + move.x;
  let heady = snakeBody[0].y + move.y;
  // This checks that if the head would've hit any part of its body
  for (let i = 1; i < snakeBody.length; i++) {
    if (headx === snakeBody[i].x && heady === snakeBody[i].y) {
      return true;
    }
  }
  return false;
}

function growSnake() {
  for (let i = 0; i < snakeGrow; i++) {
    snakeBody.push({ ...snakeBody[snakeBody.length-1] });
  }
  snakeGrow = 0;
}

function SnakeTrapped() {
  // There are two ways in which a snake can be trapped
  // 1. The head of the snake is trapped within its body
  // 2. The head of the snake is by a wall and in the other directions is its body
  let up = { x: 0, y: -1 };
  let down = { x: 0, y: 1 };
  let left = { x: -1, y: 0 };
  let right = { x: 1, y: 0 };
  return (
    (snakeHitsSelf(up) || snakeHitsWall(up)) &&
    (snakeHitsSelf(down) || snakeHitsWall(down)) &&
    (snakeHitsSelf(left) || snakeHitsWall(left)) &&
    (snakeHitsSelf(right) || snakeHitsWall(right))
  );
}

function onSnake(position) {
  return snakeBody.some(segment => {
    return segment.x === position.x && segment.y === position.y;
  })
}

function randomFood() {
  // food can spawn on itself and that's ok!
  // if the snake has filled almost all of the board, the game would just freeze
  // -- that needs to be fixed
  let food = randomGridPosition();
  while (onSnake(food)) {
    food = randomGridPosition();
  }
  return food;
}

function randomGridPosition() {
  return {
    x: Math.floor(Math.random() * GRID_SIZE) + 1,
    y: Math.floor(Math.random() * GRID_SIZE) + 1
  };
}

function getInput() {
  // implemented a "move" queue because if you tap the arrow keys too fast,
  // the snake would sometimes not move at all
  // this can be seen if the snake speed is pretty slow -- which has to be fixed
  if (inputQueue.length === 0) {
    // just keep going if no move has been introduced
    return lastInput;
  }
  lastInput = inputQueue.shift();
  return lastInput;
}

window.addEventListener('keydown', e => {
  switch(e.key) {
    case 'ArrowUp':
      inputQueue.push({ x: 0, y: -1});
      break;
    case 'ArrowDown':
      inputQueue.push({ x: 0, y: 1 });
      break;
    case 'ArrowLeft':
      inputQueue.push({ x: -1, y: 0 });
      break;
    case 'ArrowRight':
      inputQueue.push({ x: 1, y: 0 });
      break;
    // easter eggs and bonuses and cheats
    case('g'):
      snakeGrow += 1;
      break;
    case('f'):
      food.push(randomFood());
      break;
    case('h'):
      if (snakeSpeed === 1) {
        break;
      }
      snakeSpeed -= 1;
      break;
    case('j'):
      snakeSpeed += 1;
      break;
    case('r'):
      remove();
      break;
  }
});


window.requestAnimationFrame(main);
