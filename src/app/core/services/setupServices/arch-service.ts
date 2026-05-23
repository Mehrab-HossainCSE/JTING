import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Arch } from '../../models/setups/arch/arch';
import { ApiResponse } from '../../models/ApiResponse.model';

@Injectable({
  providedIn: 'root',
})
export class ArchService {
  private apiUrl = `${environment.apiUrl}/ArchSetup`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<Arch[]>> {
    return this.http.get<ApiResponse<Arch[]>>(this.apiUrl);
  }

  getById(id: string): Observable<ApiResponse<Arch>> {
    return this.http.get<ApiResponse<Arch>>(`${this.apiUrl}/GetById/${id}`);
  }

  getByBlockId(blockId: string): Observable<ApiResponse<Arch[]>> {
    return this.http.get<ApiResponse<Arch[]>>(`${this.apiUrl}/GetByBlockId/${blockId}`);
  }

  create(arch: Partial<Arch>): Observable<ApiResponse<Arch>> {
    return this.http.post<ApiResponse<Arch>>(`${this.apiUrl}/Create`, arch);
  }

  update(arch: Arch): Observable<ApiResponse<Arch>> {
    return this.http.put<ApiResponse<Arch>>(`${this.apiUrl}/Update`, arch);
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/SoftDelete/${id}`);
  }
}
