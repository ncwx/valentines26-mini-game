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
const level1AssetMap = {
  instagram: "assets/INSTAGRAM.png",
  youtube: "assets/YOUTUBE.png",
  chatgpt: "assets/CHATGPT.png",
  tiktok: "assets/TIKTOK.png"
};

const levels = [
  {
    title: "level 1: 101 ways to not pay attention to my gf",
    counterLabel: "evil apps caught",
    description: "collect all your evil apps before i delete them all muahhahahaha",
    timeLimit: 35,
    itemIcons: ["instagram", "youtube", "chatgpt", "tiktok"],
    start: { x: 1, y: 1 },
    itemSpots: [
      { x: 4, y: 2 },
      { x: 7, y: 1 },
      { x: 10, y: 4 },
      { x: 12, y: 8 }
    ],
    walls: [
      [3, 3], [4, 3], [5, 3], [8, 3], [9, 3], [10, 3],
      [2, 6], [3, 6], [4, 6], [8, 6], [9, 6], [10, 6], [11, 6],
      [6, 8], [7, 8], [8, 8]
    ]
  },
  {
    title: "level 2: favorite places to be stinky",
    counterLabel: "stink zones",
    description: "how many places can you be stinky in before its stinkiness overload?",
    timeLimit: 20,
    itemIcons: ["🛌", "🖥️", "🚽", "🎮", "🛏️"],
    start: { x: 1, y: 8 },
    itemSpots: [
      { x: 3, y: 2 },
      { x: 5, y: 5 },
      { x: 9, y: 2 },
      { x: 12, y: 7 },
      { x: 11, y: 1 }
    ],
    walls: [
      [2, 4], [3, 4], [4, 4], [5, 4], [7, 4], [8, 4], [9, 4], [10, 4],
      [6, 2], [6, 3], [6, 4], [6, 5], [6, 6],
      [3, 7], [4, 7], [5, 7], [8, 7], [9, 7], [10, 7]
    ]
  },
  {
    title: "level 3: its time for a snack run!",
    counterLabel: "snacks collected",
    description: "collect all your favourite snacks before snack time ends. OR ELSE.",
    timeLimit: 15,
    itemIcons: ["🍞", "🍳", "🧀", "🥪", "🥓", "🌭"],
    start: { x: 1, y: 1 },
    itemSpots: [
      { x: 2, y: 8 },
      { x: 4, y: 1 },
      { x: 6, y: 8 },
      { x: 8, y: 1 },
      { x: 10, y: 8 },
      { x: 12, y: 1 }
    ],
    walls: [
      [2, 3], [3, 3], [4, 3], [5, 3], [6, 3],
      [8, 3], [9, 3], [10, 3], [11, 3],
      [2, 6], [3, 6], [4, 6], [5, 6],
      [7, 6], [8, 6], [9, 6], [10, 6], [11, 6],
      [7, 1], [7, 2], [7, 3], [7, 4], [7, 5]
    ]
  }
];

let player = { x: 1, y: 1 };
let currentLevel = 0;
let collected = 0;
let items = [];
let wallSet = new Set();
let gameActive = false;
let timeRemaining = 0;
let lastTickSecond = -1;
let lastFrameAt = 0;

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

function wallKey(x, y) {
  return `${x},${y}`;
}

function updateCounterLabel() {
  const level = levels[currentLevel];
  heartsLabel.textContent = `${level.counterLabel}: ${collected}/${items.length}`;
}

function updateTimerLabel() {
  const seconds = Math.max(0, Math.ceil(timeRemaining));
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  timerLabel.textContent = `time left: ${mm}:${ss}`;
}

function loadLevel(index) {
  const level = levels[index];
  player = { ...level.start };
  items = level.itemSpots.map((spot, itemIndex) => ({
    ...spot,
    icon: level.itemIcons[itemIndex],
    found: false
  }));
  wallSet = new Set(level.walls.map(([x, y]) => wallKey(x, y)));
  collected = 0;
  timeRemaining = level.timeLimit;
  lastTickSecond = -1;

  levelLabel.textContent = level.title;
  tipLabel.textContent = level.description;
  updateCounterLabel();
  updateTimerLabel();
}

function isBlocked(x, y) {
  if (x < 0 || y < 0 || x >= WORLD_WIDTH || y >= WORLD_HEIGHT) return true;
  return wallSet.has(wallKey(x, y));
}

function move(dx, dy) {
  if (!gameActive) return;
  const nx = player.x + dx;
  const ny = player.y + dy;
  if (isBlocked(nx, ny)) return;

  player.x = nx;
  player.y = ny;

  items.forEach((item) => {
    if (!item.found && item.x === player.x && item.y === player.y) {
      item.found = true;
      collected += 1;
      updateCounterLabel();
    }
  });

  if (collected === items.length) {
    if (currentLevel < levels.length - 1) {
      currentLevel += 1;
      loadLevel(currentLevel);
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
      const isWall = wallSet.has(wallKey(x, y));
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
  items.forEach((item) => {
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
  ctx.fillText("🦹🏽‍♂️", player.x * CELL_SIZE + 4, player.y * CELL_SIZE + 32);
}

function tickTimer(deltaSeconds) {
  timeRemaining -= deltaSeconds;
  const whole = Math.ceil(Math.max(0, timeRemaining));

  if (whole !== lastTickSecond) {
    lastTickSecond = whole;
    updateTimerLabel();
  }

  if (timeRemaining <= 0) {
    loadLevel(currentLevel);
  }
}

function draw(now = 0) {
  const deltaSeconds = lastFrameAt === 0 ? 0 : (now - lastFrameAt) / 1000;
  lastFrameAt = now;

  if (gameActive) {
    tickTimer(deltaSeconds);
    drawGrid();
    drawItems();
    drawPlayer();
  }

  requestAnimationFrame(draw);
}

function startGame() {
  currentLevel = 0;
  gameActive = true;
  lastFrameAt = 0;
  loadLevel(currentLevel);
  switchScreen(gameScreen);
}

function finishGame() {
  gameActive = false;
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
