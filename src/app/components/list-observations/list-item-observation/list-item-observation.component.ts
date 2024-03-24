import { Component, Input } from '@angular/core';
import { DatePipe, KeyValuePipe } from '@angular/common';
import {MatDividerModule} from '@angular/material/divider';
import {MatIconModule} from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { ObservationModel } from '../../../models/observation.model';

@Component({
  selector: 'app-list-item-observation',
  standalone: true,
  imports: [KeyValuePipe, MatDividerModule, DatePipe, MatButtonModule, MatIconModule],
  templateUrl: './list-item-observation.component.html',
  styleUrl: './list-item-observation.component.css'
})
export class ListItemObservationComponent {
  @Input('item') observationItem?: ObservationModel;
  //these fields of item are not displayed in the info area
  infoExcludeFields = ["_id", "title", "insight", "__v", "url"]
}
