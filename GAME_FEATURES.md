# Pac-Man Game - Enhanced Features

## Overview
A fully modular Angular-based Pac-Man game with advanced AI, level progression, and dynamic difficulty scaling.

## Game Features

### 🎮 Core Gameplay
- **Classic Pac-Man mechanics** with smooth animations
- **Fast-paced chomping animation** (0.15s cycle time)
- **Keyboard controls**: Arrow keys or WASD
- **Pause functionality**: Press 'P' to pause/resume
- **Lives system**: Start with 3 lives (displayed as hearts)

### 👻 Advanced Ghost AI
Each ghost has unique behavior patterns:
- **Red Ghost (Blinky)**: Direct chase - follows Pac-Man's exact position
- **Pink Ghost (Pinky)**: Ambush - tries to get ahead of Pac-Man
- **Cyan Ghost (Inky)**: Flanking - attacks from opposite side
- **Orange Ghost (Clyde)**: Patrol - chases when far, retreats when close

**AI Features**:
- Pathfinding using Manhattan distance calculations
- Intersection detection for smarter decision-making
- Scared mode: Ghosts run away when you eat a power pellet
- Difficulty scaling with level progression

### 📈 Level Progression System
- **4 Different Maze Layouts**:
  1. Classic maze (Level 1, 5, 9...)
  2. Open Center maze (Level 2, 6, 10...)
  3. Cross Pattern maze (Level 3, 7, 11...)
  4. Spiral maze (Level 4, 8, 12...)

- **Dynamic Difficulty Scaling**:
  - Ghost AI becomes smarter at higher levels
  - Reduced random movement (more aggressive chasing)
  - Shorter power pellet duration at higher levels
  - Difficulty multiplier: 1.0 → 2.5 (caps at level 11)

- **Level-Based Color Themes**:
  - **Levels 1-2**: Classic colors (red, pink, cyan, orange)
  - **Levels 3-4**: Purple theme (purple, magenta, lime, yellow)
  - **Levels 5-6**: Dark theme (darkred, hotpink, aqua, gold)
  - **Levels 7+**: Violet theme (darkviolet, deeppink, springgreen, darkorange)

### 🎯 Scoring System
- **Regular pellets**: 10 points
- **Power pellets**: 50 points
- **Eating scared ghosts**: 200 points
- Score persists across levels

### 🏗️ Modular Architecture
Separate components for maximum reusability:
- `PacmanComponent` - Player character with rotation and animation
- `GhostComponent` - Enemy characters with scared mode animation
- `PelletComponent` - Regular and power pellets
- `ScoreboardComponent` - Score, lives, level display, and game messages
- `GameBoardComponent` - Main game container and orchestrator
- `GameService` - Centralized state management and game logic

## How to Play

### Starting the Game
```bash
cd pacman-game
npm start
```
Open browser to `http://localhost:4200`

### Controls
- **Move**: Arrow Keys or WASD
- **Pause**: P
- **Restart**: Space (when game over)

### Objective
1. Eat all pellets to advance to the next level
2. Avoid ghosts (or eat them after power pellets)
3. Survive as long as possible and rack up points!

## Difficulty Progression

| Level | Maze Type | Ghost Colors | AI Aggression | Power Pellet Duration |
|-------|-----------|--------------|---------------|----------------------|
| 1 | Classic | Classic | 80% smart | 5 seconds |
| 2 | Open Center | Classic | 83% smart | 4.75 seconds |
| 3 | Cross | Purple | 86% smart | 4.5 seconds |
| 4 | Spiral | Purple | 89% smart | 4.25 seconds |
| 5+ | Cycles | Rotates | 92%+ smart | 4 seconds or less |

## Technical Highlights

### Smart Ghost AI
- Uses Manhattan distance for pathfinding
- Detects intersections for optimal pathing
- Different personalities per ghost
- Difficulty scales with level
- Strategic retreat when scared

### Level System
- Automatic progression on completion
- Semi-random maze selection based on level
- Dynamic ghost color themes
- Persistent score across levels
- Adjustable difficulty parameters

### Performance
- Optimized game loops (Pac-Man: 150ms, Ghosts: 200ms)
- Efficient collision detection
- RxJS-based state management
- Change detection optimized with trackBy

## Building for Production
```bash
cd pacman-game
npm run build
```

Output will be in `dist/pacman-game/`

---

**Enjoy the game!** Try to beat all the levels and achieve the highest score possible! 🎮👻
