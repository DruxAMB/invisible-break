import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function ConfirmationPage() {
  const cookieStore = await cookies();
  const orderRaw = cookieStore.get("ib-order")?.value;

  if (!orderRaw) {
    redirect("/");
  }

  const order = JSON.parse(orderRaw) as {
    orderId: string;
    name: string;
    email: string;
    address: string;
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">
            Quantum<span className="text-emerald-400">Store</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-16">
        <div className="rounded-xl border border-emerald-800 bg-emerald-950/30 p-8 text-center">
          <div className="mb-4 text-6xl">✅</div>
          <h1 className="mb-2 text-2xl font-bold">Order Confirmed!</h1>
          <p className="mb-6 text-zinc-400">
            Thank you, {order.name}. Your order is on its way.
          </p>

          <div className="mx-auto max-w-sm space-y-2 rounded-lg border border-zinc-800 bg-zinc-900 p-4 text-left text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-400">Order ID</span>
              <span className="font-mono text-emerald-400">{order.orderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Email</span>
              <span>{order.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Ship to</span>
              <span className="max-w-[200px] truncate">{order.address}</span>
            </div>
          </div>

          <Link
            href="/"
            className="mt-8 inline-block rounded-lg border border-zinc-700 px-6 py-3 text-sm font-medium transition hover:border-zinc-500"
          >
            ← Back to Store
          </Link>
        </div>
      </main>
    </div>
  );
}
