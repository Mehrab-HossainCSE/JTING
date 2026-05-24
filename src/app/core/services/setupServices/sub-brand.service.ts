import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../models/ApiResponse.model';
import { SubBrand } from '../../models/setups/subBrand/sub-brand';

@Injectable({
  providedIn: 'root',
})
export class SubBrandService {
  private apiUrl = `${environment.apiUrl}/SubBrands`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<SubBrand[]>> {
    return this.http.get<ApiResponse<SubBrand[]>>(this.apiUrl);
  }

  getById(id: string): Observable<ApiResponse<SubBrand>> {
    return this.http.get<ApiResponse<SubBrand>>(`${this.apiUrl}/${id}`);
  }

  create(subBrand: Partial<SubBrand>): Observable<ApiResponse<SubBrand>> {
    return this.http.post<ApiResponse<SubBrand>>(`${this.apiUrl}/Create`, subBrand);
  }

  update(subBrand: SubBrand): Observable<ApiResponse<SubBrand>> {
    return this.http.put<ApiResponse<SubBrand>>(`${this.apiUrl}/Update`, subBrand);
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}