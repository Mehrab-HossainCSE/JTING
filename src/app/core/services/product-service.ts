import { computed, Injectable, signal } from '@angular/core';
import { Product, ProductPayload } from '../models/product';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  // State as signals — no zone needed
  private readonly _products = signal<Product[]>([
    { id: 1, name: 'Laptop Pro', category: 'Electronics', price: 1299, stock: 15, description: 'High-performance laptop', createdAt: new Date() },
    { id: 2, name: 'Wireless Mouse', category: 'Accessories', price: 49, stock: 100, description: 'Ergonomic wireless mouse', createdAt: new Date() },
    { id: 3, name: 'Mechanical Keyboard', category: 'Accessories', price: 129, stock: 45, description: 'RGB mechanical keyboard', createdAt: new Date() },
  ]);

  private _nextId = signal(4);

  // Public read-only signals
  readonly products = this._products.asReadonly();
  readonly total = computed(() => this._products().length);

  getById(id: number): Product | undefined {
    return this._products().find(p => p.id === id);
  }

  create(payload: ProductPayload): Product {
    const product: Product = {
      ...payload,
      id: this._nextId(),
      createdAt: new Date(),
    };
    this._products.update(list => [...list, product]);
    this._nextId.update(id => id + 1);
    return product;
  }

  update(id: number, payload: Partial<ProductPayload>): void {
    this._products.update(list =>
      list.map(p => p.id === id ? { ...p, ...payload } : p)
    );
  }

  delete(id: number): void {
    this._products.update(list => list.filter(p => p.id !== id));
  }
}
