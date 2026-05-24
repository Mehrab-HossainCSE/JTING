import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../models/ApiResponse.model';
import { Driver } from '../../models/setups/driver/driver';

@Injectable({
  providedIn: 'root',
})
export class DriverService {
  private apiUrl = `${environment.apiUrl}/Drivers`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<Driver[]>> {
    return this.http.get<ApiResponse<Driver[]>>(this.apiUrl);
  }

  getById(id: string): Observable<ApiResponse<Driver>> {
    return this.http.get<ApiResponse<Driver>>(`${this.apiUrl}/${id}`);
  }

  create(driver: Partial<Driver>): Observable<ApiResponse<Driver>> {
    return this.http.post<ApiResponse<Driver>>(`${this.apiUrl}/Create`, driver);
  }

  update(driver: Driver): Observable<ApiResponse<Driver>> {
    return this.http.put<ApiResponse<Driver>>(`${this.apiUrl}/Update`, driver);
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}