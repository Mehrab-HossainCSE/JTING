import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-master-setup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="master-setup-container">
      <!-- Top Tabs Container (White Box) -->
      <div class="card tabs-card">
        <div class="tabs-grid">
          @for (tab of tabs; track tab.id) {
            <button 
              class="tab-btn" 
              [class.active]="activeTabId() === tab.id"
              (click)="activeTabId.set(tab.id)"
            >
              <span class="tab-icon" [innerHTML]="tab.icon"></span>
              {{ tab.label }}
            </button>
          }
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="content-body">
        <div class="grid-layout">
          <!-- Left Card: Form (Dynamic based on Tab) -->
          <div class="card form-card">
            <div class="card-header">
              <h3>{{ activeTabId() === 2 ? 'Add New Sub Brand' : 'Add New Brand' }}</h3>
              <p>{{ activeTabId() === 2 ? 'Add a sub-category under a brand' : 'Register a new JTI brand' }}</p>
            </div>
            
            <div class="card-body">
              <div class="operations-tag">OPERATIONS</div>
              
              @if (activeTabId() === 2) {
                <div class="input-group">
                  <label>PARENT BRAND<span class="req">*</span></label>
                  <select class="custom-select">
                    <option value="">Select Parent Brand</option>
                    <option value="Marlboro">Marlboro</option>
                  </select>
                </div>
                <div class="input-group">
                  <label>SUB BRAND ID<span class="req">*</span></label>
                  <input type="text" placeholder="e.g. SB-007" />
                </div>
                <div class="input-group">
                  <label>SUB BRAND NAME<span class="req">*</span></label>
                  <input type="text" placeholder="e.g. Marlboro Silver" />
                </div>
              } @else {
                <div class="input-group">
                  <label>BRAND ID<span class="req">*</span></label>
                  <input type="text" placeholder="e.g. BR-007" />
                </div>
                <div class="input-group">
                  <label>BRAND NAME<span class="req">*</span></label>
                  <input type="text" placeholder="e.g. Marlboro" />
                </div>
              }

              <div class="status-box">
                <label>STATUS</label>
                <div class="toggle-switch">
                  <input type="checkbox" id="brand-status" checked />
                  <label for="brand-status" class="slider"></label>
                  <span class="toggle-label">Active</span>
                </div>
              </div>
            </div>

            <div class="card-footer">
              <button class="btn btn-reset">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path><path d="M8 16H3v5"></path></svg>
                Reset
              </button>
              <button class="btn btn-save">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                {{ activeTabId() === 2 ? 'Save Sub Brand' : 'Save Brand' }}
              </button>
            </div>
          </div>

          <!-- Right Card: Data List -->
          <div class="card list-card">
            <div class="card-header list-header-top">
              <div class="title-with-badge">
                <h3>Data List</h3>
                <span class="count">6</span>
              </div>
              <div class="actions">
                <div class="search-bar">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                  <input type="text" placeholder="Search..." />
                </div>
                <button class="btn-export">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  Export
                </button>
              </div>
            </div>

            <div class="table-outer">
              <table class="premium-table">
                <thead>
                  @if (activeTabId() === 2) {
                    <tr>
                      <th>PARENT BRAND</th>
                      <th>SUB BRAND ID</th>
                      <th>SUB BRAND NAME</th>
                      <th>STATUS</th>
                      <th>ACTIONS</th>
                    </tr>
                  } @else {
                    <tr>
                      <th>BRAND ID</th>
                      <th>BRAND NAME</th>
                      <th>STATUS</th>
                      <th>ACTIONS</th>
                    </tr>
                  }
                </thead>
                <tbody>
                  @if (activeTabId() === 2) {
                    @for (item of subBrandList; track item.id) {
                      <tr class="table-row">
                        <td>{{ item.parent }}</td>
                        <td><span class="id-pill">{{ item.id }}</span></td>
                        <td>{{ item.name }}</td>
                        <td>
                          <span class="status-badge" [class.inactive]="!item.active">
                            {{ item.active ? 'Active' : 'Inactive' }}
                          </span>
                        </td>
                        <td>
                          <div class="row-actions">
                            <button class="action-btn edit-btn" title="Edit">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                            </button>
                            <button class="action-btn delete-btn" title="Delete">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    }
                  } @else {
                    @for (item of brandList; track item.id) {
                      <tr class="table-row">
                        <td><span class="id-pill">{{ item.id }}</span></td>
                        <td>{{ item.name }}</td>
                        <td>
                          <span class="status-badge" [class.inactive]="!item.active">
                            {{ item.active ? 'Active' : 'Inactive' }}
                          </span>
                        </td>
                        <td>
                          <div class="row-actions">
                            <button class="action-btn edit-btn" title="Edit">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                            </button>
                            <button class="action-btn delete-btn" title="Delete">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    }
                  }
                </tbody>
              </table>
            </div>

            <div class="card-footer table-footer">
              <div class="records-info">Showing 6 of 6 records</div>
              <div class="pagination">
                <span class="page-num active">1</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './master-setup.component.scss'
})
export class MasterSetupComponent {
  activeTabId = signal(1);

  tabs = [
    { id: 1, label: 'Brand Setup', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg>' },
    { id: 2, label: 'Sub Brands Setup', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>' },
    { id: 3, label: 'External Brand Setup', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>' },
    { id: 4, label: 'External Sub Brand Setup', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>' },
    { id: 5, label: 'Trucks Setup', icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>` },
    { id: 6, label: 'Drivers Setup', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>' },
    { id: 7, label: 'Destinations Setup', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>' },
    { id: 8, label: 'Department Setup', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>' },
    { id: 9, label: 'Shifts Setup', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>' },
    { id: 10, label: 'SKU Setup', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>' },
    { id: 11, label: 'Block Setup', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="3" y1="15" x2="21" y2="15"></line><line x1="9" y1="3" x2="9" y2="21"></line><line x1="15" y1="3" x2="15" y2="21"></line></svg>' },
    { id: 12, label: 'Arch Setup', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18"></path><path d="M3 7v1a3 3 0 0 0 6 0V7"></path><path d="M9 7v1a3 3 0 0 0 6 0V7"></path><path d="M15 7v1a3 3 0 0 0 6 0V7"></path><path d="M19 21v-4a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v4"></path></svg>' },
    { id: 13, label: 'Line Setup', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>' },
    { id: 14, label: 'Box Setup', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path></svg>' },
    { id: 15, label: 'Layout Assign', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>' },
    { id: 16, label: 'KPI Setup', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>' }
  ];

  brandList = [
    { id: 'BR-001', name: 'Marlboro', active: true },
    { id: 'BR-002', name: 'Winston', active: true },
    { id: 'BR-003', name: 'Camel', active: true },
    { id: 'BR-004', name: 'Mevius', active: true },
    { id: 'BR-005', name: 'LD', active: false },
    { id: 'BR-006', name: 'Sobranie', active: true },
  ];

  subBrandList = [
    { parent: 'Marlboro', id: 'SB-001', name: 'Marlboro Red', active: true },
    { parent: 'Marlboro', id: 'SB-002', name: 'Marlboro Gold', active: true },
    { parent: 'Winston', id: 'SB-003', name: 'Winston Blue', active: true },
    { parent: 'Mevius', id: 'SB-004', name: 'Mevius Original', active: true },
    { parent: 'Mevius', id: 'SB-005', name: 'Mevius Menthol', active: true },
    { parent: 'Camel', id: 'SB-006', name: 'Camel Light', active: false },
  ];
}
