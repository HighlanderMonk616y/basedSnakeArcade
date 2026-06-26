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
let highScoreHistory = JSON.parse(localStorage.getItem('basecadeHighScoreHistory')) || [];
let bestCombo = parseInt(localStorage.getItem('basecadeBestCombo')) || 0;
let gameOver = false;
let gameRunning = false;
let gameStarted = false;
let paused = false;
let invincible = 0;

let startTime = 0;
let gameTime = 0;

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
let confetti = [];

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

function createConfetti(x, y) {
  for (let i = 0; i < 80; i++) {
    const hue = Math.random() * 360;
    confetti.push({
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * 12,
      vy: (Math.random() - 0.5) * 8 - 6,
      life: 90 + Math.random() * 60,
      color: `hsl(${hue}, 100%, 65%)
