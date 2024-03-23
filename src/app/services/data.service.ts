import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
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

  getObservations() {
    return this.observations;
  }

  getStackedBarsPlotObservations(
    xField: string,
    yField: string,
    stackedBarsPlotField: string
  ) {
    const params = new HttpParams()
      .set('xField', xField)
      .set('yField', yField)
      .set('stackedBarsPlotField', stackedBarsPlotField);
    return this.http.get<StackedBarsPlotObservationModel[]>(
      `${this.apiUrl}observation/observations/stacked-bars-plot`, {params}
    );
  }
}
