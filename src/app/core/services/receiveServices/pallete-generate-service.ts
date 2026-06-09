import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../models/ApiResponse.model';
import { PalletGenerateItem, PalletRecord, PalletGenerateCreatePayload } from '../../models/receives/generate-pallet/generate-pallet';

@Injectable({
  providedIn: 'root',
})
export class PalleteGenerateService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/ArchSetup`;

  getPalletGenerateList(): Observable<ApiResponse<PalletGenerateItem[]>> {
    return this.http.get<ApiResponse<PalletGenerateItem[]>>(`${environment.apiUrl}/PalletGenerate/GetMasterCaseForPallet`);
  }

  generatePallet(payload: PalletGenerateCreatePayload): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${environment.apiUrl}/PalletGenerate/Create`, payload);
  }

  searchPalletRecords(query: string, withDate: boolean, fromDate?: string, toDate?: string): Observable<ApiResponse<PalletRecord[]>> {
    const params: any = {
      search: query,
      withDate: withDate
    };
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;
    return this.http.get<ApiResponse<PalletRecord[]>>(`${environment.apiUrl}/PalletGenerate/GetPalletListBySearchData`, { params });
  }

  deletePalletRecord(palletNo: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/pallet/records/${palletNo}`);
  }

  printPallet(palletNo: string): Observable<Blob> {
    return this.http.get(`${environment.apiUrl}/Report/Print-Pallet`, {
      params: { palletNo },
      responseType: 'blob',
    });
  }

  reprintPallet(palletNo: string): Observable<Blob> {
    return this.http.get(`${environment.apiUrl}/Report/Reprint-Pallet`, {
      params: { palletNo },
      responseType: 'blob',
    });
  }
}

