export interface Product {

     id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  description: string;
  createdAt: Date;
}
export type ProductPayload = Omit<Product, 'id' | 'createdAt'>;