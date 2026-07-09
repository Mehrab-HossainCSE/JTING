import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../models/ApiResponse.model';
import {
  DeliveryTempProgress,
  ScanBarcodeRequest,
  UpdateQtyRequest,
  UpdateRemarksRequest,
  SaveDeliveryRequest,
  ScanBarcodeResponse,
} from '../../models/delivery/delivery.model';

@Injectable({
  providedIn: 'root',
})
export class DeliveryService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Delivery`;

  getTempProgress(settingQty: number, settingText: string): Observable<ApiResponse<DeliveryTempProgress>> {
    return this.http.get<ApiResponse<DeliveryTempProgress>>(`${this.apiUrl}/TempProgress`, {
      params: { settingQty: settingQty, settingText },
    });
  }

  scan(payload: ScanBarcodeRequest): Observable<ApiResponse<ScanBarcodeResponse>> {
    return this.http.post<ApiResponse<ScanBarcodeResponse>>(`${this.apiUrl}/Scan`, payload);
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
