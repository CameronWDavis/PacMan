import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameState } from '../../models/game.models';

@Component({
  selector: 'app-scoreboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './scoreboard.component.html',
  styleUrl: './scoreboard.component.css'
})
export class ScoreboardComponent {
  @Input() gameState!: GameState;
}
