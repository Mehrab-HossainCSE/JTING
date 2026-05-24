import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardPageComponent {
  // Header Stats
  summaryStats = [
    { label: 'Received Today', value: '847', icon: 'bi-box-seam', color: 'green' },
    { label: 'Orders Picked', value: '23', icon: 'bi-cart-check', color: 'orange' },
    { label: 'Deliveries Out', value: '6', icon: 'bi-truck', color: 'teal' },
    { label: 'Active Alerts', value: '17', icon: 'bi-exclamation-triangle', color: 'red' },
  ];

  // Top Metric Cards
  metrics = [
    { 
      title: 'TOTAL INVENTORY', 
      value: '124,580', 
      unit: 'units', 
      change: '+3.2%', 
      isPositive: true,
      changeLabel: 'vs last week',
      footer: '1,248 pallets | 4 blocks',
      color: '#00BB31',
      progress: 75,
      icon: 'bi-database'
    },
    { 
      title: "TODAY'S RECEIPTS", 
      value: '847', 
      unit: 'cartons', 
      change: '70.6%', 
      isPositive: true,
      changeLabel: 'of 1,200 target',
      footer: '2 batches pending | 3 completed',
      color: '#3498db',
      progress: 70,
      icon: 'bi-box-seam'
    },
    { 
      title: 'PICKING PROGRESS', 
      value: '23 / 31', 
      unit: 'orders', 
      change: '74.2%', 
      isPositive: true,
      changeLabel: 'completion rate',
      footer: '5 in-progress | 3 pending',
      color: '#8e44ad',
      progress: 74,
      icon: 'bi-clipboard-check'
    },
    { 
      title: 'ACTIVE ALERTS', 
      value: '17', 
      unit: 'total', 
      isPositive: false,
      isAlert: true,
      critical: '5 critical',
      warnings: '12 warnings',
      footer: 'Requires immediate attention',
      color: '#e74c3c',
      progress: 40,
      icon: 'bi-exclamation-triangle'
    }
  ];

  // Trend Stats
  trendStats = [
    { label: 'Avg Daily In', value: '3,971', icon: 'bi-graph-up-arrow', color: '#ebf5ff', text: '#3498db' },
    { label: 'Avg Daily Out', value: '2,764', icon: 'bi-graph-down-arrow', color: '#fff5eb', text: '#f39c12' },
    { label: 'Net Change', value: '+1,207', icon: 'bi-plus-circle', color: '#eaffee', text: '#00BB31' },
  ];

  // Block Capacity
  blocks = [
    { name: 'Block A', status: 'Critical', percentage: 85, color: '#e74c3c', footer: '425/500 pallet positions' },
    { name: 'Block B', status: 'Normal', percentage: 62, color: '#f39c12', footer: '310/500 pallet positions' },
    { name: 'Block C', status: 'Critical', percentage: 95, color: '#e74c3c', footer: '380/400 pallet positions' },
    { name: 'Block D', status: 'Good', percentage: 45, color: '#00BB31', footer: '180/400 pallet positions' },
  ];

  // Work Queue
  workQueue = [
    { id: 'RCV-089', type: 'Winston Blue 20s', priority: 'High', status: 'Awaiting', detail: '420 units - 10:30 AM', color: '#e74c3c', iconColor: '#eaffee', icon: 'bi-box-arrow-in-down' },
    { id: 'PCK-441', type: 'Camel Classic 20s', priority: 'High', status: 'In Progress', detail: '240 units - 9:45 AM', color: '#e74c3c', iconColor: '#f5ebff', icon: 'bi-clipboard-check' },
    { id: 'DEL-091', type: 'Multi-SKU - 4 orders', priority: 'Medium', status: 'Staged', detail: '320 units - 11:00 AM', color: '#f39c12', iconColor: '#ebf5ff', icon: 'bi-truck' },
  ];

  // Live Activity
  activities = [
    { type: 'received', message: 'Received 240 cartons — Batch B2024-289', time: '9:32 AM', user: 'Kenji T.', color: '#00BB31' },
    { type: 'delivery', message: 'Delivery DEL-2024-059 dispatched to Osaka', time: '9:15 AM', user: 'Maria G.', color: '#3498db' },
    { type: 'capacity', message: 'Block C approaching capacity threshold (95%)', time: '8:48 AM', user: 'System', color: '#f39c12' },
    { type: 'picking', message: 'Picking order PO-2024-441 completed — 120 units', time: '8:22 AM', user: 'Ahmed H.', color: '#8e44ad' },
    { type: 'system', message: 'Auto-receive completed: Winston Blue batch', time: '7:55 AM', user: 'System', color: '#00BB31' },
    { type: 'quarantine', message: '3 pallets flagged for quarantine review', time: '7:30 AM', user: 'System', color: '#e74c3c' },
  ];

  // Top SKU Movement
  topSKUs = [
    { sku: 'Winston Blue 20s', brand: 'Winston', in: '4,200', out: '3,800', net: '+400', stock: '28,400', color: '#f39c12' },
    { sku: 'Camel Classic 20s', brand: 'Camel', in: '3,100', out: '3,600', net: '-500', stock: '22,100', color: '#95a5a6' },
    { sku: 'LD Gold 20s', brand: 'LD', in: '2,800', out: '2,200', net: '+600', stock: '18,600', color: '#d35400' },
    { sku: 'Mevius Original', brand: 'Mevius', in: '1,900', out: '2,400', net: '-500', stock: '15,800', color: '#3498db' },
    { sku: 'Winston Red 20s', brand: 'Winston', in: '2,200', out: '1,800', net: '+400', stock: '14,200', color: '#7f8c8d' },
  ];

  // Delivery Schedule
  deliveries = [
    { id: 'DEL-088', location: 'Osaka Central', status: 'Departed', truck: 'TK-04 - H. Tanaka', orders: '3 orders', time: '07:30' },
    { id: 'DEL-089', location: 'Kyoto West', status: 'Departed', truck: 'TK-07 - M. Garcia', orders: '5 orders', time: '09:15' },
    { id: 'DEL-090', location: 'Kobe North', status: 'Staged', truck: 'TK-11 - R. Sato', orders: '4 orders', time: '11:00' },
  ];

  // Quick Actions
  quickActions = [
    { label: 'New Receive', icon: 'bi-box-arrow-in-down', color: '#00BB31' },
    { label: 'Start Picking', icon: 'bi-clipboard-check', color: '#8e44ad' },
    { label: 'Create Delivery', icon: 'bi-truck', color: '#3498db' },
    { label: 'Quick Reports', icon: 'bi-graph-up', color: '#f39c12' },
    { label: 'User Mgmt', icon: 'bi-people', color: '#16a085' },
    { label: 'KPI Setup', icon: 'bi-gear', color: '#2c3e50' },
    { label: 'Inventory Rpt', icon: 'bi-journals', color: '#c0392b' },
    { label: 'Traceability', icon: 'bi-fingerprint', color: '#2980b9' },
  ];
}

