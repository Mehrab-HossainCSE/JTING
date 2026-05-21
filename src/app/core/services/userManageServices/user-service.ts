import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../models/ApiResponse.model';
import { UserManage, UpdatePasswordRequest } from '../../models/userManage/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/Users`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<UserManage[]>> {
    return this.http.get<ApiResponse<UserManage[]>>(this.apiUrl);
  }

  getAllByPage(pageNumber: number, pageSize: number): Observable<ApiResponse<UserManage[]>> {
    return this.http.get<ApiResponse<UserManage[]>>(
      `${this.apiUrl}/GetAllByPage?pageNumber=${pageNumber}&pageSize=${pageSize}`
    );
  }

  create(user: UserManage): Observable<ApiResponse<UserManage>> {
    return this.http.post<ApiResponse<UserManage>>(`${this.apiUrl}/Create`, user);
  }

  update(user: UserManage): Observable<ApiResponse<UserManage>> {
    return this.http.put<ApiResponse<UserManage>>(`${this.apiUrl}/Update`, user);
  }

  updatePassword(payload: UpdatePasswordRequest): Observable<ApiResponse<UserManage>> {
    return this.http.put<ApiResponse<UserManage>>(`${this.apiUrl}/UpdatePassword`, payload);
  }

  softDelete(id: string | number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/SoftDelete/${id}`);
  }
}
