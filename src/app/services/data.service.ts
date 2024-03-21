import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { ObservationModel } from '../models/observation.model';

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
          next: (data) => (this.observations.next(data)),
          error: (err) => console.log(err),
        });
  }

  getObservations() {
    return this.observations;
  }

  getCategoryDomain(categoryName: string) {
    return this.http.get<string[]>(`${this.apiUrl}observation/${categoryName}/domain`);
  }
}
