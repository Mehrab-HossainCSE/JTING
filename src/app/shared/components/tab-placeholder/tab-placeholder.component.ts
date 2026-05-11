import { Component, Input, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-tab-placeholder',
  standalone: true,
  template: `
    <div class="placeholder-container">
      <h2 class="display-5 fw-bold text-success">{{ getTitle() }} Page</h2>
      <p class="text-muted">Currently working on Static UI/UX for this module.</p>
    </div>
  `,
  styles: [`
    .placeholder-container {
      height: calc(100vh - 150px);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
    }
  `]
})
export class TabPlaceholderComponent {
  private route = inject(ActivatedRoute);

  getTitle(): string {
    return this.route.snapshot.data['title'] || 'Page';
  }
}
