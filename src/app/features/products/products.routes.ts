import { Routes } from '@angular/router';
import { ProductList } from './components/product-list/product-list';
import { ProductForm } from './components/product-form/product-form';

export const PRODUCTS_ROUTES: Routes = [
  {
    path: 'product',
     component: ProductList
  },
   {
    path: 'productform',
     component: ProductForm
  },
];