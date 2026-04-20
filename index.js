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
let gameStarted = false;

let lastTime = 0;
const GAME_SPEED = 100; // milliseconds per move

function draw() {
  // Clear canvas with retro dark background
  ctx.fillStyle = '#111';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (!gameStarted) {
    // Title screen
    ctx.fillStyle = '#0f0';
    ctx.font = 'bold 28px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('BASECADE', canvas.width/2, 80);

    ctx.fillStyle = '#fff';
    ctx.font = '18px monospace';
    ctx.fillText('CLASSIC SNAKE', canvas.width/2, 120);

    ctx.font = '16px monospace';
    ctx.fillText('Press SPACE to Start', canvas.width/2, 200);
    ctx.fillText('← ↑ ↓ →  to move', canvas.width/2, 230);
    return;
  }

  if (gameOver) {
    // Game Over screen
    ctx.fillStyle = '#f00';
    ctx.font = 'bold 32px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width/2, 100);

    ctx.fillStyle = '#fff';
    ctx.font = '20px monospace';
    ctx.fillText(`SCORE: ${score}`, canvas.width/2, 160);

    ctx.font = '16px monospace';
    ctx.fillText('Press SPACE to Restart', canvas.width/2, 220);
    return;
  }

  // Draw snake
  snake.forEach((segment, index) => {
    if (index === 0) {
      // Snake head - brighter with direction eye
      ctx.fillStyle = '#0f0';
      ctx.fillRect(segment.x * GRID_SIZE, segment.y * GRID_SIZE, GRID_SIZE - 2, GRID_SIZE - 2);
      
      // Eye dot
      ctx.fillStyle = '#000';
      const eyeSize = 4;
      let eyeX1, eyeY1, eyeX2, eyeY2;
      
      if (dx === 1) { // right
        eyeX1 = segment.x * GRID_SIZE + 12;
        eyeY1 = segment.y * GRID_SIZE + 6;
        eyeX2 = segment.x * GRID_SIZE + 12;
        eyeY2 = segment.y * GRID_SIZE + 12;
      } else if (dx === -1) { // left
        eyeX1 = segment.x * GRID_SIZE + 4;
        eyeY1 = segment.y * GRID_SIZE + 6;
        eyeX2 = segment.x * GRID_SIZE + 4;
        eyeY2 = segment.y * GRID_SIZE + 12;
      } else if (dy === -1) { // up
        eyeX1 = segment.x * GRID_SIZE + 6;
        eyeY1 = segment.y * GRID_SIZE + 4;
        eyeX2 = segment.x * GRID_SIZE + 12;
        eyeY2 = segment.y * GRID_SIZE + 4;
      } else { // down
        eyeX1 = segment.x * GRID_SIZE + 6;
        eyeY1 = segment.y * GRID_SIZE + 14;
        eyeX2 = segment.x * GRID_SIZE + 12;
        eyeY2 = segment.y * GRID_SIZE + 14;
      }
      
      ctx.fillRect(eyeX1, eyeY1, eyeSize, eyeSize);
      ctx.fillRect(eyeX2, eyeY2, eyeSize, eyeSize);
    } else {
      // Snake body - slightly darker green
      const shade = Math.max(80, 255 - index * 8);
      ctx.fillStyle = `rgb(0, ${shade}, 0)`;
      ctx.fillRect(segment.x * GRID_SIZE, segment.y * GRID_SIZE, GRID_SIZE - 2, GRID_SIZE - 2);
    }
  });

  // Draw food with bright red
  ctx.fillStyle = '#f00';
  ctx.fillRect(food.x * GRID_SIZE, food.y * GRID_SIZE, GRID_SIZE - 2, GRID_SIZE - 2);

  // Draw score
  ctx.fillStyle = '#0f0';
  ctx.font = '16px monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`SCORE: ${score}`, 10, 25);
}

function update() {
  if (!gameRunning || gameOver) return;

  // Move snake
  const head = { x: snake[0].x + dx, y: snake[0].y + dy };

  // Check wall collision
  if (head.x < 0 || head.x >= GRID_WIDTH || head.y < 0 || head.y >= GRID_HEIGHT) {
    gameOver = true;
    gameRunning = false;
    return;
  }

  // Check self collision
  for (let segment of snake) {
    if (segment.x === head.x && segment.y === head.y) {
      gameOver = true;
      gameRunning = false;
      return;
    }
  }

  snake.unshift(head);

  // Check if ate food
  if (head.x === food.x && head.y === food.y) {
    score += 10;
    // Generate new food at random position (avoid snake body)
    let newFood;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_WIDTH),
        y: Math.floor(Math.random() * GRID_HEIGHT)
      };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    food = newFood;
  } else {
    snake.pop();
  }
}

function gameLoop(timestamp) {
  if (!lastTime) lastTime = timestamp;
  const deltaTime = timestamp - lastTime;

  if (deltaTime > GAME_SPEED) {
    update();
    lastTime = timestamp;
  }

  draw();
  requestAnimationFrame(gameLoop);
}

// Keyboard controls
document.addEventListener('keydown', e => {
  if (e.key === ' ' || e.key === 'Spacebar') {
    if (!gameStarted || gameOver) {
      // Reset game
      snake = [{x: 10, y: 10}];
      dx = 1;
      dy = 0;
      food = {x: 15, y: 15};
      score = 0;
      gameOver = false;
      gameRunning = true;
      gameStarted = true;
      lastTime = 0;
    }
    return;
  }

  if (!gameRunning || gameOver) return;

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

// Initial draw (shows title screen)
draw();

console.log("Basecade Commit #4 - Improved snake visuals with head and gradient body. Press SPACE to play!");
