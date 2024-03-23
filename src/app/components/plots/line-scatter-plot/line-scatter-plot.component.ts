import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import * as d3 from 'd3';
import legend from 'd3-svg-legend';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { FormsModule } from '@angular/forms';

import { ObservationModel } from '../../../models/observation.model';
import { DataService } from '../../../services/data.service';

type x_fields = 'published' | 'added' | 'end_year' | 'start_year';
type y_fields = 'intensity' | 'impact' | 'relevance' | 'likelihood';

@Component({
  selector: 'app-line-plot',
  standalone: true,
  imports: [MatSelectModule, FormsModule, MatButtonToggleModule],
  templateUrl: './line-scatter-plot.component.html',
  styleUrl: './line-scatter-plot.component.css',
})
export class LineScatterPlotComponent implements OnInit, OnDestroy {
  private observations: ObservationModel[] = [];
  private subscription: Subscription | undefined;
  private svg: any;
  //getters and setters for default fields used for plotting
  //could use change event of select also to trigger plot render when select is changed. Just wanted to practice getters and setters
  private _xField: x_fields = 'published';
  public get xField() {
    return this._xField;
  }
  public set xField(field) {
    this._xField = field;
    this.sortObservations(field);
    this.renderPlot();
  }
  private _yField: y_fields = 'intensity';
  public get yField() {
    return this._yField;
  }
  public set yField(field) {
    this._yField = field;
    this.renderPlot();
  }
  plotType: string = 'line';

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.subscription = this.dataService.getObservations().subscribe((data) => {
      if (data.length) {
        this.observations = data;
        this.renderPlot();
      }
    });
  }

  renderPlot() {
    //clear any prior chart renders
    d3.selectAll('#line-plot > *').remove();

    //line plot for date fields vs numerical fields (check xFields and yFields types above)
    const width = 900;
    const plotHeight = 500;
    const legendHeight = 100;
    const totalHeight = plotHeight + legendHeight;
    const marginTop = 25;
    const marginRight = 40;
    const marginBottom = 35;
    const marginLeft = 40;

    //create x-scale
    const minDate = d3.min(
      this.observations
        //d3.min ignores null values but new Date(null) returns the start date in JS
        .map((data) =>
          data[this.xField] ? new Date(data[this.xField]) : data[this.xField]
        )
    ) as Date;
    const maxDate = d3.max(
      this.observations,
      (d) => new Date(d[this.xField])
    ) as Date;
    const xScale = d3
      .scaleTime([minDate, maxDate], [marginLeft, width - marginRight])
      .nice();

    //create y-scale
    const minY = d3.min(this.observations, (d) => d[this.yField]) as number;
    const maxY = d3.max(this.observations, (d) => d[this.yField]) as number;
    const yScale = d3
      .scaleLinear(
        [minY, maxY],
        [totalHeight - marginBottom, legendHeight + marginTop]
      )
      .nice();

    //create svg-container
    this.svg = d3
      .select('figure#line-plot')
      .append('svg')
      .attr('style', 'max-width: 100%; height: auto; font: 10px sans-serif;');

    //draw x-axis
    this.svg
      .append('g')
      .attr('transform', `translate(0,${totalHeight - marginBottom})`)
      .call(d3.axisBottom(xScale))
      .call((g: any) =>
        g
          .append('text')
          .attr('x', width - marginRight)
          .attr('y', marginBottom - 4)
          .attr('fill', 'currentColor')
          .attr('text-anchor', 'end')
          .text(`${this.xField} date →`)
      );

    //draw y-axis
    this.svg
      .append('g')
      .attr('transform', `translate(${marginLeft},0)`)
      .call(d3.axisLeft(yScale))
      .call((g: any) =>
        g
          .append('text')
          .attr('x', -marginLeft + 10)
          .attr('y', legendHeight + marginTop - 15)
          .attr('fill', 'currentColor')
          .attr('text-anchor', 'start')
          .text(`↑ ${this.yField}`)
      );

    // draw the grid.
    this.svg
      .append('g')
      .attr('stroke', 'currentColor')
      .attr('stroke-opacity', 0.2)
      .call((g: any) =>
        g
          .append('g')
          .selectAll('line')
          .data(xScale.ticks())
          .join('line')
          .attr('x1', (d: any) => xScale(d))
          .attr('x2', (d: any) => xScale(d))
          .attr('y1', legendHeight + marginTop)
          .attr('y2', totalHeight - marginBottom)
      )
      .call((g: any) =>
        g
          .append('g')
          .selectAll('line')
          .data(yScale.ticks())
          .join('line')
          .attr('y1', (d: any) => yScale(d))
          .attr('y2', (d: any) => yScale(d))
          .attr('x1', marginLeft)
          .attr('x2', width - marginRight)
      );

    //draw line or dots based on value of plotType
    if (this.plotType == 'line') {
      //set viewbox for line plot. Thi will exclude the space needed for legend in scatter plot
      this.svg.attr("viewBox", [0, legendHeight, width, plotHeight]);
      this.renderLine(xScale, yScale);
    } else {
      //set viewbox for scatter plot
      this.svg.attr("viewBox", [0, 0, width, totalHeight])
      this.renderScatter(xScale, yScale);
    }
  }

  sortObservations(field: x_fields) {
    this.observations.sort(
      (a, b) => new Date(a[field]).getTime() - new Date(b[field]).getTime()
    );
  }

  changePlotType(plotType: string) {
    this.plotType = plotType;
    this.renderPlot();
  }

  renderLine(
    xScale: d3.ScaleTime<number, number, never>,
    yScale: d3.ScaleLinear<number, number, never>
  ) {
    //create the line generator
    const line = d3
      .line()
      //only plot those observations which have no missing pieces
      .defined((d: any) => d[this.yField] && d[this.xField])
      .x((d: any) => xScale(new Date(d[this.xField])))
      .y((d: any) => yScale(d[this.yField]));

    //draw the line
    this.svg
      .append('path')
      .datum(this.observations)
      .attr('d', line)
      .style('stroke', 'rgb(0, 207, 232)')
      .style('stroke-width', 1)
      .style('fill', 'transparent');
  }

  renderScatter(
    xScale: d3.ScaleTime<number, number, never>,
    yScale: d3.ScaleLinear<number, number, never>
  ) {
    //filter out missing data
    const data = this.observations.filter(
      (obs) => obs[this.xField] && obs[this.yField]
    );

    //create color scale for pestle
    const colorScale = d3
      .scaleOrdinal()
      .domain(data.filter((d) => d.pestle).map((d) => d.pestle))
      .range(d3.schemeCategory10);

    //draw dots
    this.svg
      .append('g')
      .selectAll('g')
      .data(data)
      .join('g')
      .attr(
        'transform',
        (d: any) =>
          `translate(${xScale(new Date(d[this.xField]))},${yScale(
            d[this.yField]
          )})`
      )
      .call((g: any) =>
        g
          .append('circle')
          .attr('r', 5)
          .style('stroke', (d: any) => colorScale(d.pestle))
          .style('stroke-width', 2)
          .style('fill', 'transparent')
      );

    //draw colour legend for Pestle
    this.svg
      .append('g')
      .attr('class', 'legendOrdinal')
      .attr('transform', `translate(20, 30)`);

    const legendOrdinal = legend
      .legendColor()
      .shapeWidth(50)
      .title('Color Scale: Pestle')
      .shapePadding(50)
      .orient('horizontal')
      .scale(colorScale);

    this.svg.select('.legendOrdinal').call(legendOrdinal);

    //Style the Title for Legend
    d3.select('.legendTitle')
      .attr('transform', 'translate(10, 0)')
      .style('font-size', '15px');
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
