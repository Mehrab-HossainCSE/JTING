import { Routes } from '@angular/router';

export const DELIVERY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./delivery-module.component').then(m => m.DeliveryModuleComponent),
    children: [
      { path: '', redirectTo: 'delivery', pathMatch: 'full' },
      {
        path: 'delivery',
        loadComponent: () => import('./tabs/delivery/delivery').then(m => m.Delivery),
        data: { title: 'Delivery' }
      },
      {
        path: 'cancel-receive-delivery',
        loadComponent: () => import('./tabs/cancel-receive-delivery/cancel-receive-delivery').then(m => m.CancelReceiveDelivery),
        data: { title: 'Cancel Receive/Delivery' },
        children: [
          { path: '', redirectTo: 'receive-cancelation', pathMatch: 'full' },
          { path: 'receive-cancelation', loadComponent: () => import('./tabs/cancel-receive-delivery/pages/receive-cancelation/receive-cancelation').then(m => m.ReceiveCancelation) },
          { path: 'delivery-cancelation', loadComponent: () => import('./tabs/cancel-receive-delivery/pages/delivery-cancelation/delivery-cancelation').then(m => m.DeliveryCancelation) },
          { path: 'cancelation-story', loadComponent: () => import('./tabs/cancel-receive-delivery/pages/cancelation-story/cancelation-story').then(m => m.CancelationStory) }
        ]
      }
    ]
  }
];
