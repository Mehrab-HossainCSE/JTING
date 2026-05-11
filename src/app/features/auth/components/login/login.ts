import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
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
    console.log('Login button clicked!');

    this.loading.set(true);
    this.error.set('');

    this.auth
      .login({
        userName: this.userName(),
        password: this.password(),
      })
      .subscribe({
        next: (res) => {
          this.loading.set(false);

          if (!res.success) {
            this.error.set(res.message || 'Login failed');
            return;
          }

         
          
          this.router.navigate(['/dashboard']);
        },

        error: (err) => {
          console.error(err);

          this.loading.set(false);

          this.error.set(err?.error?.message || 'Login failed');
        },
      });
  }
}
