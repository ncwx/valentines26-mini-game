import { levels } from "./levels.js";

export const state = {
  player: { x: 1, y: 1 },
  currentLevel: 0,
  collected: 0,
  items: [],
  wallSet: new Set(),
  gameActive: false,
  timeRemaining: 0,
  lastTickSecond: -1,
  lastFrameAt: 0
};

function wallKey(x, y) {
  return `${x},${y}`;
}

export function loadLevel(index, ui) {
  const level = levels[index];
  state.player = { ...level.start };
  state.items = level.itemSpots.map((spot, itemIndex) => ({
    ...spot,
    icon: level.itemIcons[itemIndex],
    found: false
  }));
  state.wallSet = new Set(level.walls.map(([x, y]) => wallKey(x, y)));
  state.collected = 0;
  state.timeRemaining = level.timeLimit;
  state.lastTickSecond = -1;
}

export function isBlocked(x, y, WORLD_WIDTH, WORLD_HEIGHT) {
  if (x < 0 || y < 0 || x >= WORLD_WIDTH || y >= WORLD_HEIGHT) return true;
  return state.wallSet.has(wallKey(x, y));
}