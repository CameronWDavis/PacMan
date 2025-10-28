import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Position, Direction } from '../../models/game.models';

@Component({
  selector: 'app-pacman',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pacman.component.html',
  styleUrl: './pacman.component.css'
})
export class PacmanComponent {
  @Input() position!: Position;
  @Input() direction!: Direction;
  @Input() cellSize: number = 20;

  getRotation(): number {
    if (this.direction.x === 1) return 0;
    if (this.direction.x === -1) return 180;
    if (this.direction.y === 1) return 90;
    if (this.direction.y === -1) return -90;
    return 0;
  }
}
