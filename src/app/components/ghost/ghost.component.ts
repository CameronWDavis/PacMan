import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Ghost } from '../../models/game.models';

@Component({
  selector: 'app-ghost',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ghost.component.html',
  styleUrl: './ghost.component.css'
})
export class GhostComponent {
  @Input() ghost!: Ghost;
  @Input() cellSize: number = 20;
}
