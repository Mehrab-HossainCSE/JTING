import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { ApiResponse } from '../../models/ApiResponse.model';
import { Observable } from 'rxjs';
import { Destination } from '../../models/setups/destination/destination';

@Injectable({
  providedIn: 'root',
})
export class DestinationService {
    private apiUrl = `${environment.apiUrl}/Destination`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<Destination[]>> {
    debugger;
    return this.http.get<ApiResponse<Destination[]>>(this.apiUrl);
  }

  getById(id: string): Observable<ApiResponse<Destination>> {
    return this.http.get<ApiResponse<Destination>>(`${this.apiUrl}/GetById/${id}`);
  }

  create(user: Destination): Observable<ApiResponse<Destination>> {
    return this.http.post<ApiResponse<Destination>>(`${this.apiUrl}/Create`, user);
  }

  update(user: Destination): Observable<ApiResponse<Destination>> {
    return this.http.put<ApiResponse<Destination>>(`${this.apiUrl}/Update`, user);
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/SoftDelete/${id}`);
  }
}
