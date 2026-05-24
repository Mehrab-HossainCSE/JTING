import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../models/ApiResponse.model';
import { Truck } from '../../models/setups/truck/truck';

@Injectable({
  providedIn: 'root',
})
export class TruckService {
  private apiUrl = `${environment.apiUrl}/Tracks`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<Truck[]>> {
    return this.http.get<ApiResponse<Truck[]>>(this.apiUrl);
  }

  getById(id: string): Observable<ApiResponse<Truck>> {
    return this.http.get<ApiResponse<Truck>>(`${this.apiUrl}/${id}`);
  }

  create(truck: Partial<Truck>): Observable<ApiResponse<Truck>> {
    return this.http.post<ApiResponse<Truck>>(`${this.apiUrl}/Create`, truck);
  }

  update(truck: Truck): Observable<ApiResponse<Truck>> {
    return this.http.put<ApiResponse<Truck>>(`${this.apiUrl}/Update`, truck);
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}
