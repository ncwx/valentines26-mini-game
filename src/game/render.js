import { state } from "./state.js";
import { CELL_SIZE, WORLD_WIDTH, WORLD_HEIGHT, BOARD_WIDTH, BOARD_HEIGHT, wallKey } from "./constants.js";

function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

export function createRenderer({ ctx, iconAssets }) {
  function drawGrid() {
    ctx.clearRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);

    for (let y = 0; y < WORLD_HEIGHT; y += 1) {
      for (let x = 0; x < WORLD_WIDTH; x += 1) {
        const px = x * CELL_SIZE;
        const py = y * CELL_SIZE;

        const isWall = state.wallSet.has(wallKey(x, y));
        ctx.fillStyle = isWall ? "#ffccdb" : "#fff8fb";
        ctx.fillRect(px, py, CELL_SIZE - 2, CELL_SIZE - 2);
      }
    }
  }

  function drawItems() {
    state.items.forEach((item) => {
      if (item.found) return;

      const px = item.x * CELL_SIZE;
      const py = item.y * CELL_SIZE;
      const text = item.icon;

      // Level 1 PNG icons
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

      // Fallback for plain text labels (if any)
      if (/^[a-z]+$/i.test(text)) {
        ctx.fillStyle = "#c9324c";
        drawRoundedRect(ctx, px + 3, py + 11, CELL_SIZE - 8, 18, 7);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.font = '10px "Trebuchet MS", "Verdana", sans-serif';
        ctx.textAlign = "center";
        ctx.fillText(text, px + CELL_SIZE / 2, py + 24);
        return;
      }

      // Emoji items (levels 2+)
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

  return { drawGrid, drawItems, drawPlayer };
}