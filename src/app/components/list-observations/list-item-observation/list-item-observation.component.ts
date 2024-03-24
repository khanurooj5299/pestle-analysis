import { Component, Input } from '@angular/core';
import { KeyValuePipe } from '@angular/common';
import {MatDividerModule} from '@angular/material/divider';

import { ObservationModel } from '../../../models/observation.model';

@Component({
  selector: 'app-list-item-observation',
  standalone: true,
  imports: [KeyValuePipe, MatDividerModule],
  templateUrl: './list-item-observation.component.html',
  styleUrl: './list-item-observation.component.css'
})
export class ListItemObservationComponent {
  @Input('item') observationItem?: ObservationModel;
  //these fields of item are not displayed in the info area
  infoExcludeFields = ["_id", "title", "insight", "__v"]
}
