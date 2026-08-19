import { submitCheckout } from "@/lib/actions";
import { CheckoutForm } from "./CheckoutForm";

export default function CheckoutPage() {
  return <CheckoutForm submitAction={submitCheckout} />;
}
