import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UIStateService {
  isSidebarCollapsed = signal<boolean>(false);

  toggleSidebar() {
    this.isSidebarCollapsed.update(state => !state);
  }

  setSidebarCollapsed(state: boolean) {
    this.isSidebarCollapsed.set(state);
  }
}
