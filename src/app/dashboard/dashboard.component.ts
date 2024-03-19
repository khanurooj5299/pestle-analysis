import { Component } from '@angular/core';
import { ScatterPlotComponent } from '../plots/scatter-plot/scatter-plot.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ScatterPlotComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

}
