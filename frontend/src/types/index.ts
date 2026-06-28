export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
};

export type OrderStatus = "pending_proof" | "paid" | "processing" | "fulfilled" | "cancelled";

export type Order = {
  id: string;
  customerName: string;
  status: OrderStatus;
  total: number;
};

