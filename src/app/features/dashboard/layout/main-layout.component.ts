// src/app/features/dashboard/layout/main-layout.component.ts
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../components/sidebar/sidebar-component/sidebar-component';


@Component({
  selector: 'app-main-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, SidebarComponent],
  template: `
    <div class="layout">
   <app-sidebar-component />
      <main class="content">
        <router-outlet />
      </main>
    </div>
  `,
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent {}