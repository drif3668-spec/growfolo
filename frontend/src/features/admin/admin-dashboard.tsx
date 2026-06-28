import { Package, ReceiptText, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import { orders, products } from "@/lib/mock-data";

export function AdminDashboard() {
  return (
    <main className="min-h-screen bg-cloud">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-ink/10 bg-white p-6 md:block">
        <h1 className="text-xl font-semibold text-ink">Growfolo Admin</h1>
        <nav className="mt-8 grid gap-2 text-sm text-ink/70">
          <a className="rounded-md bg-mint px-3 py-2 text-ink" href="#orders">Orders</a>
          <a className="rounded-md px-3 py-2 hover:bg-mint" href="#products">Products</a>
          <a className="rounded-md px-3 py-2 hover:bg-mint" href="#settings">Settings</a>
        </nav>
      </aside>
      <section className="px-6 py-8 md:ml-64 md:px-10">
        <h2 className="text-3xl font-semibold text-ink">Dashboard</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <StatCard icon={<ReceiptText />} label="Orders" value={orders.length.toString()} />
          <StatCard icon={<Package />} label="Products" value={products.length.toString()} />
          <StatCard icon={<ShieldCheck />} label="Proofs pending" value="2" />
        </div>
        <div id="orders" className="mt-8 rounded-lg border border-ink/10 bg-white">
          <div className="border-b border-ink/10 p-4 font-semibold text-ink">Recent orders</div>
          {orders.map((order) => (
            <div key={order.id} className="grid gap-2 border-b border-ink/10 p-4 text-sm md:grid-cols-4">
              <span>{order.id}</span>
              <span>{order.customerName}</span>
              <span>{order.status}</span>
              <span className="font-semibold">${order.total}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function StatCard({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-ink/10 bg-white p-5">
      <div className="mb-4 text-leaf">{icon}</div>
      <p className="text-sm text-ink/60">{label}</p>
      <p className="mt-1 text-3xl font-semibold text-ink">{value}</p>
    </div>
  );
}
