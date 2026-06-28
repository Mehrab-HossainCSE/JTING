import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  private readonly _isLoading = signal<boolean>(false);
  private readonly _message = signal<string>('Loading workspace');

  readonly isLoading = this._isLoading.asReadonly();
  readonly message = this._message.asReadonly();

  private showTimeoutId: any = null;
  private showTime: number = 0;
  private readonly delayMs = 250;      // Only show loader if task takes longer than 250ms
  private readonly minDurationMs = 350; // If shown, keep it visible for at least 350ms

  show(message = 'Loading workspace'): void {
    if (this.showTimeoutId) {
      clearTimeout(this.showTimeoutId);
    }
    this._message.set(message);

    this.showTimeoutId = setTimeout(() => {
      this._isLoading.set(true);
      this.showTime = Date.now();
    }, this.delayMs);
  }

  hide(): void {
    if (this.showTimeoutId) {
      clearTimeout(this.showTimeoutId);
      this.showTimeoutId = null;
    }

    if (this._isLoading()) {
      const elapsed = Date.now() - this.showTime;
      const remaining = this.minDurationMs - elapsed;

      if (remaining > 0) {
        setTimeout(() => {
          this._isLoading.set(false);
        }, remaining);
      } else {
        this._isLoading.set(false);
      }
    } else {
      this._isLoading.set(false);
    }
  }
}
