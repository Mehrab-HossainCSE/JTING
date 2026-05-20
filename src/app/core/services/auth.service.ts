import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { LoginData, LoginRequest, LoginResponse } from '../models/auth.model';
import { environment } from '../../../environments/environment.development';
import { MenuService } from './menu.service';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private menuService = inject(MenuService);
  private storageService = inject(StorageService);

  private readonly API_URL = environment.apiUrl;
  private _isLoggedIn = signal(false);
  readonly isLoggedIn = this._isLoggedIn.asReadonly();

  login(payload: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/Account/login`, payload).pipe(
      tap((res) => {
        if (res.success && res.data) {
          this.storageService.setAngularItem('token', res.data.token);
          this.storageService.setAngularItem('userName', res.data.name);
          this.storageService.setAngularItem('refreshToken', res.data.refreshToken);
          this.storageService.setAngularItem('userInfo', res.data);
          this._isLoggedIn.set(true);
        }
      }),
      catchError((err) => {
        this._isLoggedIn.set(false);
        this.storageService.removeItem('token');
        this.storageService.removeItem('userName');
        this.storageService.removeItem('refreshToken');
        this.storageService.removeItem('userInfo');
        return throwError(() => err);
      }),
    );
  }

  logout(): void {
    this.storageService.removeItem('token');
    this.storageService.removeItem('userName');
    this.storageService.removeItem('refreshToken');
    this.storageService.removeItem('userInfo');
    this.storageService.removeItem('menus');
    this._isLoggedIn.set(false);
    this.menuService.clearMenus();
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this.storageService.getAngularItem<string>('token');
  }

  checkAuth(): boolean {
    return !!this.getToken();
  }

  getLocalStorageUserName(): string | null {
    const userName = this.storageService.getAngularItem<string>('userName');
    return userName?.trim() ? userName.trim() : null;
  }

  getUserInfo(): LoginData | null {
    return this.storageService.getAngularItem<LoginData>('userInfo');
  }
}
