import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../models/ApiResponse.model';

@Injectable({
  providedIn: 'root',
})
export class QuarantineService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Quarantine`;


  //http://192.168.0.132:8082/api/Quarantine/GetAllBySkuCode/15108001
  getAllBySkuCode(skuCode: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/GetAllBySkuCode/${skuCode}`);
  }


  getSkuAndLineWiseLocation(lineId: string, skuCode: string, qurantineNo: string): Observable<ApiResponse<any>> {
    const params = new HttpParams()
      .set('LineId', lineId)
      .set('Skucode', skuCode)
      .set('qurantineNo', qurantineNo);
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/GetSkuAndLineWiseLocation`, { params });
  }

  setLocationQuarantine(payload: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/SetLocationQuarantine`, payload);
  }

  getQuarantineByDate(dateFrom: string, dateTo: string): Observable<ApiResponse<any>> {
    const params = new HttpParams()
      .set('dateFrom', dateFrom)
      .set('dateTo', dateTo);
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/GetQuarantineByDate`, { params });
  }

  getQuarantineDetailsData(quarantineNo: string): Observable<ApiResponse<any>> {
    const params = new HttpParams()
      .set('quarantineNo', quarantineNo);
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/GetQuarantineDetailsData`, { params });
  }
}
