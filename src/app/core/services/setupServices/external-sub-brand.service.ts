import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../models/ApiResponse.model';
import { ExternalSubBrand } from '../../models/setups/externalSubBrand/external-sub-brand';

@Injectable({
  providedIn: 'root',
})
export class ExternalSubBrandService {
  private apiUrl = `${environment.apiUrl}/SubBrandsExternal`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<ExternalSubBrand[]>> {
    return this.http.get<ApiResponse<ExternalSubBrand[]>>(this.apiUrl);
  }

  getById(id: number): Observable<ApiResponse<ExternalSubBrand>> {
    return this.http.get<ApiResponse<ExternalSubBrand>>(`${this.apiUrl}/${id}`);
  }

  create(payload: Partial<ExternalSubBrand>): Observable<ApiResponse<ExternalSubBrand>> {
    return this.http.post<ApiResponse<ExternalSubBrand>>(`${this.apiUrl}/Create`, payload);
  }

  update(payload: ExternalSubBrand): Observable<ApiResponse<ExternalSubBrand>> {
    return this.http.put<ApiResponse<ExternalSubBrand>>(`${this.apiUrl}/Update`, payload);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}