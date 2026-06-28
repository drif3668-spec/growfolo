import type { Order, Product } from "@/types";

export const products: Product[] = [
  {
    id: "prd_001",
    name: "Growth Kit",
    description: "A compact starter product for modern ecommerce campaigns.",
    price: 79
  },
  {
    id: "prd_002",
    name: "Scale Bundle",
    description: "Premium bundle for teams that need repeatable fulfillment.",
    price: 149
  },
  {
    id: "prd_003",
    name: "Founder Pack",
    description: "High-value package for early operators and founders.",
    price: 249
  }
];

export const orders: Order[] = [
  { id: "ord_1001", customerName: "Nadia K.", status: "pending_proof", total: 149 },
  { id: "ord_1002", customerName: "Samir B.", status: "paid", total: 79 },
  { id: "ord_1003", customerName: "Lina M.", status: "processing", total: 249 }
];

