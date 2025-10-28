import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pellet',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pellet.component.html',
  styleUrl: './pellet.component.css'
})
export class PelletComponent {
  @Input() x: number = 0;
  @Input() y: number = 0;
  @Input() isPowerPellet: boolean = false;
  @Input() cellSize: number = 20;
}
