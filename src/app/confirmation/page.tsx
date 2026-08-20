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
    <div className="min-h-screen bg-studio-charcoal text-bone-white">
      {/* Navigation */}
      <header className="px-6 py-6">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between">
          <Link href="/" className="font-gt-flexa text-base font-normal text-bone-white">
            <span className="text-ember-orange">●</span> QuantumStore
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] px-6 py-32">
        {/* Left-aligned, not centered */}
        <h1 className="mb-8 font-gt-flexa text-[68px] font-extralight leading-[1.06] text-bone-white">
          Order Confirmed
        </h1>
        <p className="mb-16 max-w-md font-times text-base leading-[1.2] text-ash-gray">
          Thank you, {order.name}. Your order is on its way.
        </p>

        {/* Order details — GT-Flexa for labels and values, not serif */}
        <div className="max-w-md space-y-4 rounded-[20px] border border-ash-gray/40 p-6">
          <div className="flex justify-between">
            <span className="font-gt-flexa text-sm font-normal text-ash-gray">Order ID</span>
            <span className="font-gt-flexa text-sm font-normal text-lavender-link">
              {order.orderId}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-gt-flexa text-sm font-normal text-ash-gray">Email</span>
            <span className="font-gt-flexa text-sm font-normal text-bone-white">{order.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-gt-flexa text-sm font-normal text-ash-gray">Ship to</span>
            <span className="max-w-[200px] truncate font-gt-flexa text-sm font-normal text-bone-white">
              {order.address}
            </span>
          </div>
        </div>

        {/* White ghost button — secondary action */}
        <Link
          href="/"
          className="mt-12 inline-block rounded-[20px] border border-bone-white px-4 py-px font-gt-flexa text-base font-normal text-bone-white shadow-[0_0_30px_rgba(255,255,255,0.3)] transition hover:bg-bone-white/10"
        >
          ← Back to Store
        </Link>
      </main>

      {/* Footer */}
      <footer className="mx-auto max-w-[1200px] px-6 pt-32 pb-16">
        <p className="font-gt-flexa text-[68px] font-extralight leading-[1.06] text-bone-white">
          QuantumStore
        </p>
        <p className="mt-4 font-times text-sm text-ash-gray">
          Built with an AI agent. Verified with Kane CLI.
        </p>
      </footer>
    </div>
  );
}
