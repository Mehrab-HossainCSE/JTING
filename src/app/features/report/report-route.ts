import { Routes } from '@angular/router';

export const REPORT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./report.component').then(m => m.ReportComponent),
    children: [
      { path: '', redirectTo: 'receive', pathMatch: 'full' },
      { path: 'receive', loadComponent: () => import('./tabs/receive-report/receive-report').then(m => m.ReceiveReport) },
      { path: 'delivery', loadComponent: () => import('./tabs/delivery-report/delivery-report').then(m => m.DeliveryReport) },
      { path: 'product-receive-report', loadComponent: () => import('./tabs/product-receive-report/product-receive-report').then(m => m.ProductReceiveReport) },
      { path: 'picking-report', loadComponent: () => import('./tabs/picking-report/picking-report').then(m => m.PickingReport) },
      { path: 'picking-area-report', loadComponent: () => import('./tabs/picking-area-report/picking-area-report').then(m => m.PickingAreaReport) },
      { path: 'warehouse-capacity-report', loadComponent: () => import('./tabs/warehouse-capacity-report/warehouse-capacity-report').then(m => m.WarehouseCapacityReport) },
      { path: 'total-inventory-report', loadComponent: () => import('./tabs/total-inventory-report/total-inventory-report').then(m => m.TotalInventoryReport) },
      { path: 'delivery-report', loadComponent: () => import('./tabs/delivery-report-standard/delivery-report-standard').then(m => m.DeliveryReportStandard) },
      { path: 'split-pallet-history-report', loadComponent: () => import('./tabs/split-pallet-history-report/split-pallet-history-report').then(m => m.SplitPalletHistoryReport) },
      { path: 'quarantine-report', loadComponent: () => import('./tabs/quarantine-report/quarantine-report').then(m => m.QuarantineReport) },
      { path: 'barcodewise-receive-report', loadComponent: () => import('./tabs/barcodewise-receive-report/barcodewise-receive-report').then(m => m.BarcodewiseReceiveReport) },
      { path: 'pallet-information-report', loadComponent: () => import('./tabs/pallet-information-report/pallet-information-report').then(m => m.PalletInformationReport) },
      { path: 'inventory-report', loadComponent: () => import('./tabs/inventory-report/inventory-report').then(m => m.InventoryReport) },
      { path: 'daily-report', loadComponent: () => import('./tabs/daily-report/daily-report').then(m => m.DailyReport) },
      { path: 'barcode-checking-report', loadComponent: () => import('./tabs/barcode-checking-report/barcode-checking-report').then(m => m.BarcodeCheckingReport) },
      { path: 'delivery-archive-report', loadComponent: () => import('./tabs/delivery-archive-report/delivery-archive-report').then(m => m.DeliveryArchiveReport) }
    ]
  }
];
