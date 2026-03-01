// src/main.js
import { level1AssetMap, levels } from "./game/levels.js";
import { state } from "./game/state.js";
import { BOARD_WIDTH, BOARD_HEIGHT } from "./game/constants.js";
import { createRenderer } from "./game/render.js";
import { createEngine } from "./game/engine.js";

// --- DOM ---
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

// --- Assets (PNG icons for level 1) ---
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

// --- Create renderer + engine ---
const renderer = createRenderer({ ctx, iconAssets });

const ui = {
  levelLabel,
  tipLabel,
  finalMessage,
  updateCounterLabel,
  updateTimerLabel,
};

const engine = createEngine({
  renderer,
  ui,
  switchToGameScreen: () => switchScreen(gameScreen),
  switchToEndScreen: () => switchScreen(endScreen),
});

// --- Events ---
startBtn.addEventListener("click", engine.startGame);

playAgainBtn.addEventListener("click", () => {
  engine.resetGameToStartScreen(() => switchScreen(startScreen));
});

window.addEventListener("resize", setupHiDpiCanvas);

document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();

  if (["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d"].includes(key)) {
    event.preventDefault();
  }

  if (key === "arrowup" || key === "w") engine.move(0, -1);
  if (key === "arrowdown" || key === "s") engine.move(0, 1);
  if (key === "arrowleft" || key === "a") engine.move(-1, 0);
  if (key === "arrowright" || key === "d") engine.move(1, 0);
});

controlButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const dir = btn.dataset.dir;
    if (dir === "up") engine.move(0, -1);
    if (dir === "down") engine.move(0, 1);
    if (dir === "left") engine.move(-1, 0);
    if (dir === "right") engine.move(1, 0);
  });
});

// --- Boot ---
setupHiDpiCanvas();
preloadLevel1Assets();
engine.startLoopOnce(); // starts RAF loop (safe even before gameActive)