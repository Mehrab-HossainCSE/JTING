import { ChangeDetectionStrategy, Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';


import { Product } from '../../../../core/models/product';
import { ProductCard } from '../product-card/product-card';
import { ProductForm } from '../product-form/product-form';

@Component({
  selector: 'app-product-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './product-list.html',
  styleUrls: ['./product-list.scss'],
})
export class ProductList {
  // Hardcoded data with all required fields (including description)
 products = signal<Product[]>([
  {
    id: 1,
    name: 'iPhone 15 Pro',
    price: 1200,
    stock: 10,
    category: 'Mobile',
    description: 'The latest flagship from Apple.',
    createdAt: new Date(),
  },
  {
    id: 2,
    name: 'Samsung Galaxy S24',
    price: 1100,
    stock: 15,
    category: 'Mobile',
    description: 'Advanced AI features and stunning display.',
    createdAt: new Date(),
  },
  {
    id: 3,
    name: 'MacBook Pro M3',
    price: 2500,
    stock: 5,
    category: 'Laptop',
    description: 'Pro performance for demanding tasks.',
    createdAt: new Date(),
  },
  {
    id: 4,
    name: 'Dell XPS 13',
    price: 1800,
    stock: 8,
    category: 'Laptop',
    description: 'The ultimate ultraportable Windows laptop.',
    createdAt: new Date(),
  },
]);

  searchQuery = signal('');
  showForm = signal(false);
  editingProduct = signal<Product | null>(null);

  // Computed signal for searching/filtering
  filteredProducts = computed(() => {
    const q = this.searchQuery().toLowerCase();
    return this.products().filter(
      (p) =>
        p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
    );
  });

  openForm(product: Product | null = null) {
    this.editingProduct.set(product);
    this.showForm.set(true);
  }

  closeForm() {
    this.showForm.set(false);
    this.editingProduct.set(null);
  }

  saveProduct(data: Product) {
    const list = this.products();

    if (this.editingProduct()) {
      this.products.set(
        list.map((p) => (p.id === this.editingProduct()!.id ? { ...data, id: p.id } : p))
      );
    } else {
      this.products.set([...list, { ...data, id: Date.now() }]);
    }

    this.closeForm();
  }

  deleteProduct(id: number) {
    this.products.set(this.products().filter((p) => p.id !== id));
  }
}