import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../models/ApiResponse.model';
import {
  TransferRestoreItem,
  SaveTransferRequest,
  SaveRestoreRequest
} from '../../models/picking/transfer-restore';

@Injectable({
  providedIn: 'root',
})
export class TransferRestoreService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/TransferRestore`;

  getSourceLocations(lineId: number, archId: number, transferNo: string): Observable<ApiResponse<TransferRestoreItem[]>> {
    return this.http.get<ApiResponse<TransferRestoreItem[]>>(`${this.apiUrl}/SourceLocations`, {
      params: { lineId: lineId.toString(), archId: archId.toString(), transferNo },
    });
  }

  getDestinationLocations(lineId: number, archId: number, transferNo: string): Observable<ApiResponse<TransferRestoreItem[]>> {
    return this.http.get<ApiResponse<TransferRestoreItem[]>>(`${this.apiUrl}/DestinationLocations`, {
      params: { lineId: lineId.toString(), archId: archId.toString(), transferNo },
    });
  }

  getRestoreDestinationLocations(lineId: number, archId: number, skuCode: string, rstoreNo: string): Observable<ApiResponse<TransferRestoreItem[]>> {
    return this.http.get<ApiResponse<TransferRestoreItem[]>>(`${this.apiUrl}/RestoreDestinationLocations`, {
      params: { lineId: lineId.toString(), archId: archId.toString(), skuCode: skuCode.toString(), rstoreNo: rstoreNo.toString() },
    });
  }

  getPickingSkuBatches(skuCode: string): Observable<ApiResponse<TransferRestoreItem[]>> {
    return this.http.get<ApiResponse<TransferRestoreItem[]>>(`${this.apiUrl}/PickingSkuBatches/${skuCode}`);
  }

  getPickingSkuPallets(skuId: string, reStoreNo: string, batch: string): Observable<ApiResponse<TransferRestoreItem[]>> {
    return this.http.get<ApiResponse<TransferRestoreItem[]>>(`${this.apiUrl}/PickingSkuPallets`, {
      params: { skuId: skuId.toString(), reStoreNo: reStoreNo.toString(), batch: batch.toString() },
    });
  }

  getProgressList(fromDate: string, toDate: string, type: string | number): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/ProgressList`, {
      params: { fromDate, toDate, type: type.toString() },
    });
  }

  getDetails(id: string | number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/Details/${id}`);
  }

  getTransferNo(type: string | number): Observable<ApiResponse<string>> {
    return this.http.get<ApiResponse<string>>(`${this.apiUrl}/TransferNo`, {
      params: { type: type.toString() },
    });
  }

  saveTransfer(payload: SaveTransferRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/SaveTransfer`, payload);
  }

  saveRestore(payload: SaveRestoreRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/SaveRestore`, payload);
  }

  complete(id: string | number): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/Complete/${id}`, {});
  }

  deleteTransferRestore(id: string | number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/DeleteTransfer/${id}`, {});
  }

  getProgress(id: string | number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/Progress/${id}`);
  }
}
