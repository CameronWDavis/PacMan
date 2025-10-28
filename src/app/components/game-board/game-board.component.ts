import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../../services/game.service';
import { PacmanComponent } from '../pacman/pacman.component';
import { GhostComponent } from '../ghost/ghost.component';
import { PelletComponent } from '../pellet/pellet.component';
import { ScoreboardComponent } from '../scoreboard/scoreboard.component';
import { Position, Ghost, GameState, CellType } from '../../models/game.models';

@Component({
  selector: 'app-game-board',
  standalone: true,
  imports: [CommonModule, PacmanComponent, GhostComponent, PelletComponent, ScoreboardComponent],
  templateUrl: './game-board.component.html',
  styleUrl: './game-board.component.css'
})
export class GameBoardComponent implements OnInit, OnDestroy {
  gameBoard: number[][] = [];
  pacmanPosition: Position = { x: 0, y: 0 };
  pacmanDirection = { x: 0, y: 0 };
  ghosts: Ghost[] = [];
  gameState: GameState = {
    score: 0,
    lives: 3,
    level: 1,
    gameOver: false,
    won: false,
    isPaused: false
  };

  cellSize = 20;
  CellType = CellType;

  private gameLoopInterval: any;
  private ghostMoveInterval: any;

  constructor(private gameService: GameService) {}

  ngOnInit(): void {
    this.gameBoard = this.gameService.getBoard();
    this.cellSize = this.gameService.CELL_SIZE;

    // Subscribe to game state
    this.gameService.gameState.subscribe(state => {
      const previousLevel = this.gameState.level;
      this.gameState = state;

      // Update board reference when level changes
      if (state.level !== previousLevel) {
        // Small delay to ensure service has updated the board
        setTimeout(() => {
          this.gameBoard = this.gameService.getBoard();
        }, 100);
      }
    });

    this.gameService.pacmanPosition.subscribe(pos => {
      this.pacmanPosition = pos;
    });

    this.gameService.ghosts.subscribe(ghosts => {
      this.ghosts = ghosts;
    });

    // Start game loops
    this.startGameLoops();
  }

  ngOnDestroy(): void {
    this.stopGameLoops();
  }

  private startGameLoops(): void {
    // Pacman moves every 150ms
    this.gameLoopInterval = setInterval(() => {
      this.gameService.movePacman();
    }, 150);

    // Ghosts move every 200ms
    this.ghostMoveInterval = setInterval(() => {
      this.gameService.moveGhosts();
    }, 200);
  }

  private stopGameLoops(): void {
    if (this.gameLoopInterval) {
      clearInterval(this.gameLoopInterval);
    }
    if (this.ghostMoveInterval) {
      clearInterval(this.ghostMoveInterval);
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    event.preventDefault();

    switch (event.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        this.gameService.setDirection({ x: 0, y: -1 });
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        this.gameService.setDirection({ x: 0, y: 1 });
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        this.gameService.setDirection({ x: -1, y: 0 });
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        this.gameService.setDirection({ x: 1, y: 0 });
        break;
      case 'p':
      case 'P':
        if (!this.gameState.gameOver) {
          this.gameService.togglePause();
        }
        break;
      case ' ':
        if (this.gameState.gameOver) {
          this.gameService.resetGame();
        }
        break;
    }
  }

  getPellets(): Array<{ x: number; y: number; isPowerPellet: boolean }> {
    const pellets: Array<{ x: number; y: number; isPowerPellet: boolean }> = [];
    for (let y = 0; y < this.gameBoard.length; y++) {
      for (let x = 0; x < this.gameBoard[y].length; x++) {
        if (this.gameBoard[y][x] === CellType.PELLET) {
          pellets.push({ x, y, isPowerPellet: false });
        } else if (this.gameBoard[y][x] === CellType.POWER_PELLET) {
          pellets.push({ x, y, isPowerPellet: true });
        }
      }
    }
    return pellets;
  }

  trackPellet(index: number, pellet: { x: number; y: number; isPowerPellet: boolean }): string {
    return `${pellet.x}-${pellet.y}`;
  }
}
