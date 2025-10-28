import { Injectable } from '@angular/core';
import { BehaviorSubject, interval } from 'rxjs';
import { Position, Direction, Ghost, GameState, CellType } from '../models/game.models';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  // Game board configuration
  readonly CELL_SIZE = 20;
  readonly ROWS = 21;
  readonly COLS = 19;

  // Game state
  private gameState$ = new BehaviorSubject<GameState>({
    score: 0,
    lives: 3,
    level: 1,
    gameOver: false,
    won: false,
    isPaused: false
  });

  private pacmanPosition$ = new BehaviorSubject<Position>({ x: 9, y: 15 });
  private pacmanDirection$ = new BehaviorSubject<Direction>({ x: 0, y: 0 });
  private nextDirection$ = new BehaviorSubject<Direction>({ x: 0, y: 0 });

  private ghosts$ = new BehaviorSubject<Ghost[]>([
    { id: 1, position: { x: 9, y: 7 }, direction: { x: 1, y: 0 }, color: 'red', scared: false },
    { id: 2, position: { x: 8, y: 9 }, direction: { x: 0, y: 1 }, color: 'pink', scared: false },
    { id: 3, position: { x: 10, y: 9 }, direction: { x: -1, y: 0 }, color: 'cyan', scared: false },
    { id: 4, position: { x: 9, y: 9 }, direction: { x: 0, y: -1 }, color: 'orange', scared: false }
  ]);

  private gameBoard: number[][] = [];
  private pelletsRemaining = 0;
  private scaredTimer = 0;
  private mazeLayouts: number[][][] = [];
  private ghostColors: string[][] = [
    ['red', 'pink', 'cyan', 'orange'],
    ['purple', 'magenta', 'lime', 'yellow'],
    ['darkred', 'hotpink', 'aqua', 'gold'],
    ['darkviolet', 'deeppink', 'springgreen', 'darkorange']
  ];

  // Observable streams
  gameState = this.gameState$.asObservable();
  pacmanPosition = this.pacmanPosition$.asObservable();
  ghosts = this.ghosts$.asObservable();

  constructor() {
    this.initializeMazeLayouts();
    this.initializeBoard();
  }

  private initializeMazeLayouts(): void {
    // Layout 1: Classic
    this.mazeLayouts[0] = [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,1],
      [1,3,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,3,1],
      [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
      [1,2,1,1,2,1,2,1,1,1,1,1,2,1,2,1,1,2,1],
      [1,2,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,1],
      [1,1,1,1,2,1,1,1,0,1,0,1,1,1,2,1,1,1,1],
      [0,0,0,1,2,1,0,0,0,0,0,0,0,1,2,1,0,0,0],
      [1,1,1,1,2,1,0,1,1,0,1,1,0,1,2,1,1,1,1],
      [0,0,0,0,2,0,0,1,0,0,0,1,0,0,2,0,0,0,0],
      [1,1,1,1,2,1,0,1,1,1,1,1,0,1,2,1,1,1,1],
      [0,0,0,1,2,1,0,0,0,0,0,0,0,1,2,1,0,0,0],
      [1,1,1,1,2,1,0,1,1,1,1,1,0,1,2,1,1,1,1],
      [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,1],
      [1,2,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,2,1],
      [1,3,2,1,2,2,2,2,2,0,2,2,2,2,2,1,2,3,1],
      [1,1,2,1,2,1,2,1,1,1,1,1,2,1,2,1,2,1,1],
      [1,2,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,1],
      [1,2,1,1,1,1,1,1,2,1,2,1,1,1,1,1,1,2,1],
      [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ];

    // Layout 2: Open Center
    this.mazeLayouts[1] = [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
      [1,3,1,1,1,2,1,1,1,2,1,1,1,2,1,1,1,3,1],
      [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
      [1,2,1,2,1,1,1,2,1,1,1,2,1,1,1,2,1,2,1],
      [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
      [1,2,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,2,1],
      [1,2,2,2,2,2,2,2,2,0,2,2,2,2,2,2,2,2,1],
      [1,1,1,2,1,1,1,2,0,0,0,2,1,1,1,2,1,1,1],
      [0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0],
      [1,1,1,2,1,1,1,2,1,1,1,2,1,1,1,2,1,1,1],
      [1,2,2,2,2,2,2,2,2,0,2,2,2,2,2,2,2,2,1],
      [1,2,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,2,1],
      [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
      [1,2,1,2,1,1,1,2,1,1,1,2,1,1,1,2,1,2,1],
      [1,3,2,2,2,2,2,2,2,0,2,2,2,2,2,2,2,3,1],
      [1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1],
      [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,1],
      [1,2,1,1,1,1,1,1,2,1,2,1,1,1,1,1,1,2,1],
      [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ];

    // Layout 3: Cross Pattern
    this.mazeLayouts[2] = [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
      [1,3,1,1,2,1,1,2,1,1,1,2,1,1,2,1,1,3,1],
      [1,2,1,1,2,1,1,2,1,1,1,2,1,1,2,1,1,2,1],
      [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
      [1,2,1,1,2,1,2,1,1,1,1,1,2,1,2,1,1,2,1],
      [1,2,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,1],
      [1,1,1,1,2,1,1,1,0,1,0,1,1,1,2,1,1,1,1],
      [0,0,0,1,2,1,0,0,0,0,0,0,0,1,2,1,0,0,0],
      [2,2,2,2,2,2,2,2,0,0,0,2,2,2,2,2,2,2,2],
      [0,0,0,1,2,1,0,0,0,0,0,0,0,1,2,1,0,0,0],
      [1,1,1,1,2,1,1,1,1,1,1,1,1,1,2,1,1,1,1],
      [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,1],
      [1,2,1,1,2,1,2,1,1,1,1,1,2,1,2,1,1,2,1],
      [1,2,2,2,2,1,2,2,2,2,2,2,2,1,2,2,2,2,1],
      [1,3,1,1,2,1,2,1,1,0,1,1,2,1,2,1,1,3,1],
      [1,2,1,1,2,1,2,1,1,1,1,1,2,1,2,1,1,2,1],
      [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,1],
      [1,2,1,1,1,1,1,1,2,1,2,1,1,1,1,1,1,2,1],
      [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ];

    // Layout 4: Spiral
    this.mazeLayouts[3] = [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
      [1,3,1,1,1,1,1,1,1,2,1,1,1,1,1,1,1,3,1],
      [1,2,2,2,2,2,2,2,1,2,1,2,2,2,2,2,2,2,1],
      [1,1,1,1,1,1,1,2,1,2,1,2,1,1,1,1,1,1,1],
      [1,2,2,2,2,2,2,2,1,2,1,2,2,2,2,2,2,2,1],
      [1,2,1,1,1,1,1,1,1,2,1,1,1,1,1,1,1,2,1],
      [1,2,1,2,2,2,2,2,2,2,2,2,2,2,2,2,1,2,1],
      [1,2,1,2,1,1,1,1,0,0,0,1,1,1,1,2,1,2,1],
      [1,2,2,2,1,0,0,0,0,0,0,0,0,0,1,2,2,2,1],
      [1,2,1,2,1,1,1,1,1,1,1,1,1,1,1,2,1,2,1],
      [1,2,1,2,2,2,2,2,2,0,2,2,2,2,2,2,1,2,1],
      [1,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,1],
      [1,2,2,2,2,2,2,2,1,2,1,2,2,2,2,2,2,2,1],
      [1,1,1,1,1,1,1,2,1,2,1,2,1,1,1,1,1,1,1],
      [1,3,2,2,2,2,2,2,1,2,1,2,2,2,2,2,2,3,1],
      [1,2,1,1,1,1,1,1,1,2,1,1,1,1,1,1,1,2,1],
      [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
      [1,2,1,1,1,1,1,1,2,1,2,1,1,1,1,1,1,2,1],
      [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ];
  }

  private initializeBoard(): void {
    const state = this.gameState$.value;
    const layoutIndex = this.getLayoutIndexForLevel(state.level);
    this.gameBoard = JSON.parse(JSON.stringify(this.mazeLayouts[layoutIndex]));
    this.pelletsRemaining = this.countPellets();
  }

  private countPellets(): number {
    let count = 0;
    for (let row of this.gameBoard) {
      for (let cell of row) {
        if (cell === CellType.PELLET || cell === CellType.POWER_PELLET) {
          count++;
        }
      }
    }
    return count;
  }

  getBoard(): number[][] {
    return this.gameBoard;
  }

  setDirection(direction: Direction): void {
    this.nextDirection$.next(direction);
  }

  getCurrentDirection(): Direction {
    return this.pacmanDirection$.value;
  }

  private getLayoutIndexForLevel(level: number): number {
    // Semi-random selection based on level
    return (level - 1) % this.mazeLayouts.length;
  }

  private getGhostColorsForLevel(level: number): string[] {
    const colorSetIndex = Math.min(Math.floor((level - 1) / 2), this.ghostColors.length - 1);
    return this.ghostColors[colorSetIndex];
  }

  private getDifficultyMultiplier(): number {
    const state = this.gameState$.value;
    // Increase difficulty with level: reduce random movement, increase chase behavior
    return Math.min(1 + (state.level - 1) * 0.15, 2.5);
  }

  movePacman(): void {
    const state = this.gameState$.value;
    if (state.gameOver || state.isPaused) return;

    const currentPos = this.pacmanPosition$.value;
    const currentDir = this.pacmanDirection$.value;
    const nextDir = this.nextDirection$.value;

    // Try to turn to the next direction
    let newPos = this.getNextPosition(currentPos, nextDir);
    if (this.isValidMove(newPos)) {
      this.pacmanDirection$.next(nextDir);
    } else {
      // Continue in current direction
      newPos = this.getNextPosition(currentPos, currentDir);
      if (!this.isValidMove(newPos)) {
        return;
      }
    }

    // Handle wrapping
    newPos = this.wrapPosition(newPos);

    // Check for pellet consumption
    this.checkPelletCollision(newPos);

    this.pacmanPosition$.next(newPos);
    this.checkGhostCollision();
  }

  moveGhosts(): void {
    const state = this.gameState$.value;
    if (state.gameOver || state.isPaused) return;

    const pacmanPos = this.pacmanPosition$.value;
    const difficultyMultiplier = this.getDifficultyMultiplier();
    const randomChance = Math.max(0.05, 0.2 - (difficultyMultiplier - 1) * 0.1);

    const ghosts = this.ghosts$.value.map(ghost => {
      let newPos = this.getNextPosition(ghost.position, ghost.direction);

      // If can't move forward or at intersection, choose new direction
      if (!this.isValidMove(newPos) || this.isAtIntersection(ghost.position)) {
        if (ghost.scared) {
          // Run away from Pac-Man when scared
          ghost.direction = this.getDirectionAwayFromTarget(ghost.position, pacmanPos);
        } else {
          // Use smarter AI - chase Pac-Man more aggressively at higher levels
          if (Math.random() > randomChance) {
            // Smart chase behavior
            ghost.direction = this.getDirectionTowardsTarget(ghost.position, pacmanPos, ghost.id);
          } else {
            // Occasional random movement
            ghost.direction = this.getRandomValidDirection(ghost.position);
          }
        }
        newPos = this.getNextPosition(ghost.position, ghost.direction);
      }

      // Occasionally change direction at higher levels for unpredictability
      if (Math.random() < randomChance && !ghost.scared) {
        const chaseDir = this.getDirectionTowardsTarget(ghost.position, pacmanPos, ghost.id);
        if (this.isValidMove(this.getNextPosition(ghost.position, chaseDir))) {
          ghost.direction = chaseDir;
          newPos = this.getNextPosition(ghost.position, chaseDir);
        }
      }

      newPos = this.wrapPosition(newPos);

      return { ...ghost, position: newPos };
    });

    this.ghosts$.next(ghosts);
    this.checkGhostCollision();

    // Update scared timer
    if (this.scaredTimer > 0) {
      this.scaredTimer--;
      if (this.scaredTimer === 0) {
        this.setGhostsScared(false);
      }
    }
  }

  private isAtIntersection(pos: Position): boolean {
    const directions: Direction[] = [
      { x: 1, y: 0 },
      { x: -1, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: -1 }
    ];

    const validMoves = directions.filter(dir => {
      const newPos = this.getNextPosition(pos, dir);
      return this.isValidMove(newPos);
    });

    return validMoves.length > 2; // More than 2 valid directions = intersection
  }

  private getDirectionTowardsTarget(from: Position, target: Position, ghostId: number): Direction {
    const validDirections = this.getValidDirections(from);
    if (validDirections.length === 0) return { x: 0, y: 0 };

    // Different ghosts use different strategies
    let bestDir = validDirections[0];
    let bestScore = Infinity;

    for (const dir of validDirections) {
      const newPos = this.getNextPosition(from, dir);
      let score: number;

      switch (ghostId) {
        case 1: // Red - direct chase
          score = this.getManhattanDistance(newPos, target);
          break;
        case 2: // Pink - try to get ahead of Pac-Man
          const pacmanDir = this.pacmanDirection$.value;
          const aheadTarget = {
            x: target.x + pacmanDir.x * 4,
            y: target.y + pacmanDir.y * 4
          };
          score = this.getManhattanDistance(newPos, aheadTarget);
          break;
        case 3: // Cyan - ambush from opposite side
          const opposite = {
            x: target.x + (target.x - from.x),
            y: target.y + (target.y - from.y)
          };
          score = this.getManhattanDistance(newPos, opposite);
          break;
        case 4: // Orange - patrol and occasional chase
          score = this.getManhattanDistance(newPos, target);
          if (score < 8) score = -score; // Move away when too close
          break;
        default:
          score = this.getManhattanDistance(newPos, target);
      }

      if (score < bestScore) {
        bestScore = score;
        bestDir = dir;
      }
    }

    return bestDir;
  }

  private getDirectionAwayFromTarget(from: Position, target: Position): Direction {
    const validDirections = this.getValidDirections(from);
    if (validDirections.length === 0) return { x: 0, y: 0 };

    let bestDir = validDirections[0];
    let bestScore = -Infinity;

    for (const dir of validDirections) {
      const newPos = this.getNextPosition(from, dir);
      const score = this.getManhattanDistance(newPos, target);

      if (score > bestScore) {
        bestScore = score;
        bestDir = dir;
      }
    }

    return bestDir;
  }

  private getManhattanDistance(pos1: Position, pos2: Position): number {
    return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
  }

  private getValidDirections(pos: Position): Direction[] {
    const directions: Direction[] = [
      { x: 1, y: 0 },
      { x: -1, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: -1 }
    ];

    return directions.filter(dir => {
      const newPos = this.getNextPosition(pos, dir);
      return this.isValidMove(newPos);
    });
  }

  private getNextPosition(pos: Position, dir: Direction): Position {
    return {
      x: pos.x + dir.x,
      y: pos.y + dir.y
    };
  }

  private wrapPosition(pos: Position): Position {
    const wrappedX = pos.x < 0 ? this.COLS - 1 : (pos.x >= this.COLS ? 0 : pos.x);
    const wrappedY = pos.y < 0 ? this.ROWS - 1 : (pos.y >= this.ROWS ? 0 : pos.y);
    return { x: wrappedX, y: wrappedY };
  }

  private isValidMove(pos: Position): boolean {
    if (pos.y < 0 || pos.y >= this.ROWS || pos.x < 0 || pos.x >= this.COLS) {
      return true; // Allow wrapping
    }
    return this.gameBoard[pos.y][pos.x] !== CellType.WALL;
  }

  private getRandomValidDirection(pos: Position): Direction {
    const directions: Direction[] = [
      { x: 1, y: 0 },
      { x: -1, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: -1 }
    ];

    const validDirections = directions.filter(dir => {
      const newPos = this.getNextPosition(pos, dir);
      return this.isValidMove(newPos);
    });

    return validDirections.length > 0
      ? validDirections[Math.floor(Math.random() * validDirections.length)]
      : { x: 0, y: 0 };
  }

  private checkPelletCollision(pos: Position): void {
    const cellType = this.gameBoard[pos.y][pos.x];
    const state = this.gameState$.value;

    if (cellType === CellType.PELLET) {
      this.gameBoard[pos.y][pos.x] = CellType.EMPTY;
      this.pelletsRemaining--;
      this.gameState$.next({ ...state, score: state.score + 10 });

      if (this.pelletsRemaining === 0) {
        // Level complete! Advance to next level
        this.advanceLevel();
      }
    } else if (cellType === CellType.POWER_PELLET) {
      this.gameBoard[pos.y][pos.x] = CellType.EMPTY;
      this.pelletsRemaining--;
      this.gameState$.next({ ...state, score: state.score + 50 });
      this.setGhostsScared(true);
      this.scaredTimer = Math.max(60, 100 - state.level * 5); // Shorter scared time at higher levels

      if (this.pelletsRemaining === 0) {
        // Level complete! Advance to next level
        this.advanceLevel();
      }
    }
  }

  private advanceLevel(): void {
    const state = this.gameState$.value;
    const newLevel = state.level + 1;

    // Pause briefly to show level complete
    this.gameState$.next({
      ...state,
      isPaused: true,
      levelComplete: true
    });

    // After a brief pause, start new level
    setTimeout(() => {
      // FIRST update the level in state
      this.gameState$.next({
        ...state,
        level: newLevel,
        won: false,
        gameOver: false,
        isPaused: false,
        levelComplete: false
      });

      // Small delay to ensure state propagates
      setTimeout(() => {
        // THEN load new maze layout (which reads the updated level)
        this.initializeBoard();

        // Reset positions (which also uses the updated level for colors)
        this.resetPositions();

        // Update ghost colors for new level
        this.updateGhostColors();
      }, 50);
    }, 2000); // 2 second pause between levels
  }

  private checkGhostCollision(): void {
    const pacmanPos = this.pacmanPosition$.value;
    const ghosts = this.ghosts$.value;
    const state = this.gameState$.value;

    for (let ghost of ghosts) {
      if (this.isSamePosition(pacmanPos, ghost.position)) {
        if (ghost.scared) {
          // Eat the ghost
          this.gameState$.next({ ...state, score: state.score + 200 });
          this.resetGhost(ghost.id);
        } else {
          // Lose a life
          const newLives = state.lives - 1;
          if (newLives <= 0) {
            this.gameState$.next({ ...state, lives: 0, gameOver: true });
          } else {
            this.gameState$.next({ ...state, lives: newLives });
            this.resetPositions();
          }
        }
      }
    }
  }

  private isSamePosition(pos1: Position, pos2: Position): boolean {
    return pos1.x === pos2.x && pos1.y === pos2.y;
  }

  private setGhostsScared(scared: boolean): void {
    const ghosts = this.ghosts$.value.map(g => ({ ...g, scared }));
    this.ghosts$.next(ghosts);
  }

  private resetGhost(ghostId: number): void {
    const ghosts = this.ghosts$.value.map(ghost => {
      if (ghost.id === ghostId) {
        return { ...ghost, position: { x: 9, y: 9 }, scared: false };
      }
      return ghost;
    });
    this.ghosts$.next(ghosts);
  }

  private resetPositions(): void {
    const state = this.gameState$.value;
    const colors = this.getGhostColorsForLevel(state.level);

    this.pacmanPosition$.next({ x: 9, y: 15 });
    this.pacmanDirection$.next({ x: 0, y: 0 });
    this.nextDirection$.next({ x: 0, y: 0 });
    this.ghosts$.next([
      { id: 1, position: { x: 9, y: 7 }, direction: { x: 1, y: 0 }, color: colors[0], scared: false },
      { id: 2, position: { x: 8, y: 9 }, direction: { x: 0, y: 1 }, color: colors[1], scared: false },
      { id: 3, position: { x: 10, y: 9 }, direction: { x: -1, y: 0 }, color: colors[2], scared: false },
      { id: 4, position: { x: 9, y: 9 }, direction: { x: 0, y: -1 }, color: colors[3], scared: false }
    ]);
  }

  private updateGhostColors(): void {
    const state = this.gameState$.value;
    const colors = this.getGhostColorsForLevel(state.level);
    const ghosts = this.ghosts$.value.map((ghost, index) => ({
      ...ghost,
      color: colors[index]
    }));
    this.ghosts$.next(ghosts);
  }

  resetGame(): void {
    this.gameState$.next({
      score: 0,
      lives: 3,
      level: 1,
      gameOver: false,
      won: false,
      isPaused: false
    });
    this.initializeBoard();
    this.resetPositions();
    this.scaredTimer = 0;
  }

  togglePause(): void {
    const state = this.gameState$.value;
    this.gameState$.next({ ...state, isPaused: !state.isPaused });
  }
}
