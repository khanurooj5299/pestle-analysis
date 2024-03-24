import { Component, OnInit } from '@angular/core';

import { ObservationModel } from '../../models/observation.model';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

import { DataService } from '../../services/data.service';
import { ListItemObservationComponent } from './list-item-observation/list-item-observation.component';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-list-observations',
  standalone: true,
  imports: [
    ListItemObservationComponent,
    MatPaginatorModule,
    MatSelectModule,
    MatFormFieldModule,
    TitleCasePipe
  ],
  templateUrl: './list-observations.component.html',
  styleUrl: './list-observations.component.css',
})
export class ListObservationsComponent implements OnInit {
  observations: ObservationModel[] = [];
  currentObservations: ObservationModel[] = [];
  pageSize = 9;
  //categories on basis of which filtering is allowed
  filterCategories: string[] = [
    'none',
    'topic',
    'sector',
    'region',
    'pestle',
    'source',
    'country',
  ];
  selectedFilterCategory: string = "none";
  //possible values for the selected category
  selectedFilterCategoryDomain: string[] = [];
  //selected value from the domain of the selected category
  selectedFilterCategorySelectedValue: string = "";

  constructor(private dataService: DataService) {}
  ngOnInit(): void {
    this.dataService.getObservations().subscribe((observations) => {
      if (observations.length) {
        this.observations = observations;
        //for pagination on initial load
        this.currentObservations = this.observations.slice(0, this.pageSize);
      }
    });
  }
  paginate(pageEvent: PageEvent) {
    this.pageSize = pageEvent.pageSize;
    const newStartIndex = pageEvent.pageIndex * this.pageSize;
    this.currentObservations = this.observations.slice(
      newStartIndex,
      newStartIndex + this.pageSize
    );
  }

  changeFilterCategory(selectedFilterCategory: string) {
    this.selectedFilterCategory = selectedFilterCategory;
    this.dataService.getCategoryDomain(selectedFilterCategory).subscribe(data=>{
      this.selectedFilterCategoryDomain = data;
    });
  }

  changeFilterCategoryValue(value: string) {
    
  }
}
