import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../models/ApiResponse.model';
import { SplitItem, PalletQtyAndDate, PalletPickingSku, SplitPalletPayload } from '../../models/receives/split-pallet/split-pallet';

@Injectable({
  providedIn: 'root',
})
export class PalletSplit {
  private http = inject(HttpClient);

  getSplitDataByBoxId(boxId: string): Observable<ApiResponse<SplitItem[]>> {
    return this.http.get<ApiResponse<SplitItem[]>>(`${environment.apiUrl}/PalletSplit/GetSplitDataByBoxId/${boxId}`);
  }

  getQtyAndDateByPalletNo(palletNo: string): Observable<ApiResponse<PalletQtyAndDate[]>> {
    return this.http.get<ApiResponse<PalletQtyAndDate[]>>(`${environment.apiUrl}/PalletSplit/GetQtyAndDateByPalletNo/${palletNo}`);
  }

  getPalletNoFromPickingBySku(skuCode: string): Observable<ApiResponse<PalletPickingSku[]>> {
    return this.http.get<ApiResponse<PalletPickingSku[]>>(`${environment.apiUrl}/PalletSplit/GetPalletNoFromPickingBySku/${skuCode}`);
  }

  getSplitDataByPalletNo(palletNo: string): Observable<ApiResponse<SplitItem[]>> {
    return this.http.get<ApiResponse<SplitItem[]>>(`${environment.apiUrl}/PalletSplit/GetSplitDataByPalletNo/${palletNo}`);
  }

  splitPallet(payload: SplitPalletPayload): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${environment.apiUrl}/PalletSplit/SplitPallet`, payload);
  }
}
