import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Brand } from '../../models/setups/brand/brand';
import { ApiResponse } from '../../models/ApiResponse.model';

@Injectable({
  providedIn: 'root',
})
export class BrandService {
  private apiUrl = `${environment.apiUrl}/Brand`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<Brand[]>> {
    return this.http.get<ApiResponse<Brand[]>>(this.apiUrl);
  }

  getById(id: string): Observable<ApiResponse<Brand>> {
    return this.http.get<ApiResponse<Brand>>(`${this.apiUrl}/${id}`);
  }

  create(brand: Partial<Brand>): Observable<ApiResponse<Brand>> {
    return this.http.post<ApiResponse<Brand>>(`${this.apiUrl}/Create`, brand);
  }

  update(brand: Brand): Observable<ApiResponse<Brand>> {
    return this.http.put<ApiResponse<Brand>>(`${this.apiUrl}/Update`, brand);
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}