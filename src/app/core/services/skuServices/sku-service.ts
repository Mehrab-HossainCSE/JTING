import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Sku } from '../../models/setups/sku/sku';
import { ApiResponse } from '../../models/ApiResponse.model';

@Injectable({
  providedIn: 'root',
})
export class SkuService {
  private apiUrl = `${environment.apiUrl}/SkuSetup`;

  constructor(private http: HttpClient) { }

  getAll(): Observable<ApiResponse<Sku[]>> {
    return this.http.get<ApiResponse<Sku[]>>(this.apiUrl);
  }

  getSKUWithOutESL(): Observable<ApiResponse<Sku[]>> {
    return this.http.get<ApiResponse<Sku[]>>(`${this.apiUrl}/GetSKUWithOutESL`);
  }

  getById(id: string): Observable<ApiResponse<Sku>> {
    return this.http.get<ApiResponse<Sku>>(`${this.apiUrl}/GetById/${id}`);
  }

  create(sku: Partial<Sku>): Observable<ApiResponse<Sku>> {
    return this.http.post<ApiResponse<Sku>>(`${this.apiUrl}/Create`, sku);
  }

  update(sku: Sku): Observable<ApiResponse<Sku>> {
    return this.http.put<ApiResponse<Sku>>(`${this.apiUrl}/Update`, sku);
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/SoftDelete/${id}`);
  }
}