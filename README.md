# Valentine’s Mini-Game

A modular, multi-level grid-based mini game built with HTML Canvas and modern ES Modules, structured using Vite.

This project began as a single-file JavaScript prototype and was refactored into a clean, modular architecture separating state management, rendering, and engine logic.

---

## Live Demo

https://ncwx.github.io/valentines26-mini-game/

---

## Features

- Data-driven level system (walls, items, timers, spawn points)
- Grid-based movement with collision detection
- Timed objectives with automatic level reset
- Multi-level progression with end screen
- Keyboard controls (arrow keys / WASD)
- Touch controls for mobile devices
- HiDPI canvas scaling for crisp rendering
- Modular architecture (state, renderer, engine separation)

---

## Architecture

```
src/
  main.js              # DOM wiring + application bootstrap
  game/
    constants.js       # grid and board configuration
    levels.js          # level definitions and asset mapping
    state.js           # centralised game state management
    render.js          # canvas drawing logic
    engine.js          # game loop, movement, progression logic

public/
  assets/              # game icons (PNG/SVG)
```

---

## Tech Stack

- JavaScript (ES Modules)
- HTML Canvas API
- Vite (development server + build tooling)
- CSS (responsive layout)

---

## Notes

- Refactored from a monolithic script into modular ES module architecture
- Separated state, rendering, and engine logic for maintainability
- Implemented requestAnimationFrame-based game loop
- Designed scalable level configuration system
- Managed collision detection using grid + coordinate key mapping
- Structured project using modern frontend tooling (Vite)

---

## Run Locally

```bash
npm install
npm run dev
```

Vite will start a development server. Open the local URL shown in the terminal (usually http://localhost:5173).

---

## Build for Production

```bash
npm run build
```

---

## Author

Natasha Chan  
GitHub: https://github.com/ncwx
