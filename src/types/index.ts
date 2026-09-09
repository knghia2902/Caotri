export type Role = "ADMIN" | "STAFF";

export type OrderStatus =
  | "PENDING"
  | "CONTACTED"
  | "SHIPPING"
  | "COMPLETED"
  | "CANCELLED";

export interface ProductSpecs {
  [key: string]: string;
}

export interface CartItem {
  id: string; // Product ID
  name: string;
  slug: string;
  price: number;
  originalPrice?: number | null;
  image: string;
  quantity: number;
}
