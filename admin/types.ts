
export interface Category {
  id: string;
  name: string;
  order: number;
  created_at: string;
}

export interface Product {
  id: string;
  category_id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  available: boolean;
  created_at: string;
}

export interface MenuConfig {
  id: string;
  whatsapp_number: string;
  minimum_order: number;
  neighborhoods: string[];
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
}
