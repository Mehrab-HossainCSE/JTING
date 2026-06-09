import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Box } from '../../models/setups/box/box';
import { ApiResponse } from '../../models/ApiResponse.model';
import { BossAssaign } from '../../models/setups/box/boss-assaign';

@Injectable({
  providedIn: 'root',
})
export class BoxService {
  private apiUrl = `${environment.apiUrl}/BoxSetup`;

  constructor(private http: HttpClient) { }

  getAll(): Observable<ApiResponse<Box[]>> {
    return this.http.get<ApiResponse<Box[]>>(this.apiUrl);
  }

  getById(id: string): Observable<ApiResponse<Box>> {
    return this.http.get<ApiResponse<Box>>(`${this.apiUrl}/GetById/${id}`);
  }

  getSplitBoxByLineId(lineId: string): Observable<ApiResponse<Box[]>> {
    return this.http.get<ApiResponse<Box[]>>(`${this.apiUrl}/GetSplitBoxByLineId/${lineId}`);
  }

  getByLineId(lineId: string): Observable<ApiResponse<Box[]>> {
    return this.http.get<ApiResponse<Box[]>>(`${this.apiUrl}/GetByLineId/${lineId}`);
  }

  create(box: Partial<Box>): Observable<ApiResponse<Box>> {
    return this.http.post<ApiResponse<Box>>(`${this.apiUrl}/Create`, box);
  }

  update(box: Box): Observable<ApiResponse<Box>> {
    return this.http.put<ApiResponse<Box>>(`${this.apiUrl}/Update`, box);
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/SoftDelete/${id}`);
  }

  isAssignedBox(boxId: string): Observable<ApiResponse<Box>> {
    return this.http.get<ApiResponse<Box>>(`${this.apiUrl}/IsAssignedBox/${boxId}`);
  }

  resetLayout(boxId: string): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${this.apiUrl}/ResetLayout`, { boxId });
  }

  checkValidControl(controlName: string): Observable<ApiResponse<boolean>> {
    return this.http.get<ApiResponse<boolean>>(`${this.apiUrl}/CheckValidControl/${controlName}`);
  }

  assignLayout(payload: BossAssaign): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${this.apiUrl}/Assign`, payload);
  }
}
