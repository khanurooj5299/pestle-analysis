import { Component } from '@angular/core';
import { LinePlotComponent } from '../plots/line-plot/line-plot.component';
import { ScatterPlotComponent } from '../plots/scatter-plot/scatter-plot.component';
import { PlotCardComponent } from '../plots/plot-card/plot-card.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [LinePlotComponent, ScatterPlotComponent, PlotCardComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

}
