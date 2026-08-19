import { Suspense } from "react";
import { submitCheckout } from "@/lib/actions";
import { CheckoutForm } from "./CheckoutForm";

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <p className="text-zinc-400">Loading checkout…</p>
      </div>
    }>
      <CheckoutForm submitAction={submitCheckout} />
    </Suspense>
  );
}
