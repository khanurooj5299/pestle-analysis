import { Component, OnDestroy, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service';
import { ObservationModel } from '../../models/observation.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-scatter-plot',
  standalone: true,
  imports: [],
  templateUrl: './scatter-plot.component.html',
  styleUrl: './scatter-plot.component.css',
})
export class ScatterPlotComponent implements OnInit, OnDestroy {
  private observations: ObservationModel[] = [];
  private subscription: Subscription | undefined;

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.subscription = this.dataService
      .getObservations()
      .subscribe((data) => (this.observations = data));
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
