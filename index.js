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
let foodPulse = 0;

let score = 0;
let highScore = localStorage.getItem('basecadeHighScore') || 0;
let gameOver = false;
let gameRunning = false;
let gameStarted = false;
let paused = false;

let lastTime = 0;
let gameSpeed = 100;

function drawNeonBorder() {
  ctx.strokeStyle = '#0ff';
  ctx.lineWidth = 6;
  ctx.shadowColor = '#0ff';
  ctx.shadowBlur = 15;
  ctx.strokeRect(3, 3, canvas.width - 6, canvas.height - 6);
  ctx.shadowBlur = 0;
}

function drawGrid() {
  ctx.strokeStyle = '#222';
  ctx.lineWidth = 1;
  for (let x = 0; x <= GRID_WIDTH; x++) {
    ctx.beginPath();
    ctx.moveTo(x * GRID_SIZE, 0);
    ctx.lineTo(x * GRID_SIZE, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y <= GRID_HEIGHT; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * GRID_SIZE);
    ctx.lineTo(canvas.width, y * GRID_SIZE);
    ctx.stroke();
  }
}

function draw() {
  ctx.fillStyle = '#111';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawGrid();
  drawNeonBorder();

  if (!gameStarted) {
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
    ctx.fillText('P to Pause', canvas.width/2, 260);

    ctx.fillStyle = '#ff0';
    ctx.fillText(`HIGH SCORE: ${highScore}`, canvas.width/2, 300);
    return;
  }

  if (gameOver) {
    ctx.fillStyle = '#f00';
    ctx.font = 'bold 32px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width/2, 100);

    ctx.fillStyle = '#fff';
    ctx.font = '20px monospace';
    ctx.fillText(`SCORE: ${score}`, canvas.width/2, 160);

    if (score > highScore) {
      highScore = score;
      localStorage.setItem('basecadeHighScore', highScore);
      ctx.fillStyle = '#0f0';
      ctx.fillText('NEW HIGH SCORE!', canvas.width/2, 190);
    }

    ctx.fillStyle = '#fff';
    ctx.font = '16px monospace';
    ctx.fillText('Press SPACE to Restart', canvas.width/2, 230);
    return;
  }

  if (paused) {
    ctx.fillStyle = 'rgba(0, 255, 0, 0.7)';
    ctx.font = 'bold 28px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', canvas.width/2, canvas.height/2);
    ctx.font = '16px monospace';
    ctx.fillText('Press P to Resume', canvas.width/2, canvas.height/2 + 40);
  }

  // Draw snake
  snake.forEach((segment, index) => {
    if (index === 0) {
      ctx.fillStyle = '#0f0';
      ctx.fillRect(segment.x * GRID_SIZE, segment.y * GRID_SIZE, GRID_SIZE - 2, GRID_SIZE - 2);
      
      ctx.fillStyle = '#000';
      const eyeSize = 4;
      let eyeX1, eyeY1, eyeX2, eyeY2;
      
      if (dx === 1) {
        eyeX1 = segment.x * GRID_SIZE + 12; eyeY1 = segment.y * GRID_SIZE + 6;
        eyeX2 = segment.x * GRID_SIZE + 12; eyeY2 = segment.y * GRID_SIZE + 12;
      } else if (dx === -1) {
        eyeX1 = segment.x * GRID_SIZE + 4; eyeY1 = segment.y * GRID_SIZE + 6;
        eyeX2 = segment.x * GRID_SIZE + 4; eyeY2 = segment.y * GRID_SIZE + 12;
      } else if (dy === -1) {
        eyeX1 = segment.x * GRID_SIZE + 6; eyeY1 = segment.y * GRID_SIZE + 4;
        eyeX2 = segment.x * GRID_SIZE + 12; eyeY2 = segment.y * GRID_SIZE + 4;
      } else {
        eyeX1 = segment.x * GRID_SIZE + 6; eyeY1 = segment.y * GRID_SIZE + 14;
        eyeX2 = segment.x * GRID_SIZE + 12; eyeY2 = segment.y * GRID_SIZE + 14;
      }
      
      ctx.fillRect(eyeX1, eyeY1, eyeSize, eyeSize);
      ctx.fillRect(eyeX2, eyeY2, eyeSize, eyeSize);
    } else {
      const shade = Math.max(60, 200 - index * 6);
      ctx.fillStyle = `rgb(0, ${shade}, 0)`;
      ctx.fillRect(segment.x * GRID_SIZE, segment.y * GRID_SIZE, GRID_SIZE - 2, GRID_SIZE - 2);
    }
  });

  // Draw pulsing food
  foodPulse = (foodPulse + 0.15) % (Math.PI * 2);
  const pulseSize = Math.sin(foodPulse) * 2 + (GRID_SIZE - 8);
  
  ctx.fillStyle = '#f00';
  ctx.fillRect(
    food.x * GRID_SIZE + (GRID_SIZE - pulseSize)/2,
    food.y * GRID_SIZE + (GRID_SIZE - pulseSize)/2,
    pulseSize,
    pulseSize
  );

  // Score
  ctx.fillStyle = '#0f0';
  ctx.font = '16px monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`SCORE: ${score}`, 10, 25);

  ctx.fillStyle = '#ff0';
  ctx.textAlign = 'right';
  ctx.fillText(`HIGH: ${highScore}`, canvas.width - 10, 25);
}

function update() {
  if (!gameRunning || gameOver || paused) return;

  const head = { x: snake[0].x + dx, y: snake[0].y + dy };

  if (head.x < 0 || head.x >= GRID_WIDTH || head.y < 0 || head.y >= GRID_HEIGHT) {
    gameOver = true;
    gameRunning = false;
    return;
  }

  for (let segment of snake) {
    if (segment.x === head.x && segment.y === head.y) {
      gameOver = true;
      gameRunning = false;
      return;
    }
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score += 10;
    if (score % 50 === 0 && gameSpeed > 40) {
      gameSpeed = Math.max(40, gameSpeed - 10);
    }

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

  if (deltaTime > gameSpeed) {
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
      snake = [{x: 10, y: 10}];
      dx = 1; dy = 0;
      food = {x: 15, y: 15};
      score = 0;
      gameSpeed = 100;
      gameOver = false;
      gameRunning = true;
      gameStarted = true;
      paused = false;
      lastTime = 0;
    }
    return;
  }

  if (e.key.toLowerCase() === 'p' && gameStarted && !gameOver) {
    paused = !paused;
    return;
  }

  if (!gameRunning || gameOver || paused) return;

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

console.log("Basecade Commit #7 - Neon border + pulsing food added. Looking very arcade now!");
