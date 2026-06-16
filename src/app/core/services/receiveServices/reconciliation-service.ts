import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../models/ApiResponse.model';
import {
  LocalReconciliationRequest,
  ReceiveReconciliationRequest,
  DeliveryReconciliationRequest,
  HundredPercentReconciliationRequest,
  PickingReconciliationRequest
} from '../../models/receives/reconciliation/reconciliation';

@Injectable({
  providedIn: 'root',
})
export class ReconciliationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Reconciliation`;

  /**
   * Uploads file for Receive Reconciliation
   */
  receiveExcelFileReader(file: File, unit: string, isShiftWise: boolean, fromDate: string, toDate: string): Observable<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('unit', unit);
    formData.append('isShiftWise', String(isShiftWise));
    formData.append('fromDate', fromDate);
    formData.append('toDate', toDate);
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/ReceiveExcellFileReader`, formData);
  }

  /**
   * Uploads file for Delivery Reconciliation
   */
  deliveryExcelFileReader(file: File, unit: string, fromDate: string, toDate: string): Observable<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('unit', unit);
    formData.append('fromDate', fromDate);
    formData.append('toDate', toDate);
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/DeliveryExcellFileReader`, formData);
  }

  /**
   * Uploads file for Picking Reconciliation
   */
  pickingExcelFileReader(file: File, unit: string, fromDate: string, toDate: string): Observable<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('unit', unit);
    formData.append('fromDate', fromDate);
    formData.append('toDate', toDate);
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/PickingExcellFileReader`, formData);
  }

  /**
   * Uploads file for 100% Counting Reconciliation
   */
  hundredPercentExcelFileReader(file: File, unit: string, fromDate: string, toDate: string): Observable<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('unit', unit);
    formData.append('fromDate', fromDate);
    formData.append('toDate', toDate);
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/100PercentExcellFileReader`, formData);
  }

  /**
   * Fetches local data for Receive Reconciliation
   */
  getLocalReceiveData(payload: LocalReconciliationRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/GetLocalReceiveData`, payload);
  }

  /**
   * Fetches local data for Delivery Reconciliation
   */
  getLocalDeliveryData(payload: LocalReconciliationRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/GetLocalDeliveryData`, payload);
  }

  /**
   * Fetches local data for Picking Reconciliation
   */
  getLocalPickingData(payload: LocalReconciliationRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/GetLocalPickingData`, payload);
  }

  /**
   * Fetches local data for 100% Counting Reconciliation
   */
  getLocal100PercentData(payload: LocalReconciliationRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/GetLocal100percentData`, payload);
  }

  /**
   * Save Receive Reconciliation
   */
  receiveReconciliation(payload: ReceiveReconciliationRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/ReceiveReconciliation`, payload);
  }

  /**
   * Save Delivery Reconciliation
   */
  deliveryReconciliation(payload: DeliveryReconciliationRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/DeliveryReconciliation`, payload);
  }

  /**
   * Save 100% Counting Reconciliation
   */
  hundredPercentReconciliation(payload: HundredPercentReconciliationRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/HundredPercentReconciliation`, payload);
  }

  /**
   * Save Picking Reconciliation
   */
  pickingReconciliation(payload: PickingReconciliationRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/PickingReconciliation`, payload);
  }
}
