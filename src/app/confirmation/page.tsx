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
    <div className="flex min-h-screen flex-col bg-arcade-cream text-ink-black font-arcade">
      {/* Marquee bar */}
      <div className="marquee-sheen flex h-9 items-center justify-center px-4">
        <p className="text-[14px] font-normal leading-[1.43] text-ink-black">
          KIN. STORE. COUPONS. FREE SHIPPING THROUGH SPACETIME.
        </p>
      </div>

      {/* Header */}
      <header className="border-b border-ink-black bg-arcade-cream px-6 py-3">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between">
          <Link href="/" className="text-[18px] font-bold leading-[1.56] text-ink-black">
            ✚ QuantumStore
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1200px] flex-1 px-6 py-[44px]">
        <h1 className="mb-4 text-[18px] font-bold leading-[1.56] text-ink-black">
          ORDER CONFIRMED
        </h1>
        <p className="mb-[44px] max-w-md text-[16px] font-normal leading-[1.5] text-ink-black">
          Thank you, {order.name}. Your order is on its way.
        </p>

        {/* Order details — all Arcade font, no serif */}
        <div className="max-w-md space-y-2 rounded-[12px] border border-pixel-gray bg-arcade-cream p-3">
          <div className="flex justify-between">
            <span className="text-[14px] font-normal leading-[1.43] text-ink-black">ORDER ID</span>
            <span className="text-[14px] font-bold leading-[1.43] text-ink-black">
              {order.orderId}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[14px] font-normal leading-[1.43] text-ink-black">EMAIL</span>
            <span className="text-[14px] font-normal leading-[1.43] text-ink-black">{order.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[14px] font-normal leading-[1.43] text-ink-black">SHIP TO</span>
            <span className="max-w-[200px] truncate text-[14px] font-normal leading-[1.43] text-ink-black">
              {order.address}
            </span>
          </div>
        </div>

        {/* Ghost button — back to store */}
        <Link
          href="/"
          className="mt-6 inline-block rounded-[6px] border border-ink-black bg-transparent px-3 py-1 text-[14px] font-normal leading-[1.43] text-ink-black shadow-[inset_0_1px_0_0_#f3e5df] transition hover:bg-ink-black hover:text-arcade-cream"
        >
          ← BACK TO STORE
        </Link>
      </main>

      {/* Footer */}
      <footer className="border-t border-pixel-gray bg-arcade-cream px-6 py-4">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between">
          <p className="text-[14px] font-normal leading-[1.43] text-ink-black">
            © QUANTUMSTORE 2026
          </p>
          <div className="flex gap-6">
            <span className="text-[14px] font-bold leading-[1.43] text-ink-black">
              BUILT WITH DEVIN
            </span>
            <span className="text-[14px] font-bold leading-[1.43] text-ink-black">
              VERIFIED WITH KANE
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
