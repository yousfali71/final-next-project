"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard, Lock } from "lucide-react";
import api from "@/services/api";
import toast from "react-hot-toast";

// Initialize Stripe
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
    "pk_test_51Oxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
);

function CheckoutForm({ orderData, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    try {
      // Create order first
      const orderResponse = await api.post("/orders", orderData);
      const order = orderResponse.data.data;

      // Create payment intent
      const paymentIntentResponse = await api.post(
        "/orders/create-payment-intent",
        {
          amount: order.totalPrice,
        },
      );

      const { clientSecret } = paymentIntentResponse.data.data;

      // Confirm card payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
          },
        },
      );

      if (error) {
        toast.error(error.message);
        setProcessing(false);
        return;
      }

      if (paymentIntent.status === "succeeded") {
        // Update order payment status
        await api.put(`/orders/${order._id}/payment`, {
          paymentIntentId: paymentIntent.id,
          status: "paid",
        });

        // If coupon was used, increment usage count
        if (orderData.couponId) {
          try {
            await api.put(`/coupons/${orderData.couponId}/use`);
          } catch (couponError) {
            console.error("Error updating coupon usage:", couponError);
            // Don't fail the payment if coupon update fails
          }
        }

        toast.success("Payment successful!");
        onSuccess(order._id);
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(error.response?.data?.message || "Payment failed");
      setProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: "16px",
        color: "#424770",
        "::placeholder": {
          color: "#aab7c4",
        },
        fontFamily: "system-ui, -apple-system, sans-serif",
      },
      invalid: {
        color: "#9e2146",
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Card Element */}
      <div>
        <label className="block text-sm font-medium mb-3">
          Card Information
        </label>
        <div className="p-4 border border-border rounded-lg bg-white">
          <CardElement options={cardElementOptions} />
        </div>
        <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
          <Lock className="h-3 w-3" />
          <span>Your payment information is secure and encrypted</span>
        </div>
      </div>

      {/* Security Badges */}
      <div className="flex items-center justify-center gap-4 py-4 border-t border-b border-border">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg"
          alt="Stripe"
          className="h-6 opacity-60"
        />
        <div className="text-xs text-muted-foreground">Powered by Stripe</div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={!stripe || processing}
        className="w-full h-12 gradient-primary"
      >
        {processing ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <CreditCard className="h-5 w-5 mr-2" />
            Pay ${orderData.totalPrice}
          </>
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        By completing your purchase, you agree to our Terms of Service and
        Privacy Policy.
      </p>
    </form>
  );
}

export default function StripePaymentForm({ orderData, onSuccess }) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm orderData={orderData} onSuccess={onSuccess} />
    </Elements>
  );
}
