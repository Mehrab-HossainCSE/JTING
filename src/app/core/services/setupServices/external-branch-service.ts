import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../models/ApiResponse.model';
import { ExternalBrand } from '../../models/setups/extarnalBrand/external-brand';

@Injectable({
  providedIn: 'root',
})
export class ExternalBranchService {
  private apiUrl = `${environment.apiUrl}/BrandsExternal`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<ExternalBrand[]>> {
    return this.http.get<ApiResponse<ExternalBrand[]>>(this.apiUrl);
  }

  getById(id: string): Observable<ApiResponse<ExternalBrand>> {
    return this.http.get<ApiResponse<ExternalBrand>>(`${this.apiUrl}/${id}`);
  }

  create(externalBrand: Partial<ExternalBrand>): Observable<ApiResponse<ExternalBrand>> {
    return this.http.post<ApiResponse<ExternalBrand>>(`${this.apiUrl}/Create`, externalBrand);
  }

  update(externalBrand: ExternalBrand): Observable<ApiResponse<ExternalBrand>> {
    return this.http.put<ApiResponse<ExternalBrand>>(`${this.apiUrl}/Update`, externalBrand);
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}
