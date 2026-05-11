import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';       // ← ADD THIS
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { Router } from '@angular/router';
import { concatAll } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private auth = inject(AuthService);
  private router = inject(Router);

  userName = signal('foysal');
  password = signal('123');
  error = signal('');
  loading = signal(false);
  showPassword = signal(false);

  login() {
    if (!this.userName() || !this.password()) {
      this.error.set('Please fill in all fields');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.auth.login({
      userName: this.userName(),
      password: this.password()
    }).subscribe({
      next: () => {
        debugger;
        this.loading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Login error:', err);
        this.loading.set(false);
        this.error.set(
          err.status === 401
            ? 'Invalid username or password'
            : err.status === 0
            ? 'Cannot connect to server'
            : 'Something went wrong. Try again.'
        );
      }
    });
  }
}