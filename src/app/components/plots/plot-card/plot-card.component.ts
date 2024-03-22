import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-plot-card',
  standalone: true,
  imports: [],
  templateUrl: './plot-card.component.html',
  styleUrl: './plot-card.component.css'
})
export class PlotCardComponent {
  @Input('title') cardTitle: string = '';
}
