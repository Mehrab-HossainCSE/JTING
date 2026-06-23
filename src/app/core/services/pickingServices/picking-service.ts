import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../models/ApiResponse.model';
import {
  PickingItem,
  GeneratePickingRequest,
  CompletePickingRequest,
  SavePickingRequest,
  ValidateManualLocationRequest,
} from '../../models/picking/picking';

@Injectable({
  providedIn: 'root',
})
export class PickingService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Picking`;

  getCurrentStock(skuCode: string, settingQty: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/CurrentStock`, {
      params: { skuCode, settingQty },
    });
  }

  generate(payload: GeneratePickingRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/Generate`, payload);
  }

  getTempProgress(pickingNo: string): Observable<ApiResponse<PickingItem[]>> {
    return this.http.get<ApiResponse<PickingItem[]>>(`${this.apiUrl}/TempProgress`, {
      params: { pickingNo },
    });
  }

  complete(payload: CompletePickingRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/Complete`, payload);
  }

  deleteProgress(pickingNo: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/Progress/${pickingNo}`);
  }

  getCompleteList(fromDate: string, toDate: string): Observable<ApiResponse<PickingItem[]>> {
    return this.http.get<ApiResponse<PickingItem[]>>(`${this.apiUrl}/CompleteList`, {
      params: { fromDate, toDate },
    });
  }

  getDetails(pickingNo: string): Observable<ApiResponse<PickingItem[]>> {
    return this.http.get<ApiResponse<PickingItem[]>>(`${this.apiUrl}/Details/${pickingNo}`);
  }

  save(payload: SavePickingRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/Save`, payload);
  }

  validateManualLocation(payload: ValidateManualLocationRequest): Observable<ApiResponse<PickingItem[]>> {
    return this.http.post<ApiResponse<PickingItem[]>>(`${this.apiUrl}/ValidateManualLocation`, payload);
  }
}
