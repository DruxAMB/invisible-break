import { Suspense } from "react";
import { submitCheckout } from "@/lib/actions";
import { CheckoutForm } from "./CheckoutForm";

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-arcade-cream">
          <p className="font-arcade text-[16px] font-normal leading-[1.5] text-ink-black">
            Loading checkout…
          </p>
        </div>
      }
    >
      <CheckoutForm submitAction={submitCheckout} />
    </Suspense>
  );
}
