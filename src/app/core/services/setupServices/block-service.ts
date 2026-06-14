import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Block } from '../../models/setups/block/block';
import { ApiResponse } from '../../models/ApiResponse.model';

@Injectable({
  providedIn: 'root',
})
export class BlockService {
  private apiUrl = `${environment.apiUrl}/BlockSetup`;

  constructor(private http: HttpClient) { }

  getAll(): Observable<ApiResponse<Block[]>> {
    return this.http.get<ApiResponse<Block[]>>(this.apiUrl);
  }

  getAllBySkuCode(skuCode: string): Observable<ApiResponse<Block[]>> {
    return this.http.get<ApiResponse<Block[]>>(`${this.apiUrl}/GetAllBySkuCode/${skuCode}`);
  }

  getById(id: string): Observable<ApiResponse<Block>> {
    return this.http.get<ApiResponse<Block>>(`${this.apiUrl}/GetById/${id}`);
  }

  create(block: Partial<Block>): Observable<ApiResponse<Block>> {
    return this.http.post<ApiResponse<Block>>(`${this.apiUrl}/Create`, block);
  }

  update(block: Block): Observable<ApiResponse<Block>> {
    return this.http.put<ApiResponse<Block>>(`${this.apiUrl}/Update`, block);
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/SoftDelete/${id}`);
  }
}