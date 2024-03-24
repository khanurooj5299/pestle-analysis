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
    TitleCasePipe,
  ],
  templateUrl: './list-observations.component.html',
  styleUrl: './list-observations.component.css',
})
export class ListObservationsComponent implements OnInit {
  observations: ObservationModel[] = [];
  filteredObservations: ObservationModel[] = [];
  currentObservations: ObservationModel[] = [];
  pageSize = 9;
  pageSizeOptions = [9, 18, 50, 100];
  pageIndex = 0;
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
  selectedFilterCategory: string = 'none';
  //possible values for the selected category
  selectedFilterCategoryDomain: string[] = [];
  //selected value from the domain of the selected category
  selectedFilterCategorySelectedValue: string = '';

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
  paginate({ pageSize, pageIndex }: { pageSize: number; pageIndex: number }) {
    this.pageSize = pageSize;
    this.pageIndex = pageIndex;
    const newStartIndex = pageIndex * this.pageSize;
    const source = this.selectedFilterCategorySelectedValue
      ? this.filteredObservations
      : this.observations;
    this.currentObservations = source.slice(
      newStartIndex,
      newStartIndex + this.pageSize
    );
  }

  changeFilterCategory(selectedFilterCategory: string) {
    this.selectedFilterCategory = selectedFilterCategory;
    //reset
    if (
      selectedFilterCategory == 'none' &&
      this.selectedFilterCategorySelectedValue
    ) {
      this.selectedFilterCategorySelectedValue = '';
      this.paginate({ pageSize: 9, pageIndex: 0 });
    } else if (selectedFilterCategory == 'none') {
      //do nothing
    } else {
      this.dataService
        .getCategoryDomain(selectedFilterCategory)
        .subscribe((data) => {
          this.selectedFilterCategoryDomain = data;
        });
    }
  }

  changeSelectedFilterCategoryValue(value: string) {
    this.selectedFilterCategorySelectedValue = value;
    this.filteredObservations = this.observations.filter(
      (obs) =>
        obs[this.selectedFilterCategory as keyof ObservationModel] == value
    );
    //reset pagination
    this.paginate({ pageSize: 9, pageIndex: 0 });
  }
}
