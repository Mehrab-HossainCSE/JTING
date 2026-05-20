import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Shift } from '../../models/setups/shift/shift';
import { ApiResponse } from '../../models/ApiResponse.model';

@Injectable({
  providedIn: 'root',
})
export class ShiftService {
  private apiUrl = `${environment.apiUrl}/Shift`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<Shift[]>> {
    return this.http.get<ApiResponse<Shift[]>>(this.apiUrl);
  }

  getById(id: string): Observable<ApiResponse<Shift>> {
    return this.http.get<ApiResponse<Shift>>(`${this.apiUrl}/GetById/${id}`);
  }

  create(shift: any): Observable<ApiResponse<Shift>> {
    return this.http.post<ApiResponse<Shift>>(`${this.apiUrl}/Create`, shift);
  }

  update(shift: Shift): Observable<ApiResponse<Shift>> {
    return this.http.put<ApiResponse<Shift>>(`${this.apiUrl}/Update`, shift);
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}