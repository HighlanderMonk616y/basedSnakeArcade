// basecade - Classic Snake Arcade Game
// A fun little browser-based Snake game

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const GRID_SIZE = 20;
const GRID_WIDTH = 20;
const GRID_HEIGHT = 20;

canvas.width = GRID_WIDTH * GRID_SIZE;
canvas.height = GRID_HEIGHT * GRID_SIZE;

let snake = [
  {x: 10, y: 10}
];

let dx = 1;
let dy = 0;

let food = {x: 15, y: 15};

let score = 0;
let gameOver = false;
let gameRunning = false;

let lastTime = 0;
const GAME_SPEED = 100; // milliseconds per move

function draw() {
  // Clear canvas with retro dark background
  ctx.fillStyle = '#111';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw snake with neon green
  ctx.fillStyle = '#0f0';
  snake.forEach(segment => {
    ctx.fillRect(segment.x * GRID_SIZE, segment.y * GRID_SIZE, GRID_SIZE - 2, GRID_SIZE - 2);
  });

  // Draw food with bright red
  ctx.fillStyle = '#f00';
  ctx.fillRect(food.x * GRID_SIZE, food.y * GRID_SIZE, GRID_SIZE - 2, GRID_SIZE - 2);
}

function update() {
  if (!gameRunning || gameOver) return;

  // Move snake
  const head = { x: snake[0].x + dx, y: snake[0].y + dy };

  // Check wall collision
  if (head.x < 0 || head.x >= GRID_WIDTH || head.y < 0 || head.y >= GRID_HEIGHT) {
    gameOver = true;
    return;
  }

  // Check self collision
  for (let segment of snake) {
    if (segment.x === head.x && segment.y === head.y) {
      gameOver = true;
      return;
    }
  }

  snake.unshift(head);

  // Check if ate food
  if (head.x === food.x && head.y === food.y) {
    score += 10;
    // Generate new food
    food = {
      x: Math.floor(Math.random() * GRID_WIDTH),
      y: Math.floor(Math.random() * GRID_HEIGHT)
    };
  } else {
    snake.pop();
  }
}

function gameLoop(timestamp) {
  if (!lastTime) lastTime = timestamp;
  const deltaTime = timestamp - lastTime;

  if (deltaTime > GAME_SPEED) {
    update();
    draw();
    lastTime = timestamp;
  }

  requestAnimationFrame(gameLoop);
}

// Keyboard controls
document.addEventListener('keydown', e => {
  if (!gameRunning) {
    gameRunning = true;
    requestAnimationFrame(gameLoop);
    return;
  }

  switch (e.key) {
    case 'ArrowUp':
      if (dy !== 1) { dx = 0; dy = -1; }
      break;
    case 'ArrowDown':
      if (dy !== -1) { dx = 0; dy = 1; }
      break;
    case 'ArrowLeft':
      if (dx !== 1) { dx = -1; dy = 0; }
      break;
    case 'ArrowRight':
      if (dx !== -1) { dx = 1; dy = 0; }
      break;
  }
});

// Initial draw
draw();

console.log("Basecade Commit #2 - Game loop and controls added. Press any arrow key to start!");
