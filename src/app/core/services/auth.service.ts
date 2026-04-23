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

  private readonly API_URL = environment.apiUrl; ; // ← change this
  private menuService = inject(MenuService); 
  private _isLoggedIn = signal(false);
  readonly isLoggedIn = this._isLoggedIn.asReadonly();

    login(payload: LoginRequest): Observable<any> {
    return this.http.post<LoginResponse>(`${this.API_URL}/Account/login`, payload).pipe(
      // --- A. Handle Success ---
      tap((res) => {
        // Store the token
        if (res.token) {
          localStorage.setItem('token', res.token);
        }

        // Store the user name (using 'name' from JSON)
        if (res.name) {
          localStorage.setItem('userName', res.name);
        }

        // Optional: Store refresh token if you need it later
        // localStorage.setItem('refreshToken', res.refreshToken);

        this._isLoggedIn.set(true);
      }),

      // --- B. Load Menus ---
      // Wait for login to finish, then load menus
      switchMap(() => this.menuService.loadMenus()),

      // --- C. Handle Errors ---
      catchError((err) => {
        this._isLoggedIn.set(false);
        // Optionally clear localStorage on error
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        return throwError(() => err);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    this._isLoggedIn.set(false);
    this.menuService.clearMenus();                  // ← clear menus on logout
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  checkAuth(): boolean {
    return !!this.getToken();
  }
}