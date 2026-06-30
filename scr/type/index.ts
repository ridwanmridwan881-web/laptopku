export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  is_admin: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  category_id: string | null;
  price: number;
  original_price: number | null;
  processor: string;
  ram: string;
  storage: string;
  display: string | null;
  gpu: string | null;
  battery: string | null;
  weight: string | null;
  stock: number;
  image_url: string | null;
  description: string | null;
  specs: Record<string, string>;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface Order {
  id: string;
  user_id: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  shipping_address: string | null;
  phone: string | null;
  notes: string | null;
  payment_method: string;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  created_at: string;
  product?: Product;
}

export interface Review {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  profile?: Profile;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
