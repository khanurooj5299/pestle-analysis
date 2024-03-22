import { Component } from '@angular/core';
import { LinePlotComponent } from '../plots/line-plot/line-plot.component';
import { ScatterPlotComponent } from '../plots/scatter-plot/scatter-plot.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [LinePlotComponent, ScatterPlotComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

}
