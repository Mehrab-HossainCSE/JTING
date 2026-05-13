import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar-component';
import { HeaderComponent } from '../header/header-component';
import { UIStateService } from '../../core/services/ui-state.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent, CommonModule],
  template: `
    <div class="layout-wrapper" [class.collapsed]="isCollapsed()">
      <app-sidebar-component />
      
      <div class="main-container">
        <app-header />
        <main class="content-area">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent {
  uiService = inject(UIStateService);
  isCollapsed = this.uiService.isSidebarCollapsed;
}