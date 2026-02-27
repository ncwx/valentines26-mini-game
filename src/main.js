import { state, loadLevel, isBlocked } from "./game/state.js";

import { levels, level1AssetMap } from "./game/levels.js";

const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");
const endScreen = document.getElementById("end-screen");
const startBtn = document.getElementById("start-btn");
const playAgainBtn = document.getElementById("play-again-btn");
const levelLabel = document.getElementById("level-label");
const heartsLabel = document.getElementById("hearts-label");
const timerLabel = document.getElementById("timer-label");
const tipLabel = document.getElementById("tip-label");
const finalMessage = document.getElementById("final-message");
const controlButtons = document.querySelectorAll(".controls button");
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const CELL_SIZE = 42;
const WORLD_WIDTH = 14;
const WORLD_HEIGHT = 10;
const BOARD_WIDTH = WORLD_WIDTH * CELL_SIZE;
const BOARD_HEIGHT = WORLD_HEIGHT * CELL_SIZE;
const iconAssets = {};

function setupHiDpiCanvas() {
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  canvas.style.width = `${BOARD_WIDTH}px`;
  canvas.style.height = `${BOARD_HEIGHT}px`;
  canvas.width = Math.floor(BOARD_WIDTH * dpr);
  canvas.height = Math.floor(BOARD_HEIGHT * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = true;
}

function preloadLevel1Assets() {
  Object.entries(level1AssetMap).forEach(([key, src]) => {
    const img = new Image();
    img.src = src;
    iconAssets[key] = img;
  });
}

function switchScreen(show) {
  startScreen.classList.remove("active");
  gameScreen.classList.remove("active");
  endScreen.classList.remove("active");
  show.classList.add("active");
}


function updateCounterLabel() {
  const level = levels[state.currentLevel];
  heartsLabel.textContent = `${level.counterLabel}: ${state.collected}/${state.items.length}`;
}

function updateTimerLabel() {
  const seconds = Math.max(0, Math.ceil(state.timeRemaining));
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  timerLabel.textContent = `time left: ${mm}:${ss}`;
}

function move(dx, dy) {
  if (!state.gameActive) return;
  const nx = state.player.x + dx;
  const ny = state.player.y + dy;
  if (isBlocked(nx, ny)) return;

  state.player.x = nx;
  state.player.y = ny;

  state.items.forEach((item) => {
    if (!item.found && item.x === state.player.x && item.y === state.player.y) {
      item.found = true;
      state.collected += 1;
      updateCounterLabel();
    }
  });

  if (state.collected === state.items.length) {
    if (state.currentLevel < levels.length - 1) {
      state.currentLevel += 1;
      loadLevel(state.currentLevel);

      const level = levels[state.currentLevel];
      levelLabel.textContent = level.title;
      tipLabel.textContent = level.description;
      updateCounterLabel();
      updateTimerLabel();

    } else {
      finishGame();
    }
  }
}

function drawGrid() {
  ctx.clearRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);

  for (let y = 0; y < WORLD_HEIGHT; y += 1) {
    for (let x = 0; x < WORLD_WIDTH; x += 1) {
      const px = x * CELL_SIZE;
      const py = y * CELL_SIZE;
      const isWall = state.wallSet.has(`${x},${y}`);
      ctx.fillStyle = isWall ? "#ffccdb" : "#fff8fb";
      ctx.fillRect(px, py, CELL_SIZE - 2, CELL_SIZE - 2);
    }
  }
}

function drawRoundedRect(x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

function drawItems() {
  state.items.forEach((item) => {
    if (item.found) return;

    const px = item.x * CELL_SIZE;
    const py = item.y * CELL_SIZE;
    const text = item.icon;

    if (iconAssets[text] && iconAssets[text].complete && iconAssets[text].naturalWidth > 0) {
      const img = iconAssets[text];
      const maxSize = CELL_SIZE - 10;
      const scale = Math.min(maxSize / img.naturalWidth, maxSize / img.naturalHeight);
      const drawWidth = img.naturalWidth * scale;
      const drawHeight = img.naturalHeight * scale;
      const drawX = px + (CELL_SIZE - drawWidth) / 2;
      const drawY = py + (CELL_SIZE - drawHeight) / 2;
      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
      return;
    }

    if (/^[a-z]+$/i.test(text)) {
      ctx.fillStyle = "#c9324c";
      drawRoundedRect(px + 3, py + 11, CELL_SIZE - 8, 18, 7);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.font = '10px "Trebuchet MS", "Verdana", sans-serif';
      ctx.textAlign = "center";
      ctx.fillText(text, px + CELL_SIZE / 2, py + 24);
      return;
    }

    ctx.font = '30px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
    ctx.textAlign = "left";
    ctx.fillText(text, px + 8, py + 31);
  });
}

function drawPlayer() {
  ctx.textAlign = "left";
  ctx.font = '33px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
  ctx.fillText("🦹🏽‍♂️", state.player.x * CELL_SIZE + 4, state.player.y * CELL_SIZE + 32);
}

function tickTimer(deltaSeconds) {
  state.timeRemaining -= deltaSeconds;
  const whole = Math.ceil(Math.max(0, state.timeRemaining));

  if (whole !== state.lastTickSecond) {
    state.lastTickSecond = whole;
    updateTimerLabel();
  }

  if (state.timeRemaining <= 0) {
    loadLevel(state.currentLevel);
  }
}

function draw(now = 0) {
  const deltaSeconds = state.lastFrameAt === 0 ? 0 : (now - state.lastFrameAt) / 1000;
  state.lastFrameAt = now;

  if (state.gameActive) {
    tickTimer(deltaSeconds);
    drawGrid();
    drawItems();
    drawPlayer();
  }

  requestAnimationFrame(draw);
}

function startGame() {
  state.currentLevel = 0;
  state.gameActive = true;
  state.lastFrameAt = 0;
  loadLevel(state.currentLevel);
  const level = levels[state.currentLevel];
  levelLabel.textContent = level.title;
  tipLabel.textContent = level.description;
  updateCounterLabel();
  updateTimerLabel();
  switchScreen(gameScreen);
}

function finishGame() {
  state.gameActive = false;
  finalMessage.textContent = "happy vday hehehehehehhe i love you stinky baby";
  switchScreen(endScreen);
}

function resetGame() {
  switchScreen(startScreen);
}

startBtn.addEventListener("click", startGame);
playAgainBtn.addEventListener("click", resetGame);
window.addEventListener("resize", setupHiDpiCanvas);

document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  if (["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d"].includes(key)) {
    event.preventDefault();
  }

  if (key === "arrowup" || key === "w") move(0, -1);
  if (key === "arrowdown" || key === "s") move(0, 1);
  if (key === "arrowleft" || key === "a") move(-1, 0);
  if (key === "arrowright" || key === "d") move(1, 0);
});

controlButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const dir = btn.dataset.dir;
    if (dir === "up") move(0, -1);
    if (dir === "down") move(0, 1);
    if (dir === "left") move(-1, 0);
    if (dir === "right") move(1, 0);
  });
});

setupHiDpiCanvas();
preloadLevel1Assets();
draw();
