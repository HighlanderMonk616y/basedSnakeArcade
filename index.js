// basecade - Classic Snake Arcade Game
// A fun little browser-based Snake game

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const GRID_SIZE = 20;
const GRID_WIDTH = 20;
const GRID_HEIGHT = 20;

canvas.width = GRID_WIDTH * GRID_SIZE;
canvas.height = GRID_HEIGHT * GRID_SIZE;

// Simple Web Audio API for retro sounds
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let muted = false;

function playSound(freq, duration, type = 'square', volume = 0.3) {
  if (!audioContext || muted) return;
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
  gainNode.gain.value = volume;
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.start();
  setTimeout(() => {
    oscillator.stop();
  }, duration);
}

let snake = [
  {x: 10, y: 10}
];

let dx = 1;
let dy = 0;
let nextDx = 1;
let nextDy = 0;

let food = {x: 15, y: 15, isPowerUp: false};
let foodPulse = 0;

let score = 0;
let level = 1;
let combo = 0;
let comboTimer = 0;
let multiplier = 1;
let highScore = parseInt(localStorage.getItem('basecadeHighScore')) || 0;
let bestCombo = parseInt(localStorage.getItem('basecadeBestCombo')) || 0;
let gameOver = false;
let gameRunning = false;
let gameStarted = false;
let paused = false;
let invincible = 0;

let lastTime = 0;
let gameSpeed = 100;
let shakeTime = 0;
let gameOverTime = 0;
let milestoneFlash = 0;
let newRecordFlash = 0;

// Background stars
let stars = [];
for (let i = 0; i < 80; i++) {
  stars.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: Math.random() * 2.5 + 0.8,
    speed: Math.random() * 0.4 + 0.1
  });
}

// Particles
let particles = [];
let scorePopups = [];

// Touch swipe support
let touchStartX = 0;
let touchStartY = 0;

function createEatParticles(x, y, isBig = false) {
  const count = isBig ? 36 : 16;
  for (let i = 0; i < count; i++) {
    particles.push({
      x: x * GRID_SIZE + GRID_SIZE / 2,
      y: y * GRID_SIZE + GRID_SIZE / 2,
      vx: (Math.random() - 0.5) * (isBig ? 11 : 7),
      vy: (Math.random() - 0.5) * (isBig ? 11 : 7),
      life: isBig ? 55 : 32 + Math.random() * 20,
      color: isBig ? '#ff0' : '#0ff'
    });
  }
}

function createScorePopup(x, y, points) {
  scorePopups.push({
    x: x * GRID_SIZE + GRID_SIZE / 2,
    y: y * GRID_SIZE - 10,
    vy: -1.8,
    life: 55,
    score: points
  });
}

function triggerMilestone() {
  milestoneFlash = 25;
  shakeTime = 12;
  playSound(1200, 120, 'sine', 0.6);
  playSound(1800, 200, 'sine', 0.5);
  playSound(2400, 300, 'sine', 0.4);
}

function spawnFood() {
  const isPowerUp = Math.random() < 0.13;
  let newFood;
  do {
    newFood = {
      x: Math.floor(Math.random() * GRID_WIDTH),
      y: Math.floor(Math.random() * GRID_HEIGHT),
      isPowerUp: isPowerUp
    };
  } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
  food = newFood;
}

function getLevelFromScore() {
  return Math.floor(score / 100) + 1;
}

function getLevelColor() {
  const colors = ['#0ff', '#f0f', '#ff0', '#0f0', '#f80'];
  return colors[(level - 1) % colors.length];
}

function getRainbowColor(index) {
  const hue = (Date.now() / 8 + index * 25) % 360;
  return `hsl(${hue}, 100%, 65%)`;
}

function drawNeonBorder() {
  const color = getLevelColor();
  ctx.strokeStyle = color;
  ctx.lineWidth = 8;
  ctx.shadowColor = color;
  ctx.shadowBlur = 20;
  
  let offset = 0;
  if (shakeTime > 0) {
    offset = (Math.random() - 0.5) * 5;
    shakeTime--;
  }
  
  ctx.strokeRect(3 + offset, 3 + offset, canvas.width - 6, canvas.height - 6);
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

function drawStars() {
  ctx.fillStyle = '#fff';
  stars.forEach(star => {
    const alpha = 0.6 + Math.sin(Date.now() / 200 + star.x) * 0.4;
    ctx.globalAlpha = alpha;
    ctx.fillRect(star.x, star.y, star.size, star.size);
  });
  ctx.globalAlpha = 1;
}

function drawCRTScanlines() {
  ctx.strokeStyle = 'rgba(0, 255, 255, 0.08)';
  ctx.lineWidth = 2;
  for (let y = 0; y < canvas.height; y += 4) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

function draw() {
  ctx.fillStyle = '#050508';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawStars();
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
    ctx.fillText('← ↑ ↓ →  or Swipe', canvas.width/2, 230);
    ctx.fillText('P to Pause   M to Mute', canvas.width/2, 260);

    ctx.fillStyle = '#ff0';
    ctx.fillText(`HIGH SCORE: ${highScore}`, canvas.width/2, 300);
    ctx.fillText(`BEST COMBO: ${bestCombo}`, canvas.width/2, 325);
    return;
  }

  if (gameOver) {
    const alpha = Math.max(0.3, 1 - (Date.now() - gameOverTime) / 2000);
    
    ctx.globalAlpha = alpha;
    snake.forEach((segment, index) => {
      if (index === 0) {
        ctx.fillStyle = '#0f0';
        ctx.fillRect(segment.x * GRID_SIZE, segment.y * GRID_SIZE, GRID_SIZE - 2, GRID_SIZE - 2);
      } else {
        const shade = Math.max(40, 180 - index * 6);
        ctx.fillStyle = `rgb(0, ${shade}, 0)`;
        ctx.fillRect(segment.x * GRID_SIZE, segment.y * GRID_SIZE, GRID_SIZE - 2, GRID_SIZE - 2);
      }
    });
    ctx.globalAlpha = 1;

    ctx.fillStyle = '#f00';
    ctx.font = 'bold 32px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width/2, 100);

    ctx.fillStyle = '#fff';
    ctx.font = '20px monospace';
    ctx.fillText(`FINAL SCORE: ${score}`, canvas.width/2, 160);
    ctx.fillText(`MAX COMBO: ${combo}`, canvas.width/2, 190);
    ctx.fillText(`LEVEL REACHED: ${level}`, canvas.width/2, 220);
    ctx.fillText(`FINAL LENGTH: ${snake.length}`, canvas.width/2, 250);

    if (score > highScore) {
      highScore = score;
      localStorage.setItem('basecadeHighScore', highScore);
      ctx.fillStyle = '#0f0';
      ctx.fillText('🏆 NEW HIGH SCORE!', canvas.width/2, 285);
    }

    if (combo > bestCombo) {
      bestCombo = combo;
      localStorage.setItem('basecadeBestCombo', bestCombo);
      ctx.fillStyle = '#ff0';
      ctx.fillText('🔥 NEW BEST COMBO!', canvas.width/2, 315);
    }

    ctx.fillStyle = '#fff';
    ctx.font = '16px monospace';
    ctx.fillText('Press SPACE to Try Again', canvas.width/2, 350);
    drawCRTScanlines();
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
  const isRainbow = level >= 5;
  const isInvincible = invincible > 0;
  const flash = isInvincible && (Math.floor(Date.now() / 60) % 2 === 0);

  snake.forEach((segment, index) => {
    if (index === 0) {
      ctx.shadowColor = isInvincible ? '#ff0' : '#0f0';
      ctx.shadowBlur = isInvincible ? 22 : 12;
      ctx.fillStyle = flash ? '#ff0' : (isInvincible ? '#ff0' : '#0f0');
      ctx.fillRect(segment.x * GRID_SIZE, segment.y * GRID_SIZE, GRID_SIZE - 2, GRID_SIZE - 2);
      ctx.shadowBlur = 0;
      
      ctx.fillStyle = '#000';
      const eyeSize = 4;
      let eyeX1, eyeY1, eyeX2, eyeY2;
      if (dx === 1) { eyeX1 = segment.x * GRID_SIZE + 12; eyeY1 = segment.y * GRID_SIZE + 6; eyeX2 = segment.x * GRID_SIZE + 12; eyeY2 = segment.y * GRID_SIZE + 12; }
      else if (dx === -1) { eyeX1 = segment.x * GRID_SIZE + 4; eyeY1 = segment.y * GRID_SIZE + 6; eyeX2 = segment.x * GRID_SIZE + 4; eyeY2 = segment.y * GRID_SIZE + 12; }
      else if (dy === -1) { eyeX1 = segment.x * GRID_SIZE + 6; eyeY1 = segment.y * GRID_SIZE + 4; eyeX2 = segment.x * GRID_SIZE + 12; eyeY2 = segment.y * GRID_SIZE + 4; }
      else { eyeX1 = segment.x * GRID_SIZE + 6; eyeY1 = segment.y * GRID_SIZE + 14; eyeX2 = segment.x * GRID_SIZE + 12; eyeY2 = segment.y * GRID_SIZE + 14; }
      ctx.fillRect(eyeX1, eyeY1, eyeSize, eyeSize);
      ctx.fillRect(eyeX2, eyeY2, eyeSize, eyeSize);
    } else {
      let color;
      if (isRainbow) {
        color = getRainbowColor(index);
      } else {
        const intensity = Math.max(40, 220 - index * 7);
        color = `rgb(0, ${intensity}, 0)`;
      }
      if (isInvincible) ctx.globalAlpha = 0.5 + Math.sin(Date.now()/50) * 0.5;
      ctx.shadowColor = color;
      ctx.shadowBlur = 8;
      ctx.fillStyle = color;
      ctx.fillRect(segment.x * GRID_SIZE, segment.y * GRID_SIZE, GRID_SIZE - 2, GRID_SIZE - 2);
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }
  });

  // Draw food
  foodPulse = (foodPulse + 0.22) % (Math.PI * 2);
  const pulse = Math.sin(foodPulse) * 3 + (GRID_SIZE - (food.isPowerUp ? 4 : 7));
  
  ctx.shadowBlur = food.isPowerUp ? 32 : 15;
  ctx.shadowColor = food.isPowerUp ? '#ff0' : '#f00';
  ctx.fillStyle = food.isPowerUp ? '#ff0' : '#f00';
  ctx.fillRect(
    food.x * GRID_SIZE + (GRID_SIZE - pulse)/2,
    food.y * GRID_SIZE + (GRID_SIZE - pulse)/2,
    pulse,
    pulse
  );
  ctx.shadowBlur = 0;

  // Draw particles
  particles.forEach((p) => {
    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.life / 45;
    ctx.fillRect(p.x, p.y, 5, 5);
  });

  // Draw score popups
  ctx.font = 'bold 16px monospace';
  ctx.textAlign = 'center';
  scorePopups.forEach(p => {
    ctx.globalAlpha = p.life / 50;
    ctx.fillStyle = p.score > 20 ? '#ff0' : '#fff';
    ctx.fillText(`+${p.score}`, p.x, p.y);
  });
  ctx.globalAlpha = 1;

  if (milestoneFlash > 0) {
    ctx.fillStyle = `rgba(255, 255, 100, ${milestoneFlash / 30})`;
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('MILESTONE!', canvas.width/2, 90);
    milestoneFlash--;
  }

  if (newRecordFlash > 0) {
    ctx.fillStyle = `rgba(255, 215, 0, ${newRecordFlash / 40})`;
    ctx.font = 'bold 28px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('NEW RECORD!', canvas.width/2, 65);
    newRecordFlash--;
  }

  ctx.fillStyle = muted ? '#f66' : '#0f0';
  ctx.font = '14px monospace';
  ctx.textAlign = 'left';
  ctx.fillText(muted ? '🔇 MUTED' : '🔊 SOUND ON', 10, canvas.height - 12);

  ctx.fillStyle = '#0f0';
  ctx.font = '16px monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`SCORE: ${score}`, 10, 25);
  ctx.fillText(`LEN: ${snake.length}`, 10, 48);

  ctx.fillStyle = '#ff0';
  ctx.textAlign = 'right';
  ctx.fillText(`HIGH: ${highScore}`, canvas.width - 10, 25);
  ctx.fillText(`LEVEL: ${level}`, canvas.width - 10, 48);
  ctx.fillText(`COMBO: x${multiplier}`, canvas.width - 10, 71);

  drawCRTScanlines();
}

function update() {
  if (!gameRunning || gameOver || paused) return;

  if (invincible > 0) invincible--;

  if (comboTimer > 0) comboTimer--;
  else if (combo > 0) {
    combo = 0;
    multiplier = 1;
  }

  dx = nextDx;
  dy = nextDy;

  const head = { x: snake[0].x + dx, y: snake[0].y + dy };

  if ((head.x < 0 || head.x >= GRID_WIDTH || head.y < 0 || head.y >= GRID_HEIGHT) && invincible === 0) {
    gameOver = true;
    gameRunning = false;
    gameOverTime = Date.now();
    playSound(200, 400, 'sawtooth', 0.4);
    return;
  }

  for (let segment of snake) {
    if (segment.x === head.x && segment.y === head.y && invincible === 0) {
      gameOver = true;
      gameRunning = false;
      gameOverTime = Date.now();
      playSound(200, 400, 'sawtooth', 0.4);
      return;
    }
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    const isPowerUp = food.isPowerUp;
    combo++;
    multiplier = Math.min(6, Math.floor(combo / 3) + 1);
    const basePoints = isPowerUp ? 50 : 10;
    const points = basePoints * multiplier;
    score += points;

    if (isPowerUp) {
      invincible = 210; // ~3.5 seconds
      createEatParticles(food.x, food.y, true);
      playSound(900, 100, 'sine', 0.6);
      playSound(1600, 180, 'sine', 0.5);
    } else {
      createEatParticles(food.x, food.y, false);
    }

    if (score > highScore) {
      highScore = score;
      newRecordFlash = 45;
      localStorage.setItem('basecadeHighScore', highScore);
      playSound(1600, 80, 'sine', 0.5);
      playSound(2400, 120, 'sine', 0.4);
    }

    playSound(isPowerUp ? 1100 : 800 + combo * 60, 80, 'sine', 0.5);
    playSound(isPowerUp ? 1700 : 1250 + combo * 90, 100, 'sine', 0.4);
    createScorePopup(food.x, food.y, points);
    
    const newLevel = getLevelFromScore();
    if (newLevel > level) {
      level = newLevel;
      gameSpeed = Math.max(30, gameSpeed - 7);
      shakeTime = 8;
      playSound(1500, 100, 'sine', 0.5);
      playSound(2200, 200, 'sine', 0.4);
    }

    if (score % 500 === 0 && score > 0) {
      triggerMilestone();
    }

    spawnFood();
    comboTimer = 50;
  } else {
    snake.pop();
    playSound(400, 20, 'square', 0.1);
  }

  // Update particles
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life--;
    p.vx *= 0.94;
    p.vy *= 0.94;
    if (p.life <= 0) particles.splice(i, 1);
  }

  // Update score popups
  for (let i = scorePopups.length - 1; i >= 0; i--) {
    const p = scorePopups[i];
    p.y += p.vy;
    p.life--;
    if (p.life <= 0) scorePopups.splice(i, 1);
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
      nextDx = 1; nextDy = 0;
      food = {x: 15, y: 15, isPowerUp: false};
      score = 0;
      level = 1;
      combo = 0;
      multiplier = 1;
      gameSpeed = 100;
      gameOver = false;
      gameRunning = true;
      gameStarted = true;
      paused = false;
      lastTime = 0;
      particles = [];
      scorePopups = [];
      shakeTime = 0;
      gameOverTime = 0;
      milestoneFlash = 0;
      newRecordFlash = 0;
      invincible = 0;
      playSound(600, 100, 'sine');
      playSound(900, 80, 'sine');
    }
    return;
  }

  if (e.key.toLowerCase() === 'p' && gameStarted && !gameOver) {
    paused = !paused;
    if (!paused) playSound(700, 50);
    return;
  }

  if (e.key.toLowerCase() === 'm') {
    muted = !muted;
    return;
  }

  if (!gameRunning || gameOver || paused) return;

  switch (e.key) {
    case 'ArrowUp':
      if (dy !== 1) { nextDx = 0; nextDy = -1; }
      break;
    case 'ArrowDown':
      if (dy !== -1) { nextDx = 0; nextDy = 1; }
      break;
    case 'ArrowLeft':
      if (dx !== 1) { nextDx = -1; nextDy = 0; }
      break;
    case 'ArrowRight':
      if (dx !== -1) { nextDx = 1; nextDy = 0; }
      break;
  }
});

// Touch swipe controls
canvas.addEventListener('touchstart', e => {
  touchStartX = e.changedTouches[0].screenX;
  touchStartY = e.changedTouches[0].screenY;
}, false);

canvas.addEventListener('touchend', e => {
  if (!gameRunning || gameOver || paused) return;

  const touchEndX = e.changedTouches[0].screenX;
  const touchEndY = e.changedTouches[0].screenY;

  const deltaX = touchEndX - touchStartX;
  const deltaY = touchEndY - touchStartY;

  if (Math.abs(deltaX) > 30 || Math.abs(deltaY) > 30) {
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > 0 && dx !== -1) { nextDx = 1; nextDy = 0; }
      else if (deltaX < 0 && dx !== 1) { nextDx = -1; nextDy = 0; }
    } else {
      if (deltaY > 0 && dy !== -1) { nextDx = 0; nextDy = 1; }
      else if (deltaY < 0 && dy !== 1) { nextDx = 0; nextDy = -1; }
    }
  }
}, false);

spawnFood();
draw();

console.log("Basecade Commit #27 - Invincibility now has flashing visual + stronger particles on power-up!");
