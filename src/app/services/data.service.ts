import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { ObservationModel } from '../models/observation.model';
import { StackedBarsPlotObservationModel } from '../models/stacked-bars-plot-observation.model';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private apiUrl = environment.apiUrl;
  private observations = new BehaviorSubject<ObservationModel[]>([]);

  constructor(private http: HttpClient) {
    this.http
      .get<ObservationModel[]>(`${this.apiUrl}observation/observations`)
      .subscribe({
        next: (data) => this.observations.next(data),
        error: (err) => console.log(err),
      });
  }

  //get all observations
  getObservations() {
    return this.observations;
  }

  //get all observations in a specific format for the stackedBarPlot
  getStackedBarsPlotObservations(
    xField: string,
    yField: string,
    stackedBarsField: string
  ) {
    const params = new HttpParams()
      .set('xField', xField)
      .set('yField', yField)
      .set('stackedBarsField', stackedBarsField);
    return this.http.get<StackedBarsPlotObservationModel[]>(
      `${this.apiUrl}observation/observations/stacked-bars-plot`, {params}
    );
  }

  //get an array of 30 different color needed for some plots
  //gets a hex file from angular server and parses it
  getColorArray() {
    return this.http.get("/assets/30-color.hex", {responseType: "text"}).pipe(map((hexFile: string)=>{
      const colorArray = hexFile.split("\n").map(color => "#"+color.replaceAll('\r', ''));
      return colorArray;
    }))
  }

  //gets all possible values for a certain category like how many different countries are there
  getCategoryDomain(category: string) {
    return this.http.get<string[]>(`${this.apiUrl}observation/get-category-domain/${category}`);
  }
}
