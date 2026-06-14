import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Line } from '../../models/setups/line/line';
import { ApiResponse } from '../../models/ApiResponse.model';

@Injectable({
  providedIn: 'root',
})
export class LineService {
  private apiUrl = `${environment.apiUrl}/LineSetup`;

  constructor(private http: HttpClient) { }

  getAll(): Observable<ApiResponse<Line[]>> {
    return this.http.get<ApiResponse<Line[]>>(this.apiUrl);
  }

  getAllByArch(archId: string): Observable<ApiResponse<Line[]>> {
    return this.http.get<ApiResponse<Line[]>>(`${this.apiUrl}/GetAllByArch/${archId}`);
  }

  getById(id: string): Observable<ApiResponse<Line>> {
    return this.http.get<ApiResponse<Line>>(`${this.apiUrl}/GetById/${id}`);
  }

  getByAreaId(areaId: number): Observable<ApiResponse<Line[]>> {
    return this.http.get<ApiResponse<Line[]>>(`${this.apiUrl}/GetByAreaId/${areaId}`);
  }

  getByArchId(archId: string): Observable<ApiResponse<Line[]>> {
    return this.http.get<ApiResponse<Line[]>>(`${this.apiUrl}/GetByArchId/${archId}`);
  }

  create(line: Partial<Line>): Observable<ApiResponse<Line>> {
    return this.http.post<ApiResponse<Line>>(`${this.apiUrl}/Create`, line);
  }

  update(line: Line): Observable<ApiResponse<Line>> {
    return this.http.put<ApiResponse<Line>>(`${this.apiUrl}/Update`, line);
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/SoftDelete/${id}`);
  }
}