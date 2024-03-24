import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import legend from 'd3-svg-legend';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { FormsModule } from '@angular/forms';

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
  imports: [MatSelectModule, FormsModule, MatButtonToggleModule],
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
  plotType: 'simple' | 'stacked' = 'stacked';
  private colorArray: string[] = [];

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.setObservationsAndRender();
  }

  setObservationsAndRender() {
    this.dataService
      .getStackedBarsPlotObservations(
        this.xField,
        this.yField,
        this.stackedBarsField
      )
      .subscribe((data) => {
        if (data.length) {
          this.observations = data;
          if (this.plotType == 'stacked') {
            //if mode is stacked colorArray is also needed before rendering
            this.dataService.getColorArray().subscribe({
              next: (colorArray) => {
                this.colorArray = colorArray;
                this.renderPlot();
              },
            });
          } else {
            this.renderPlot();
          }
        }
      });
  }

  renderPlot() {
    //clear any prior chart renders
    d3.selectAll('#bar-plot > *').remove();

    //stacked bar plot for pestle vs average numerical fields (check xFields and yFields types above) with
    //color scale to show other categories
    const width = 900;
    const plotHeight = 500;
    const legendHeight = 200;
    const totalHeight = plotHeight + legendHeight;
    const marginTop = 25;
    const marginRight = 40;
    const marginBottom = 35;
    const marginLeft = 40;

    //create x-scale
    const xScale = d3
      .scaleBand()
      //'as x_fields' is needed because this.observations has type StackedBarsPlotObservationModel[]
      //and StackedBarsPlotObservationModel has type Partial<ObservationModel>
      //so ts thinks that d[this.xField] maybe undefined
      .domain(new Set(this.observations.map((d) => d[this.xField] as x_fields)))
      .range([marginLeft, width - marginRight])
      .paddingInner(0.2);

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
    //draw stacked or simple bar plot based on value of plotType
    if (this.plotType == 'simple') {
      //set viewbox for simple bar plot. Thi will exclude the space needed for legend in stacked bar plot
      this.svg.attr('viewBox', [0, legendHeight, width, plotHeight]);
      this.renderSimple(xScale, yScale);
    } else {
      //set viewbox for stacked bar plot
      this.svg.attr('viewBox', [0, 0, width, totalHeight]);
      this.renderStacked(xScale, yScale, width, marginRight);
    }
  }

  renderSimple(
    xScale: d3.ScaleBand<string>,
    yScale: d3.ScaleLinear<number, number, never>
  ) {
    //draw bars
    this.svg
      .append('g')
      .selectAll()
      .data(d3.group(this.observations, (d) => d[this.xField]))
      .join('rect')
      .attr('transform', ([xField]: any) => `translate(${xScale(xField)},0)`)
      .attr('y', (d: [x_fields, StackedBarsPlotObservationModel[]]) => {
        //for simple bar plot the mean is calculated across the xField
        const mean = d3.mean(
          d[1].map((el) => el[`mean_${this.yField}`])
        ) as number;
        return yScale(mean);
      })
      .attr('width', xScale.bandwidth() - 30)
      .attr('height', (d: [x_fields, StackedBarsPlotObservationModel[]]) => {
        const mean = d3.mean(
          d[1].map((el) => el[`mean_${this.yField}`])
        ) as number;
        return yScale(0) - yScale(mean);
      })
      .attr('fill', 'rgb(0, 207, 232)');
  }

  renderStacked(
    xScale: d3.ScaleBand<string>,
    yScale: d3.ScaleLinear<number, number, never>,
    //needed for legend
    svgWidth: number,
    marginRight: number
  ) {
    //create positional and color scale for stacked bars:
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
      .range([0, xScale.bandwidth()]);
    //create color scale for the category
    const stackedBarsColorScale = d3
      .scaleOrdinal()
      .domain(stackedBarsCategoryDomain)
      //use as many colors as needed
      .range(this.colorArray.slice(0, stackedBarsCategoryDomain.length));

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
      .attr('x', (d: StackedBarsPlotObservationModel) =>
        stackedBarsPositionalScale(d[this.stackedBarsField] as string)
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

    //draw legend
    this.drawLegend(stackedBarsColorScale, svgWidth, marginRight);
  }

  drawLegend(
    stackedBarsColorScale: d3.ScaleOrdinal<string, unknown, never>,
    svgWidth: number,
    marginRight: number
  ) {
    //draw color-legend for stackBarField category
    this.svg
      .append('g')
      .attr('class', 'legendOrdinal')
      .attr('transform', `translate(20, 30)`)
      .style('font-size', '10px');

    const cellWidth = 30;
    const legendOrdinal = legend
      .legendColor()
      .shapeWidth(cellWidth)
      .shapePadding(30)
      //@ts-ignore: library type error
      .labelWrap(30)
      .title(`Color Scale: ${this.stackedBarsField}`)
      .orient('horizontal')
      .scale(stackedBarsColorScale);

    this.svg.select('.legendOrdinal').call(legendOrdinal);

    //cell-wrapping if they exceed svg width
    d3.selectAll('#bar-plot .cell').attr('transform', (d, i, nodes) => {
      const currentTransform = d3.select(nodes[i]).attr('transform');
      //parse the current x value of this node
      const currentX = +currentTransform.split(',')[0].substring(10);
      if (currentX >= svgWidth - (marginRight + cellWidth)) {
        const newX = currentX - svgWidth + 60;
        return `translate(${newX}, 70)`;
      } else {
        return currentTransform;
      }
    });

    //Style the Title for Legend
    d3.select('.legendTitle')
      .attr('transform', 'translate(10, 0)')
      .style('font-size', '15px');
  }

  changePlotType(plotType: 'simple' | 'stacked') {
    this.plotType = plotType;
    this.renderPlot();
  }

  changeYField(yField: y_fields) {
    this.yField = yField;
    this.setObservationsAndRender();
  }

  changeStackedBarsField(stackedBarsField: stacked_bars_fields) {
    this.stackedBarsField = stackedBarsField;
    this.setObservationsAndRender();
  }
}
