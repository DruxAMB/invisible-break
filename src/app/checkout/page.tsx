import { Suspense } from "react";
import { submitCheckout } from "@/lib/actions";
import { CheckoutForm } from "./CheckoutForm";

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-studio-charcoal">
          <p className="font-times text-sm text-ash-gray">Loading checkout…</p>
        </div>
      }
    >
      <CheckoutForm submitAction={submitCheckout} />
    </Suspense>
  );
}
