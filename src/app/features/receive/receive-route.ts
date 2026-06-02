import { Routes } from '@angular/router';

export const RECEIVE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./receive-module.component').then(m => m.ReceiveModuleComponent),
    children: [
      { path: '', redirectTo: 'auto-receive', pathMatch: 'full' },
      { path: 'auto-receive', loadComponent: () => import('./tabs/auto-receive/auto-receive').then(m => m.AutoReceive), data: { title: 'Auto Receive', tabId: 1 } },
      { path: 'manual-receive', loadComponent: () => import('./tabs/manual-receive/manual-receive').then(m => m.ManualReceive), data: { title: 'Manual Receive', tabId: 2 } },
      { path: 'barcode-generation', loadComponent: () => import('./tabs/barcode-generation/barcode-generation').then(m => m.BarcodeGeneration), data: { title: 'Barcode Generation', tabId: 3 } },
      {path: 'pallet-generate', loadComponent: () => import('./tabs/generate-pallet/generate-pallet').then(m => m.GeneratePallet), data: { title: 'Generate Pallet', tabId: 4 } },
      {path: 'pallet-split', loadComponent: () => import('./tabs/split-pallet/split-pallet').then(m => m.SplitPallet), data: { title: 'Pallet Split', tabId: 5 } },
      {path: 'reconciliation', loadComponent: () => import('./tabs/reconciliation/reconciliation').then(m => m.Reconciliation), data: { title: 'Reconciliation', tabId: 6 } },
      {path: 'quarantine', loadComponent: () => import('./tabs/quarantine/quarantine').then(m => m.Quarantine), data: { title: 'Quarantine', tabId: 7 } },
      {path: 'sku-search', loadComponent: () => import('./tabs/sku-search/sku-search').then(m => m.SkuSearch), data: { title: 'SKU Search', tabId: 8 } },
    ]
  }
];