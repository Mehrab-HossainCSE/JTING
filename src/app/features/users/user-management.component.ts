import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss'
})
export class UserManagementComponent {
  selectedUser: string = '';
  users: string[] = ['Admin', 'Manager', 'Store Keeper', 'Sales Executive'];

  menuSections = [
    {
      title: 'Home',
      isSelected: false,
      isOpen: true,
      items: [
        { name: 'Quick Access', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'Recent Activity', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'Notifications', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'System Health', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'Statistics', isSelected: false, view: false, add: false, edit: false, delete: false }
      ]
    },
    {
      title: 'Settings',
      isSelected: false,
      isOpen: true,
      items: [
        { name: 'Category', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'Sub-Category', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'Product Name', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'Brand', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'Product Attribute', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'Product Entry', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'Attribute Value', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'Vendor', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'Priority', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'Product', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'Delivery Person', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'Store Requisition Permission', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'Product Bulk Update', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'Courier Service', isSelected: false, view: false, add: false, edit: false, delete: false }
      ]
    },
    {
      title: 'Inventory Tracking System',
      isSelected: false,
      isOpen: true,
      items: [
        { name: 'InvPrepareSeason', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'InvScanBarcode', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'InvFinalPost', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'InvReportView', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'InvAdjustment', isSelected: false, view: false, add: false, edit: false, delete: false }
      ]
    },
    {
      title: 'Dashboard',
      isSelected: false,
      isOpen: true,
      items: [
        { name: 'Sales Overview', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'Inventory Stats', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'User Performance', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'Revenue Report', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'Monthly Summary', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'Order Status', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'Customer Insights', isSelected: false, view: false, add: false, edit: false, delete: false }
      ]
    },
    {
      title: 'Inventory',
      isSelected: false,
      isOpen: true,
      items: [
        { name: 'Reprint', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'Purchase Receive By Style', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'Purchase Receive By Barcode', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'Purchase Receive', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'Barcode Print', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'Store Delivery', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'Store Delivery Fashion', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'Purchase Return', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'Store Delivery By Style', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'Damage and Lost', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'ECOM Receive', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'Receive From Shop', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'Barcode Print Product', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'Requisition Approval', isSelected: false, view: false, add: false, edit: false, delete: false }
      ]
    },
    {
      title: 'Promotion',
      isSelected: false,
      isOpen: true,
      items: [
        { name: 'Discount Promotion', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'Price Change', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'Price Change (Excel)', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'Promotion Extend', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'Promotion InActive', isSelected: false, view: false, add: false, edit: false, delete: false }
      ]
    },
    {
      title: 'CRM',
      isSelected: false,
      isOpen: true,
      items: [
        { name: 'Customer Entry', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'Gift Voucher Status Report', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'Gift Voucher Generation', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'Extend Gift Voucher Expiry Date', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'Gift Voucher Delivery By Excel', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'Gift Voucher Delivery To Customer', isSelected: false, view: false, add: false, edit: false, delete: false },
        { name: 'giftvoucher-reactive', isSelected: false, view: false, add: false, edit: false, delete: false }
      ]
    }
  ];

  onSectionToggle(section: any) {
    const isSelected = section.isSelected;
    section.items.forEach((item: any) => {
      item.isSelected = isSelected;
      item.view = isSelected;
      item.add = isSelected;
      item.edit = isSelected;
      item.delete = isSelected;
    });
  }

  onItemToggle(section: any, item: any) {
    // Optional: Update section.isSelected based on children
    item.view = item.isSelected;
    item.add = item.isSelected;
    item.edit = item.isSelected;
    item.delete = item.isSelected;
  }
}
