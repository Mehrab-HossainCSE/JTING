import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-master-setup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './master-setup.component.html',
  styleUrl: './master-setup.component.scss'
})
export class MasterSetupComponent {
  activeTabId = signal(1);

  tabs = [
    { id: 1, label: 'Brand Setup' },
    { id: 2, label: 'Sub Brands Setup' },
    { id: 3, label: 'External Brand Setup' },
    { id: 4, label: 'External Sub Brand Setup' },
    { id: 5, label: 'Trucks Setup' },
    { id: 6, label: 'Drivers Setup' },
    { id: 7, label: 'Destinations Setup' },
    { id: 8, label: 'Department Setup' },
    { id: 9, label: 'Shifts Setup' },
    { id: 10, label: 'SKU Setup' },
    { id: 11, label: 'Block Setup' },
    { id: 12, label: 'Arch Setup' },
    { id: 13, label: 'Line Setup' },
    { id: 14, label: 'Box Setup' },
    { id: 15, label: 'Layout Assign' },
    { id: 16, label: 'KPI Setup' }
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
