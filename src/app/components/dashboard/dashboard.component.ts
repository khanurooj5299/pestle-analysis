import { Component } from '@angular/core';
import { LineScatterPlotComponent } from '../plots/line-scatter-plot/line-scatter-plot.component';
import { PlotCardComponent } from '../plots/plot-card/plot-card.component';
import { BarPlotComponent } from '../plots/bar-plot/bar-plot.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [LineScatterPlotComponent, PlotCardComponent, BarPlotComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

}
