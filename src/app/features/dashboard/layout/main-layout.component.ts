import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../components/sidebar/sidebar-component/sidebar-component';
import { HeaderComponent } from '../components/header/header-component/header-component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent],
  template: `
    <div class="layout-wrapper">
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
export class MainLayoutComponent {}