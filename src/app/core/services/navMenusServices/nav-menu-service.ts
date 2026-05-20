import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { ApiResponse } from '../../models/ApiResponse.model';
import { Observable } from 'rxjs/internal/Observable';
import { NavMenu } from '../../models/navMenus/nav-menu.model';

@Injectable({
  providedIn: 'root',
})
export class NavMenuService {
  private apiUrl = `${environment.apiUrl}/NavMenus`;

  constructor(private http: HttpClient) {}

  getMenuItems(): Observable<ApiResponse<NavMenu[]>> {
    return this.http.get<ApiResponse<NavMenu[]>>(`${this.apiUrl}`);
  }

  getChildrenMenuItems(): Observable<ApiResponse<NavMenu[]>> {
    return this.http.get<ApiResponse<NavMenu[]>>(`${this.apiUrl}/all-with-children`);
  }

  getNavMenusByUserName(userName: string): Observable<ApiResponse<NavMenu[]>> {
    return this.http.get<ApiResponse<NavMenu[]>>(`${this.apiUrl}/children/username/${encodeURIComponent(userName)}`);
  }

  getNavMenusByRoleId(roleId: string): Observable<ApiResponse<NavMenu[]>> {
    return this.http.get<ApiResponse<NavMenu[]>>(`${this.apiUrl}/roleId?roleId=${roleId}`);
  }

  create(menu: NavMenu): Observable<ApiResponse<NavMenu>> {
    return this.http.post<ApiResponse<NavMenu>>(`${this.apiUrl}/navmenupermission`, menu);
  }
}


