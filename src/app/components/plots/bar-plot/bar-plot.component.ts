import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';

import { DataService } from '../../../services/data.service';
import { StackedBarsPlotObservationModel } from '../../../models/stacked-bars-plot-observation.model';

//possible numerical fields for y-axis
type y_fields =
  | 'intensity'
  | 'impact'
  | 'relevance'
  | 'likelihood'
  | 'end_year'
  | 'start_year'
  | 'added'
  | 'published';
//possible categorical fields for stacked bars
type stacked_bars_fields = 'sector' | 'region';
type x_fields = 'pestle';
@Component({
  selector: 'app-bar-plot',
  standalone: true,
  imports: [],
  templateUrl: './bar-plot.component.html',
  styleUrl: './bar-plot.component.css',
})
export class BarPlotComponent implements OnInit{
  //This component plots the pestle vs average of selected numerical field 
  //like intensity etc.,, where for each pestle
  //stacked bars are shown for selected category for that pestle.
  //for this plot the data will come in a specific format from backend
  private observations: StackedBarsPlotObservationModel[] = [];
  private svg: any;
  xField: 'pestle' = 'pestle';
  yField: y_fields = 'intensity';
  stackedBarsField: stacked_bars_fields = 'region';

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.setObservations();
  }

  setObservations() {
    this.dataService
      .getStackedBarsPlotObservations(this.xField, this.yField, this.stackedBarsField)
      .subscribe((data) => {
        if (data.length) {
          this.observations = data;
          this.renderPlot();
        }
      });
  }

  renderPlot() {
    //stacked bar plot for pestle vs average numerical fields (check xFields and yFields types above) with
    //color scale to show other categories
    const width = 900;
    const plotHeight = 500;
    const legendHeight = 100;
    const totalHeight = plotHeight + legendHeight;
    const marginTop = 25;
    const marginRight = 40;
    const marginBottom = 35;
    const marginLeft = 40;

    //create x-scale
    const xScale = d3
      .scaleBand()
      //as x_fields is needed because this.observations has type StackedBarsPlotObservationModel[]
      //and StackedBarsPlotObservationModel has type Partial<ObservationModel>
      //so ts thinks that d[this.xField] maybe undefined 
      .domain(new Set(this.observations.map((d) => d[this.xField] as x_fields)))
      .rangeRound([marginLeft, width - marginRight])
      .paddingInner(0.1);

    //create positional and color scale for stacked bars
    const stackedBarsCategoryDomain = new Set(
      this.observations.map((d) => d[this.stackedBarsField] as stacked_bars_fields)
    );
    const stackedBarsPositionalScale = d3
      .scaleBand()
      .domain(stackedBarsCategoryDomain)
      .rangeRound([0, xScale.bandwidth()])
      .padding(0.05);
    const stackedBarsColorScale = d3
      .scaleOrdinal()
      .domain(stackedBarsCategoryDomain)
      .range(d3.schemeSpectral[stackedBarsCategoryDomain.size])
      .unknown('#ccc');

      //create y-scale
      const y = d3.scaleLinear()
      .domain([0, d3.max(this.observations, d => d[`mean_${this.yField}`]) as number]).nice()
      .rangeRound([plotHeight - marginBottom, marginTop]);
  }
}
