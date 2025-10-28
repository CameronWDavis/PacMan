export interface Position {
  x: number;
  y: number;
}

export interface Direction {
  x: number;
  y: number;
}

export enum CellType {
  EMPTY = 0,
  WALL = 1,
  PELLET = 2,
  POWER_PELLET = 3,
  PACMAN = 4,
  GHOST = 5
}

export interface Ghost {
  id: number;
  position: Position;
  direction: Direction;
  color: string;
  scared: boolean;
}

export interface GameState {
  score: number;
  lives: number;
  level: number;
  gameOver: boolean;
  won: boolean;
  isPaused: boolean;
  levelComplete?: boolean;
}
