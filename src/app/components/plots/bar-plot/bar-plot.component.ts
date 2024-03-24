import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import legend from 'd3-svg-legend';

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
export class BarPlotComponent implements OnInit {
  //This component plots the pestle vs average of selected numerical field
  //like intensity etc.,, where for each pestle
  //stacked bars are shown for selected category for that pestle.
  //for this plot the data will come in a specific format from backend
  private observations: StackedBarsPlotObservationModel[] = [];
  private svg: any;
  xField: 'pestle' = 'pestle';
  yField: y_fields = 'intensity';
  stackedBarsField: stacked_bars_fields = 'sector';

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.setObservations();
  }

  setObservations() {
    this.dataService
      .getStackedBarsPlotObservations(
        this.xField,
        this.yField,
        this.stackedBarsField
      )
      .subscribe((data) => {
        if (data.length) {
          this.observations = data;
          this.renderPlot();
        }
      });
  }

  renderPlot() {
    //clear any prior chart renders
    d3.selectAll('#bar-plot > *').remove();

    //stacked bar plot for pestle vs average numerical fields (check xFields and yFields types above) with
    //color scale to show other categories
    const width = 2000;
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
      .range([marginLeft, width - marginRight])
      .paddingInner(0.2);

    //create positional and color scale for stacked bars
    //first get all distinct values for the selected category
    const stackedBarsCategoryDomain = Array.from(
      new Set(
        this.observations.map(
          (d) => d[this.stackedBarsField] as stacked_bars_fields
        )
      )
    );
    //create positional scale for the category
    const stackedBarsPositionalScale = d3
      .scaleBand()
      .domain(stackedBarsCategoryDomain)
      .range([0, xScale.bandwidth()])
    //for color scale we want to use scaleOrdinal but
    //more than 11 colors might be needed, hence we first map
    //index to a continous color scale
    //then map category value to color using a custom scale
    const indexToColorScale = d3.scaleLinear(
      [0, stackedBarsCategoryDomain.length],
      ['#FF0000', '#00FF00']
    );
    const stackedBarsColorScale = (category: stacked_bars_fields) => {
      const indexOfCategory = stackedBarsCategoryDomain.indexOf(category);
      return indexToColorScale(indexOfCategory);
    };

    //create y-scale
    const yScale = d3
      .scaleLinear()
      .domain([
        0,
        d3.max(this.observations, (d) => d[`mean_${this.yField}`]) as number,
      ])
      .nice()
      .range([totalHeight - marginBottom, legendHeight + marginTop]);

    // create svg container.
    this.svg = d3
      .select('figure#bar-plot')
      .append('svg')
      .attr('viewBox', [0, 0, width, totalHeight])
      .attr('style', 'max-width: 100%; height: auto;');

    // draw x-axis
    this.svg
      .append('g')
      .attr('transform', `translate(0,${totalHeight - marginBottom})`)
      .call(d3.axisBottom(xScale).tickSizeOuter(0))
      .call((g: any) =>
        g
          .append('text')
          .attr('x', width - marginRight)
          .attr('y', marginBottom - 4)
          .attr('fill', 'currentColor')
          .attr('text-anchor', 'end')
          .text(`${this.xField} →`)
      );

    // draw y-axis
    this.svg
      .append('g')
      .attr('transform', `translate(${marginLeft},0)`)
      .call(d3.axisLeft(yScale).tickSizeOuter(0))
      .call((g: any) =>
        g
          .append('text')
          .attr('x', -marginLeft + 10)
          .attr('y', legendHeight + marginTop - 15)
          .attr('fill', 'currentColor')
          .attr('text-anchor', 'start')
          .text(`↑ mean_${this.yField}`)
      );

    //draw bars
    // Append a group for each xField like pestle, and a rect for each stackedBarField like region.
    this.svg
      .append('g')
      .selectAll()
      .data(d3.group(this.observations, (d) => d[this.xField]))
      .join('g')
      .attr('transform', ([xField]: any) => `translate(${xScale(xField)},0)`)
      .selectAll()
      .data(([, d]: any) => d)
      .join('rect')
      .attr('x', (d: StackedBarsPlotObservationModel) => stackedBarsPositionalScale(d[this.stackedBarsField] as string)
      )
      .attr('y', (d: StackedBarsPlotObservationModel) =>
        yScale(d[`mean_${this.yField}`])
      )
      .attr('width', stackedBarsPositionalScale.bandwidth())
      .attr(
        'height',
        (d: StackedBarsPlotObservationModel) =>
          yScale(0) - yScale(d[`mean_${this.yField}`])
      )
      .attr('fill', (d: StackedBarsPlotObservationModel) =>
        stackedBarsColorScale(d[this.stackedBarsField] as stacked_bars_fields)
      );

    //   //draw color-legend for stackBarField category//draw colour legend for Pestle
    // this.svg
    //   .append('g')
    //   .attr('class', 'legendOrdinal')
    //   .attr('transform', `translate(20, 30)`);

    // const legendOrdinal = legend
    //   .legendColor()
    //   .shapeWidth(50)
    //   .title(`Color Scale: ${this.stackedBarsField}`)
    //   .shapePadding(50)
    //   .orient('horizontal')
    //   .scale(stackedBarsColorScale);

    // this.svg.select('.legendOrdinal').call(legendOrdinal);

    // //Style the Title for Legend
    // d3.select('.legendTitle')
    //   .attr('transform', 'translate(10, 0)')
    //   .style('font-size', '15px');
  }
}
