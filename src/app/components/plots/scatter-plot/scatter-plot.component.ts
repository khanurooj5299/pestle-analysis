import { Component, OnDestroy, OnInit } from '@angular/core';
import { DataService } from '../../../services/data.service';
import { ObservationModel } from '../../../models/observation.model';
import { Subscription } from 'rxjs';
import * as d3 from 'd3';

@Component({
  selector: 'app-scatter-plot',
  standalone: true,
  imports: [],
  templateUrl: './scatter-plot.component.html',
  styleUrl: './scatter-plot.component.css',
})
export class ScatterPlotComponent implements OnInit, OnDestroy {
  private observations: ObservationModel[] = [];
  private subscription: Subscription | undefined;
  private x_category = 'pestle';
  private y_numerical = 'intensity';
  private x_category_domain: string[] = [];
  private scatterSVG: any;

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.subscription = this.dataService.getObservations().subscribe((data) => {
      
      if (data.length) {
        this.observations = data;
        console.log(this.observations)
        // this.renderPlot();
        this.testPlot();
      }
    });
  }

  renderPlot() {
    const width = 928;
    const height = 600;
    const marginTop = 25;
    const marginRight = 20;
    const marginBottom = 35;
    const marginLeft = 40;

    this.dataService.getCategoryDomain(this.x_category).subscribe((data) => {
      this.x_category_domain = data;
      //handle error later

      //x-axis scale
      const x = d3
        .scalePoint()
        .domain(this.x_category_domain)
        .range([marginLeft, width - marginRight - marginRight]);

      //y-axis scale
      const y = d3
        .scaleLinear()
        .domain(
          d3.extent(
            this.observations,
            (d) => d.intensity
          ) as Iterable<d3.NumberValue>
        )
        .range([height - marginBottom, marginTop]);

      //creating the svg container for the plot only if it wasnt created before
      if (!this.scatterSVG) {
        this.scatterSVG = d3
          .select('figure#scatter-plot')
          .append('svg')
          .attr('viewBox', [0, 0, width, height])
          .attr(
            'style',
            'max-width: 100%; height: auto; font: 10px sans-serif;'
          );
      }

      //drawing the x-axis on the plot
      this.scatterSVG
        .append('g')
        .attr('transform', `translate(0,${height - marginBottom})`)
        .call(d3.axisBottom(x))
        .call((g: any) =>
          g
            .append('text')
            .attr('x', width)
            .attr('y', marginBottom - 4)
            .attr('fill', 'currentColor')
            .attr('text-anchor', 'end')
            .text(`${this.x_category} →`)
        );

      //drawing the y-axis on the plot
      this.scatterSVG
        .append('g')
        .attr('transform', `translate(${marginLeft},0)`)
        .call(d3.axisLeft(y))
        .call((g: any) =>
          g
            .append('text')
            .attr('x', -marginLeft)
            .attr('y', 10)
            .attr('fill', 'currentColor')
            .attr('text-anchor', 'start')
            .text(` ${this.y_numerical}`)
        );

      //drawing the dots
      // Add a layer of dots.
      this.scatterSVG
        .append('g')
        .attr('stroke', 'steelblue')
        .attr('stroke-width', 1.5)
        .attr('fill', 'none')
        .selectAll('circle')
        .data(this.observations)
        .join('circle')
        .attr('cx', (d: any) => {
          return x(d.pestle) as number;
        })
        .attr('cy', (d: any) => y(d.intensity))
        .attr('r', 3);
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  testPlot() {
    const width = 928;
    const height = 600;
    const marginTop = 25;
    const marginRight = 20;
    const marginBottom = 35;
    const marginLeft = 40;

    //x-scale
    const minDate = d3.min(this.observations.filter((data)=>data.published!=null).map(data=>new Date(data.published))) as Date;
    const maxDate = d3.max(this.observations, (d) => new Date(d.published)) as Date;
    const xScale = d3.scaleTime(
      [minDate, maxDate],
      [marginLeft, width - marginRight - marginRight]
    ).nice();

    //y=scale
    const minIntensity = d3.min(
      this.observations,
      (d) => d.intensity
    ) as number;
    const maxIntensity = d3.max(
      this.observations,
      (d) => d.intensity
    ) as number;
    const yScale = d3.scaleLinear(
      [minIntensity, maxIntensity],
      [height - marginBottom, marginTop]
    ).nice();

    //svg-container
    this.scatterSVG = d3
      .select('figure#scatter-plot')
      .append('svg')
      .attr('viewBox', [0, 0, width, height])
      .attr('style', 'max-width: 100%; height: auto; font: 10px sans-serif;');

    //x-axis
    this.scatterSVG
      .append('g')
      .attr('transform', `translate(0,${height - marginBottom})`)
      .call(d3.axisBottom(xScale))

    //y-axis
    this.scatterSVG
      .append('g')
      .attr('transform', `translate(${marginLeft},0)`)
      .call(d3.axisLeft(yScale).tickSizeOuter(0))

      //color scale
      const colorScale = d3.scaleOrdinal().range(d3.schemeCategory10)

      //the line
      //??deal with missing data
    //   const line = d3.line()
    // .x((d: any) => {
    //   if(d.published) return xScale(new Date(d.published))
    //   return xScale(minDate)
    // })
    // .y((d: any) => {
    //     if(d.intensity) return yScale(d.intensity)
    //     return yScale(minIntensity)
    // })
    // // .curve(d3.curveNatural)

    // this.scatterSVG.append('path').datum(this.observations).attr('d', line).style('stroke', "#787878")
    //   .style('stroke-width', 2)
    //   .style('fill', 'transparent')

    this.scatterSVG.append('g')
    .selectAll('g')
    .data( this.observations )
    // each data point is a group
    .join('g')
      .attr('transform', (d: any) => `translate(${xScale(new Date(d.published))},${yScale(d.intensity)})`)
    // .call() passes in the current d3 selection
    // This is great if we want to append something
    // but still want to work with the original selection after that
    .call((g: any) => g
      // first we append a circle to our data point
      .append('circle')
        .attr('r', 5)
        .style('stroke', (d: any) => colorScale( d.pestle ))
        .style('stroke-width', 2)
        .style('fill', 'transparent')
    )
  }
}
