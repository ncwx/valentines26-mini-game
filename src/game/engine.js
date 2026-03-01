import { state, loadLevel, isBlocked } from "./state.js";
import { levels } from "./levels.js";

export function createEngine({ renderer, ui, switchToGameScreen, switchToEndScreen }) {
  let rafStarted = false;

  function syncLevelUI() {
    const level = levels[state.currentLevel];
    ui.levelLabel.textContent = level.title;
    ui.tipLabel.textContent = level.description;
    ui.updateCounterLabel();
    ui.updateTimerLabel();
  }

  function tickTimer(deltaSeconds) {
    state.timeRemaining -= deltaSeconds;
    const whole = Math.ceil(Math.max(0, state.timeRemaining));

    if (whole !== state.lastTickSecond) {
      state.lastTickSecond = whole;
      ui.updateTimerLabel();
    }

    if (state.timeRemaining <= 0) {
      loadLevel(state.currentLevel);
      syncLevelUI();
    }
  }

  function finishGame() {
    state.gameActive = false;
    ui.finalMessage.textContent = "happy vday hehehehehehhe i love you stinky baby";
    switchToEndScreen();
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
        ui.updateCounterLabel();
      }
    });

    if (state.collected === state.items.length) {
      if (state.currentLevel < levels.length - 1) {
        state.currentLevel += 1;
        loadLevel(state.currentLevel);
        syncLevelUI();
      } else {
        finishGame();
      }
    }
  }

  function draw(now = 0) {
    const deltaSeconds = state.lastFrameAt === 0 ? 0 : (now - state.lastFrameAt) / 1000;
    state.lastFrameAt = now;

    if (state.gameActive) {
      tickTimer(deltaSeconds);
      renderer.drawGrid();
      renderer.drawItems();
      renderer.drawPlayer();
    }

    requestAnimationFrame(draw);
  }

  function startLoopOnce() {
    if (rafStarted) return;
    rafStarted = true;
    state.lastFrameAt = 0;
    requestAnimationFrame(draw);
  }

  function startGame() {
    state.currentLevel = 0;
    state.gameActive = true;
    state.lastFrameAt = 0;

    loadLevel(state.currentLevel);
    syncLevelUI();

    switchToGameScreen();
    startLoopOnce();
  }

  function resetGameToStartScreen(switchToStartScreen) {
    state.gameActive = false;
    switchToStartScreen();
  }

  return { startGame, move, startLoopOnce, resetGameToStartScreen };
}