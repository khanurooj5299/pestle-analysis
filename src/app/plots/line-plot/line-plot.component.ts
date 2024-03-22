import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import * as d3 from 'd3';

import { DataService } from '../../services/data.service';
import { ObservationModel } from '../../models/observation.model';

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
    const width = 928;
    const height = 600;
    const marginTop = 25;
    const marginRight = 20;
    const marginBottom = 35;
    const marginLeft = 40;

    //create x-scale
    const minDate = d3.min(
      this.observations
        .filter((data) => data.published != null)
        .map((data) => new Date(data.published))
    ) as Date;
    const maxDate = d3.max(
      this.observations,
      (d) => new Date(d.published)
    ) as Date;
    const xScale = d3
      .scaleTime(
        [minDate, maxDate],
        [marginLeft, width - marginRight - marginRight]
      )
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
      .attr('style', 'max-width: 100%; height: auto; font: 10px sans-serif;');

    //draw x-axis
    this.lineSVG
      .append('g')
      .attr('transform', `translate(0,${height - marginBottom})`)
      .call(d3.axisBottom(xScale));

    //draw y-axis
    this.lineSVG
      .append('g')
      .attr('transform', `translate(${marginLeft},0)`)
      .call(d3.axisLeft(yScale));

    //create the line generator
    //??deal with missing data
    const line = d3
      .line()
      .x((d: any) => {
        if (d.published) return xScale(new Date(d.published));
        return xScale(minDate);
      })
      .y((d: any) => {
        if (d.intensity) return yScale(d.intensity);
        return yScale(minIntensity);
      });

    //draw the line
    this.lineSVG
      .append('path')
      .datum(this.observations)
      .attr('d', line)
      .style('stroke', '#787878')
      .style('stroke-width', 2)
      .style('fill', 'transparent');
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
