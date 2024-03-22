import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import * as d3 from 'd3';
import {MatSelectModule} from '@angular/material/select';

import { ObservationModel } from '../../../models/observation.model';
import { DataService } from '../../../services/data.service';
import { MatFormFieldModule } from '@angular/material/form-field';

type x_fields = "published"|"added"|"end_year"|"start_year";
type y_fields = "intensity"|"impact"|"relevance"|"likelihood"

@Component({
  selector: 'app-line-plot',
  standalone: true,
  imports: [MatSelectModule, MatFormFieldModule],
  templateUrl: './line-plot.component.html',
  styleUrl: './line-plot.component.css',
})
export class LinePlotComponent implements OnInit, OnDestroy {
  private observations: ObservationModel[] = [];
  private subscription: Subscription | undefined;
  private lineSVG: any;
  //getters and setters for default fields used for plotting
  private _xField: x_fields= "published";
  public get xField() {
    return this._xField;
  }
  public set xField(field) {
    this._xField = field;
    this.sortObservations(field);
    this.renderPlot();
  }
  private _yField: y_fields = "intensity";
  public get yField() {
    return this._yField;
  }
  public set yField(field) {
    this._yField = field;
    this.renderPlot();
  }

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
    d3.selectAll("#line-plot > *").remove();

    //line plot for date fields vs numerical fields (check xFields and yFields types above)
    const width = 900;
    const height = 500;
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
    const minY = d3.min(
      this.observations,
      (d) => d[this.yField]
    ) as number;
    const maxY = d3.max(
      this.observations,
      (d) => d[this.yField]
    ) as number;
    const yScale = d3
      .scaleLinear(
        [minY, maxY],
        [height - marginBottom, marginTop]
      )
      .nice();

    //create svg-container
    this.lineSVG = d3
      .select('figure#line-plot')
      .append('svg')
      .attr('viewBox', [0, 0, width, height])
      .attr('style', 'max-width: 100%; height: auto; font: 100px sans-serif;');

    //draw x-axis
    this.lineSVG
      .append('g')
      .attr('transform', `translate(0,${height - marginBottom})`)
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
    this.lineSVG
      .append('g')
      .attr('transform', `translate(${marginLeft},0)`)
      .call(d3.axisLeft(yScale))
      .call((g: any) =>
        g
          .append('text')
          .attr('x', -marginLeft + 10)
          .attr('y', 10)
          .attr('fill', 'currentColor')
          .attr('text-anchor', 'start')
          .text(`↑ ${this.yField}`)
      );

    //create the line generator
    const line = d3
      .line()
      //only plot those observations which have no missing pieces
      .defined((d: any) => d[this.yField] && d[this.xField])
      .x((d: any) => xScale(new Date(d[this.xField])))
      .y((d: any) => yScale(d[this.yField]));

    //draw the line
    this.lineSVG
      .append('path')
      .datum(this.observations)
      .attr('d', line)
      .style('stroke', 'rgb(0, 207, 232)')
      .style('stroke-width', 1)
      .style('fill', 'transparent');

    // Create the grid.
    this.lineSVG
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
          .attr('y1', marginTop)
          .attr('y2', height - marginBottom)
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
  }

  sortObservations(field: x_fields) {
    this.observations.sort((a, b) => new Date(a[field]).getTime() - new Date(b[field]).getTime());
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
