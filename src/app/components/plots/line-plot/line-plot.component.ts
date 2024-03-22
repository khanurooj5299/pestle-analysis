import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import * as d3 from 'd3';

import { ObservationModel } from '../../../models/observation.model';
import { DataService } from '../../../services/data.service';

@Component({
  selector: 'app-line-plot',
  standalone: true,
  imports: [],
  templateUrl: './line-plot.component.html',
  styleUrl: './line-plot.component.css',
})
export class LinePlotComponent implements OnInit, OnDestroy {
  private observations: ObservationModel[] = [];
  private subscription: Subscription | undefined;
  private lineSVG: any;

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
    //line plot for published date vs intensity
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
          data.published ? new Date(data.published) : data.published
        )
    ) as Date;
    const maxDate = d3.max(
      this.observations,
      (d) => new Date(d.published)
    ) as Date;
    const xScale = d3
      .scaleTime([minDate, maxDate], [marginLeft, width - marginRight])
      .nice();

    //create y-scale
    const minIntensity = d3.min(
      this.observations,
      (d) => d.intensity
    ) as number;
    const maxIntensity = d3.max(
      this.observations,
      (d) => d.intensity
    ) as number;
    const yScale = d3
      .scaleLinear(
        [minIntensity, maxIntensity],
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
          .text('Published date →')
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
          .text('↑ Intensity')
      );

    //create the line generator
    const line = d3
      .line()
      //only plot those observations which have no missing pieces
      .defined((d: any) => d.intensity && d.published)
      .x((d: any) => xScale(new Date(d.published)))
      .y((d: any) => yScale(d.intensity));

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

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
