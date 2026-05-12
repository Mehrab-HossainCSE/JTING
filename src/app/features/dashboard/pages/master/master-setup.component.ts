import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-master-setup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="master-setup-container">
      <!-- Top Tabs (Wrapped in 2 rows as per design) -->
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
                      <tr>
                        <td>{{ item.parent }}</td>
                        <td><span class="id-pill">{{ item.id }}</span></td>
                        <td>{{ item.name }}</td>
                        <td>
                          <span class="status-badge" [class.inactive]="!item.active">
                            {{ item.active ? 'Active' : 'Inactive' }}
                          </span>
                        </td>
                        <td></td>
                      </tr>
                    }
                  } @else {
                    @for (item of brandList; track item.id) {
                      <tr>
                        <td><span class="id-pill">{{ item.id }}</span></td>
                        <td>{{ item.name }}</td>
                        <td>
                          <span class="status-badge" [class.inactive]="!item.active">
                            {{ item.active ? 'Active' : 'Inactive' }}
                          </span>
                        </td>
                        <td></td>
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
  styles: [`
    .master-setup-container {
      padding: 1.5rem 2rem;
      background: #f4f7f6;
      min-height: calc(100vh - 70px);
      font-family: 'Inter', sans-serif;
    }

    .tabs-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-bottom: 2rem;

      .tab-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        background: white;
        border: 1px solid #e1e8ed;
        border-radius: 10px;
        color: #576574;
        font-weight: 500;
        font-size: 0.8rem;
        cursor: pointer;
        transition: all 0.2s;
        box-shadow: 0 2px 4px rgba(0,0,0,0.02);

        .tab-icon {
          display: flex;
          align-items: center;
          color: #8395a7;
        }

        &.active {
          background: #00BB31;
          border-color: #00BB31;
          color: white;
          box-shadow: 0 4px 12px rgba(0, 187, 49, 0.2);
          .tab-icon { color: white; }
        }

        &:hover:not(.active) {
          border-color: #00BB31;
          color: #00BB31;
        }
      }
    }

    .grid-layout {
      display: grid;
      grid-template-columns: 360px 1fr;
      gap: 1.5rem;
      align-items: start;
    }

    .card {
      background: white;
      border-radius: 24px;
      border: 1px solid #eef2f5;
      box-shadow: 0 10px 25px rgba(0,0,0,0.02);
      overflow: hidden;
    }

    .card-header {
      padding: 1.5rem;
      border-bottom: 1px solid #f8fafc;
      h3 { margin: 0; font-size: 1.1rem; color: #2d3436; font-weight: 700; }
      p { margin: 4px 0 0; font-size: 0.75rem; color: #b2bec3; }
    }

    .card-body {
      padding: 1.5rem;
      .operations-tag {
        font-size: 0.65rem;
        font-weight: 700;
        color: #b2bec3;
        letter-spacing: 1px;
        text-align: right;
        margin-bottom: 2rem;
        border-bottom: 1px dashed #eef2f5;
        padding-bottom: 8px;
      }
    }

    .input-group {
      margin-bottom: 1.5rem;
      label {
        display: block;
        font-size: 0.7rem;
        font-weight: 700;
        color: #636e72;
        margin-bottom: 10px;
        .req { color: #ff7675; margin-left: 2px; }
      }
      input, .custom-select {
        width: 100%;
        padding: 12px 16px;
        background: white;
        border: 1px solid #e1e8ed;
        border-radius: 12px;
        font-size: 0.85rem;
        color: #2d3436;
        transition: all 0.2s;
        &::placeholder { color: #b2bec3; }
        &:focus { outline: none; border-color: #00BB31; box-shadow: 0 0 0 4px rgba(0, 187, 49, 0.05); }
      }
      .custom-select {
        appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23b2bec3' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 12px center;
        background-size: 16px;
      }
    }

    .status-box {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 2rem;
      label { font-size: 0.75rem; font-weight: 700; color: #636e72; }
    }

    .toggle-switch {
      display: flex;
      align-items: center;
      gap: 12px;
      input { display: none; }
      .slider {
        width: 48px;
        height: 24px;
        background: #00BB31;
        border-radius: 20px;
        position: relative;
        cursor: pointer;
        transition: 0.3s;
        &::after {
          content: '';
          position: absolute;
          width: 18px;
          height: 18px;
          background: white;
          border-radius: 50%;
          top: 3px;
          right: 3px;
          transition: 0.3s;
        }
      }
      input:not(:checked) + .slider {
        background: #dfe6e9;
        &::after { right: 27px; }
      }
      .toggle-label { font-size: 0.85rem; font-weight: 600; color: #00BB31; }
    }

    .card-footer {
      padding: 1.5rem;
      display: flex;
      gap: 12px;
      background: white;
      border-top: 1px solid #f8fafc;
      .btn {
        flex: 1;
        height: 48px;
        border-radius: 12px;
        font-weight: 600;
        font-size: 0.85rem;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        cursor: pointer;
        transition: 0.2s;
        border: none;
      }
      .btn-reset {
        background: white;
        border: 1px solid #e1e8ed;
        color: #636e72;
        &:hover { background: #f8fafc; }
      }
      .btn-save {
        background: #00BB31;
        color: white;
        box-shadow: 0 4px 15px rgba(0, 187, 49, 0.25);
        &:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0, 187, 49, 0.3); }
      }
    }

    .title-with-badge {
      display: flex;
      align-items: center;
      gap: 10px;
      .count {
        background: #e6f7ec;
        color: #00BB31;
        font-size: 0.7rem;
        font-weight: 800;
        padding: 2px 8px;
        border-radius: 8px;
      }
    }

    .list-header-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      .actions {
        display: flex;
        gap: 12px;
        .search-bar {
          position: relative;
          svg { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #b2bec3; }
          input {
            width: 260px;
            padding: 10px 14px 10px 38px;
            background: #f8fafc;
            border: 1px solid #e1e8ed;
            border-radius: 12px;
            font-size: 0.8rem;
            &::placeholder { color: #b2bec3; }
            &:focus { outline: none; border-color: #00BB31; background: white; }
          }
        }
        .btn-export {
          padding: 0 16px;
          height: 40px;
          background: white;
          border: 1px solid #e1e8ed;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 600;
          color: #636e72;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          &:hover { background: #f8fafc; }
        }
      }
    }

    .table-outer {
      padding: 0 1.5rem;
      min-height: 400px;
    }

    .premium-table {
      width: 100%;
      border-collapse: collapse;
      th {
        text-align: left;
        padding: 1.25rem 0;
        font-size: 0.75rem;
        color: #8395a7;
        font-weight: 600;
        border-bottom: 1px solid #f8fafc;
      }
      td {
        padding: 1.25rem 0;
        font-size: 0.85rem;
        color: #2d3436;
        font-weight: 500;
        border-bottom: 1px solid #f8fafc;
      }
      .id-pill {
        background: #f1f5f9;
        color: #576574;
        padding: 4px 10px;
        border-radius: 8px;
        font-size: 0.75rem;
        font-weight: 600;
      }
      .status-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        color: #00BB31;
        font-weight: 700;
        font-size: 0.8rem;
        &::before {
          content: '';
          width: 6px;
          height: 6px;
          background: #00BB31;
          border-radius: 50%;
        }
        &.inactive {
          color: #b2bec3;
          &::before { background: #b2bec3; }
        }
      }
    }

    .table-footer {
      justify-content: space-between;
      align-items: center;
      .records-info { font-size: 0.75rem; color: #b2bec3; font-weight: 500; }
      .pagination {
        .page-num {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #00BB31;
          color: white;
          border-radius: 50%;
          font-weight: 800;
          font-size: 0.8rem;
          box-shadow: 0 4px 10px rgba(0, 187, 49, 0.2);
        }
      }
    }
  `]
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
