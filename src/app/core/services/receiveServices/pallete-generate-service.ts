import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PalleteGenerateService {
  private apiUrl = `${environment.apiUrl}/ArchSetup`;
    constructor(private http: HttpClient) {}


  getPalletGenerateList(): Observable<any> {
    return this.http.get(`${this.apiUrl}/pallet/generate-list`);
  }
  generatePallet(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/pallet/generate`, payload);
  }
  searchPalletRecords(query: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/pallet/records`, { params: { search: query } });
  }
  deletePalletRecord(palletNo: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/pallet/records/${palletNo}`);
  }
}
