import { Component, Input, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-tab-placeholder',
  standalone: true,
  templateUrl: './tab-placeholder.component.html',
  styleUrl: './tab-placeholder.component.scss'
})
export class TabPlaceholderComponent {
  private route = inject(ActivatedRoute);

  getTitle(): string {
    return this.route.snapshot.data['title'] || 'Page';
  }
}
