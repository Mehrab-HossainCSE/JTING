import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../models/ApiResponse.model';
import { Area } from '../../models/setups/area/area';

@Injectable({
  providedIn: 'root',
})
export class AreaService {
  private apiUrl = `${environment.apiUrl}/Area`;
  
  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<Area[]>> {
    return this.http.get<ApiResponse<Area[]>>(this.apiUrl);
  }

  getById(id: number): Observable<ApiResponse<Area>> {
    return this.http.get<ApiResponse<Area>>(`${this.apiUrl}/${id}`);
  }

  create(area: Partial<Area>): Observable<ApiResponse<Area>> {
    return this.http.post<ApiResponse<Area>>(`${this.apiUrl}/Create`, area);
  }

  update(area: Area): Observable<ApiResponse<Area>> {
    return this.http.put<ApiResponse<Area>>(`${this.apiUrl}/Update`, area);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}