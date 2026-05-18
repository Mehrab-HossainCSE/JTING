import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError, switchMap } from 'rxjs';
import { LoginRequest, LoginResponse } from '../models/auth.model';
import { environment } from '../../../environments/environment.development';
import { MenuService } from './menu.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly API_URL = environment.apiUrl; // ← change this
  private menuService = inject(MenuService);
  private _isLoggedIn = signal(false);
  readonly isLoggedIn = this._isLoggedIn.asReadonly();

  login(payload: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/Account/login`, payload).pipe(
      tap((res) => {
        if (res.success && res.data) {
          localStorage.setItem('token', res.data.token);

          localStorage.setItem('userName', res.data.name);

          localStorage.setItem('refreshToken', res.data.refreshToken);

          this._isLoggedIn.set(true);
        }
      }),

      catchError((err) => {
        this._isLoggedIn.set(false);

        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        localStorage.removeItem('refreshToken');

        return throwError(() => err);
      }),
    );
  }
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    this._isLoggedIn.set(false);
    this.menuService.clearMenus(); // ← clear menus on logout
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  checkAuth(): boolean {
    
    return !!this.getToken();
  }
  getLocalStorageUserName(): string | null {
  const userName = localStorage.getItem('userName');

  return userName?.trim() ? userName.trim() : null;
}
}
