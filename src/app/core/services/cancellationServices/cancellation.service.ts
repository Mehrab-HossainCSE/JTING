import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../models/ApiResponse.model';
import {
  ReceiveCancellationSaveRequest,
  ListDataForLocationRequest,
  DeliveryCancellationSaveRequest,
  SkuCancelDetailsResponse,
} from '../../models/cancellation/cancellation.model';

@Injectable({
  providedIn: 'root',
})
export class CancellationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Cancellation`;

  getSkuCancelDetails(skuCode: string): Observable<ApiResponse<SkuCancelDetailsResponse>> {
    return this.http.get<ApiResponse<SkuCancelDetailsResponse>>(`${this.apiUrl}/SkuCancelDetails`, {
      params: { skuCode },
    });
  }

  getReceiveBoxDetails(boxName: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/ReceiveBoxDetails`, {
      params: { boxName },
    });
  }

  getReceivePalletDetails(palletNo: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/ReceivePalletDetails`, {
      params: { palletNo },
    });
  }

  saveReceiveCancellation(payload: ReceiveCancellationSaveRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/ReceiveSave`, payload);
  }

  getDatewiseCancelList(dateFrom: string, dateTo: string, type: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/DatewiseCancelList`, {
      params: { dateFrom, dateTo, type },
    });
  }

  getChallanNoDatewise(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/ChallanNoDatewise`);
  }

  getChallanDetails(challanNo: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/ChallanDetails`, {
      params: { challanNo },
    });
  }

  getChallanSkuDetails(skuCode: string, challanNo: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/ChallanSkuDetails`, {
      params: { skuCode, challanNo },
    });
  }

  getDataForLocation(payload: ListDataForLocationRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/DataForLocation`, payload);
  }

  saveDeliveryCancellation(payload: DeliveryCancellationSaveRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/DeliverySave`, payload);
  }
}
