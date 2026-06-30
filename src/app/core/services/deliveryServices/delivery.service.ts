import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../models/ApiResponse.model';
import {
  DeliveryMasterData,
  DeliveryTempItem,
  ScanBarcodeRequest,
  UpdateQtyRequest,
  UpdateRemarksRequest,
  SaveDeliveryRequest,
} from '../../models/delivery/delivery.model';

@Injectable({
  providedIn: 'root',
})
export class DeliveryService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Delivery`;

  getMasterData(search?: string): Observable<ApiResponse<DeliveryMasterData[]>> {
    const params: Record<string, string> = {};
    if (search) params['search'] = search;
    return this.http.get<ApiResponse<DeliveryMasterData[]>>(`${this.apiUrl}/MasterData`, { params });
  }

  getTempProgress(settingQty: number, settingText: string): Observable<ApiResponse<DeliveryTempItem[]>> {
    return this.http.get<ApiResponse<DeliveryTempItem[]>>(`${this.apiUrl}/TempProgress`, {
      params: { settingQty: settingQty.toString(), settingText },
    });
  }

  scan(payload: ScanBarcodeRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/Scan`, payload);
  }

  updateQty(payload: UpdateQtyRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/UpdateQty`, payload);
  }

  updateRemarks(payload: UpdateRemarksRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/UpdateRemarks`, payload);
  }

  deleteTemp(barcode: string, settingQty: number, settingText: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/DeleteTemp`, {
      params: { barcode, settingQty: settingQty.toString(), settingText },
    });
  }

  save(payload: SaveDeliveryRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/Save`, payload);
  }
}
