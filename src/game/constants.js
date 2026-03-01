export const CELL_SIZE = 42;
export const WORLD_WIDTH = 14;
export const WORLD_HEIGHT = 10;

export const BOARD_WIDTH = WORLD_WIDTH * CELL_SIZE;
export const BOARD_HEIGHT = WORLD_HEIGHT * CELL_SIZE;

// Must match state.js key format
export function wallKey(x, y) {
  return `${x},${y}`;
}