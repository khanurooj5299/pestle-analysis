import { Component, OnInit } from '@angular/core';

import { ObservationModel } from '../../models/observation.model';
import { DataService } from '../../services/data.service';
import { ListItemObservationComponent } from './list-item-observation/list-item-observation.component';

@Component({
  selector: 'app-list-observations',
  standalone: true,
  imports: [ListItemObservationComponent],
  templateUrl: './list-observations.component.html',
  styleUrl: './list-observations.component.css',
})
export class ListObservationsComponent implements OnInit {
  observations: ObservationModel[] = [];

  constructor(private dataService: DataService) {}
  ngOnInit(): void {
    this.dataService
      .getObservations()
      .subscribe((observations) =>
        observations.length ? (this.observations = observations) : ''
      );
  }
}
