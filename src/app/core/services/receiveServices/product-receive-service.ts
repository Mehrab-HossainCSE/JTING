import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../models/ApiResponse.model';
import { ProductReceiveItem, PalletReceiveItem } from '../../models/receives/product-receive/product-receive';

@Injectable({
  providedIn: 'root',
})
export class ProductReceiveService {
  private http = inject(HttpClient);

  barcodeScan(barcode: string): Observable<ApiResponse<ProductReceiveItem>> {
    return this.http.get<ApiResponse<ProductReceiveItem>>(`${environment.apiUrl}/ProductReceive/BarcodeScan/${barcode}`);
  }

  getPalletsByCurrentDate(): Observable<ApiResponse<PalletReceiveItem[]>> {
    return this.http.get<ApiResponse<PalletReceiveItem[]>>(`${environment.apiUrl}/ProductReceive/GetPalletstByCurrentDate`);
  }

  barcodeScanManual(barcode: string): Observable<ApiResponse<ProductReceiveItem>> {
    return this.http.get<ApiResponse<ProductReceiveItem>>(`${environment.apiUrl}/ProductReceive/BarcodeScanManual/${barcode}`);
  }
}
