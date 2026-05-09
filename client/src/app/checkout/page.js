"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Container from "@/components/shared/Container";
import { Button } from "@/components/ui/button";
import StripePaymentForm from "@/components/checkout/StripePaymentForm";
import {
  CreditCard,
  Truck,
  ShieldCheck,
  Loader2,
  ChevronRight,
  ChevronLeft,
  MapPin,
} from "lucide-react";
import useCartStore from "@/store/useCartStore";
import useAuthStore from "@/store/useAuthStore";
import api from "@/services/api";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const { items, totalItems, totalPrice, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Review

  // Form data
  const [shippingData, setShippingData] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "United States",
  });

  const [paymentMethod, setPaymentMethod] = useState("card");
  const [notes, setNotes] = useState("");
  
  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (totalItems === 0) {
      toast.error("Your cart is empty");
      router.push("/cart");
      return;
    }

    // Pre-fill with user's default address if available
    if (user?.addresses && user.addresses.length > 0) {
      const defaultAddress =
        user.addresses.find((addr) => addr.isDefault) || user.addresses[0];
      setShippingData({
        fullName: defaultAddress.fullName,
        phone: defaultAddress.phone,
        addressLine1: defaultAddress.addressLine1,
        addressLine2: defaultAddress.addressLine2 || "",
        city: defaultAddress.city,
        state: defaultAddress.state,
        postalCode: defaultAddress.postalCode,
        country: defaultAddress.country,
      });
    } else if (user) {
      setShippingData((prev) => ({
        ...prev,
        fullName: user.name,
      }));
    }
  }, [isAuthenticated, totalItems, router, user]);

  const handleShippingChange = (e) => {
    setShippingData({
      ...shippingData,
      [e.target.name]: e.target.value,
    });
  };

  const validateShipping = () => {
    const required = [
      "fullName",
      "phone",
      "addressLine1",
      "city",
      "state",
      "postalCode",
      "country",
    ];

    for (const field of required) {
      if (!shippingData[field] || shippingData[field].trim() === "") {
        toast.error(
          `Please fill in ${field.replace(/([A-Z])/g, " $1").toLowerCase()}`,
        );
        return false;
      }
    }

    return true;
  };

  const handleNextStep = () => {
    if (step === 1 && !validateShipping()) {
      return;
    }

    if (step < 3) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    setCouponLoading(true);
    try {
      const categoryIds = items.map((item) => item.product?.category?._id).filter(Boolean);
      
      const response = await api.post("/coupons/validate", {
        code: couponCode,
        cartTotal: subtotal,
        categoryIds,
      });

      setAppliedCoupon(response.data.data);
      toast.success(response.data.message);
    } catch (error) {
      console.error("Coupon error:", error);
      toast.error(error.response?.data?.message || "Invalid coupon code");
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    toast.success("Coupon removed");
  };

  const handlePlaceOrder = async () => {
    if (!validateShipping()) {
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        shippingAddress: shippingData,
        paymentMethod,
        notes,
        ...(appliedCoupon && { couponId: appliedCoupon.couponId }),
      };

      // For COD, create order directly
      if (paymentMethod === "cod") {
        const response = await api.post("/orders", orderData);
        
        // If coupon was used, increment usage count
        if (appliedCoupon) {
          await api.put(`/coupons/${appliedCoupon.couponId}/use`);
        }
        
        toast.success("Order placed successfully!");
        await clearCart();
        router.push(`/orders/${response.data.data._id}`);
      }
      // For card payment, the StripePaymentForm component handles it
    } catch (error) {
      console.error("Order error:", error);
      toast.error(error.response?.data?.message || "Failed to place order");
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (orderId) => {
    clearCart();
    router.push(`/orders/${orderId}`);
  };

  // Calculate totals
  const subtotal = totalPrice;
  const shippingFee = subtotal >= 100 ? 0 : 10;
  const tax = (subtotal * 0.1).toFixed(2);
  const total = (subtotal + shippingFee + parseFloat(tax)).toFixed(2);

  if (!isAuthenticated || totalItems === 0) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <Navbar />

      <main className="flex-1 py-12">
        <Container>
          {/* Progress Steps */}
          <div className="mb-12">
            <div className="flex items-center justify-center gap-4">
              {[
                { num: 1, label: "Shipping" },
                { num: 2, label: "Payment" },
                { num: 3, label: "Review" },
              ].map((s, idx) => (
                <div key={s.num} className="flex items-center">
                  <div
                    className={`flex items-center gap-3 ${
                      step >= s.num ? "opacity-100" : "opacity-40"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                        step >= s.num
                          ? "gradient-primary text-white"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {s.num}
                    </div>
                    <span className="hidden sm:inline font-medium">
                      {s.label}
                    </span>
                  </div>
                  {idx < 2 && (
                    <ChevronRight className="h-5 w-5 mx-2 text-slate-400" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-6 md:p-8"
              >
                {/* Step 1: Shipping Address */}
                {step === 1 && (
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <MapPin className="h-6 w-6 text-primary" />
                      <h2 className="text-2xl font-bold">Shipping Address</h2>
                    </div>

                    <div className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            name="fullName"
                            value={shippingData.fullName}
                            onChange={handleShippingChange}
                            className="w-full px-4 py-3 rounded-lg bg-white border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                            placeholder="John Doe"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Phone Number *
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={shippingData.phone}
                            onChange={handleShippingChange}
                            className="w-full px-4 py-3 rounded-lg bg-white border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                            placeholder="+1 (555) 123-4567"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Address Line 1 *
                        </label>
                        <input
                          type="text"
                          name="addressLine1"
                          value={shippingData.addressLine1}
                          onChange={handleShippingChange}
                          className="w-full px-4 py-3 rounded-lg bg-white border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                          placeholder="123 Main Street"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Address Line 2
                        </label>
                        <input
                          type="text"
                          name="addressLine2"
                          value={shippingData.addressLine2}
                          onChange={handleShippingChange}
                          className="w-full px-4 py-3 rounded-lg bg-white border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                          placeholder="Apartment, suite, etc. (optional)"
                        />
                      </div>

                      <div className="grid sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            City *
                          </label>
                          <input
                            type="text"
                            name="city"
                            value={shippingData.city}
                            onChange={handleShippingChange}
                            className="w-full px-4 py-3 rounded-lg bg-white border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                            placeholder="New York"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            State *
                          </label>
                          <input
                            type="text"
                            name="state"
                            value={shippingData.state}
                            onChange={handleShippingChange}
                            className="w-full px-4 py-3 rounded-lg bg-white border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                            placeholder="NY"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Postal Code *
                          </label>
                          <input
                            type="text"
                            name="postalCode"
                            value={shippingData.postalCode}
                            onChange={handleShippingChange}
                            className="w-full px-4 py-3 rounded-lg bg-white border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                            placeholder="10001"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Country *
                        </label>
                        <select
                          name="country"
                          value={shippingData.country}
                          onChange={handleShippingChange}
                          className="w-full px-4 py-3 rounded-lg bg-white border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        >
                          <option value="United States">United States</option>
                          <option value="Canada">Canada</option>
                          <option value="United Kingdom">United Kingdom</option>
                          <option value="Australia">Australia</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Payment Method */}
                {step === 2 && (
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <CreditCard className="h-6 w-6 text-primary" />
                      <h2 className="text-2xl font-bold">Payment Method</h2>
                    </div>

                    <div className="space-y-4">
                      <div
                        onClick={() => setPaymentMethod("card")}
                        className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                          paymentMethod === "card"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                              <CreditCard className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold">
                                Credit/Debit Card
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                Pay securely with Stripe
                              </p>
                            </div>
                          </div>
                          <div
                            className={`w-6 h-6 rounded-full border-2 ${
                              paymentMethod === "card"
                                ? "border-primary bg-primary"
                                : "border-border"
                            } flex items-center justify-center`}
                          >
                            {paymentMethod === "card" && (
                              <div className="w-3 h-3 rounded-full bg-white" />
                            )}
                          </div>
                        </div>
                      </div>

                      <div
                        onClick={() => setPaymentMethod("cod")}
                        className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                          paymentMethod === "cod"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                              <Truck className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold">
                                Cash on Delivery
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                Pay when you receive
                              </p>
                            </div>
                          </div>
                          <div
                            className={`w-6 h-6 rounded-full border-2 ${
                              paymentMethod === "cod"
                                ? "border-primary bg-primary"
                                : "border-border"
                            } flex items-center justify-center`}
                          >
                            {paymentMethod === "cod" && (
                              <div className="w-3 h-3 rounded-full bg-white" />
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-6">
                        <label className="block text-sm font-medium mb-2">
                          Order Notes (Optional)
                        </label>
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          rows="3"
                          className="w-full px-4 py-3 rounded-lg bg-white border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                          placeholder="Any special instructions for your order?"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Review Order */}
                {step === 3 && (
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <ShieldCheck className="h-6 w-6 text-primary" />
                      <h2 className="text-2xl font-bold">Review Order</h2>
                    </div>

                    <div className="space-y-6">
                      {/* Shipping Address */}
                      <div className="p-6 bg-slate-50 rounded-xl">
                        <h3 className="font-semibold mb-3">Shipping Address</h3>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p className="text-foreground font-medium">
                            {shippingData.fullName}
                          </p>
                          <p>{shippingData.phone}</p>
                          <p>{shippingData.addressLine1}</p>
                          {shippingData.addressLine2 && (
                            <p>{shippingData.addressLine2}</p>
                          )}
                          <p>
                            {shippingData.city}, {shippingData.state}{" "}
                            {shippingData.postalCode}
                          </p>
                          <p>{shippingData.country}</p>
                        </div>
                        <button
                          onClick={() => setStep(1)}
                          className="text-primary text-sm font-medium mt-3 hover:underline"
                        >
                          Edit Address
                        </button>
                      </div>

                      {/* Payment Method */}
                      <div className="p-6 bg-slate-50 rounded-xl">
                        <h3 className="font-semibold mb-3">Payment Method</h3>
                        <div className="flex items-center gap-3">
                          {paymentMethod === "card" ? (
                            <>
                              <CreditCard className="h-5 w-5 text-primary" />
                              <span className="text-sm">Credit/Debit Card</span>
                            </>
                          ) : (
                            <>
                              <Truck className="h-5 w-5 text-primary" />
                              <span className="text-sm">Cash on Delivery</span>
                            </>
                          )}
                        </div>
                        <button
                          onClick={() => setStep(2)}
                          className="text-primary text-sm font-medium mt-3 hover:underline"
                        >
                          Change Payment Method
                        </button>
                      </div>

                      {/* Order Items */}
                      <div className="p-6 bg-slate-50 rounded-xl">
                        <h3 className="font-semibold mb-4">
                          Order Items ({totalItems})
                        </h3>
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                          {items.map((item) => (
                            <div
                              key={item.product._id}
                              className="flex items-center gap-4"
                            >
                              <img
                                src={
                                  item.product.images[0]?.url ||
                                  "/placeholder.png"
                                }
                                alt={item.product.title}
                                className="w-16 h-16 rounded-lg object-cover"
                              />
                              <div className="flex-1">
                                <h4 className="font-medium text-sm line-clamp-1">
                                  {item.product.title}
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                  Qty: {item.quantity}
                                </p>
                              </div>
                              <span className="font-semibold">
                                ${(item.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {notes && (
                        <div className="p-6 bg-slate-50 rounded-xl">
                          <h3 className="font-semibold mb-2">Order Notes</h3>
                          <p className="text-sm text-muted-foreground">
                            {notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Payment Form for Card Payment */}
                {step === 3 && paymentMethod === "card" && (
                  <div className="mt-8 pt-8 border-t border-border">
                    <h3 className="text-xl font-semibold mb-6">
                      Payment Details
                    </h3>
                    <StripePaymentForm
                      orderData={{
                        shippingAddress: shippingData,
                        paymentMethod,
                        notes,
                        totalPrice: parseFloat(total),
                      }}
                      onSuccess={handlePaymentSuccess}
                    />
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
                  <Button
                    variant="outline"
                    onClick={handlePrevStep}
                    disabled={step === 1 || loading}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>

                  {step < 3 ? (
                    <Button
                      onClick={handleNextStep}
                      className="gradient-primary"
                    >
                      Continue
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  ) : paymentMethod === "cod" ? (
                    <Button
                      onClick={handlePlaceOrder}
                      disabled={loading}
                      className="gradient-primary"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>Place Order - ${total}</>
                      )}
                    </Button>
                  ) : null}
                </div>
              </motion.div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="glass rounded-2xl p-6 sticky top-24">
                {/* Coupon Input */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">
                    Coupon Code
                  </label>
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-green-800">
                          {appliedCoupon.code}
                        </p>
                        <p className="text-xs text-green-600">
                          Discount applied!
                        </p>
                      </div>
                      <button
                        onClick={handleRemoveCoupon}
                        className="text-xs text-red-600 hover:text-red-700 font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Enter code"
                        className="flex-1 px-4 py-2 rounded-lg bg-white border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                      <Button
                        onClick={handleApplyCoupon}
                        disabled={couponLoading}
                        variant="outline"
                      >
                        {couponLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Apply"
                        )}
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Subtotal ({totalItems} items)
                    </span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>

                  {appliedCoupon && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">Discount ({appliedCoupon.code})</span>
                      <span className="font-medium text-green-600">
                        -${discount.toFixed(2)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium">
                      {shippingFee === 0 ? (
                        <span className="text-green-600">FREE</span>
                      ) : (
                        `$${shippingFee.toFixed(2)}`
                      )}
                    </span>
                  </div>

                  {subtotalAfterDiscount < 100 && (
                    <div className="text-xs text-muted-foreground bg-blue-50 border border-blue-200 rounded-lg p-3">
                      Add ${(100 - subtotalAfterDiscount
                    <div className="text-xs text-muted-foreground bg-blue-50 border border-blue-200 rounded-lg p-3">
                      Add ${(100 - subtotal).toFixed(2)} more for free shipping!
                    </div>
                  )}

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax (10%)</span>
                    <span className="font-medium">${tax}</span>
                  </div>

                  <div className="h-px bg-border my-4" />

                  <div className="flex justify-between">
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-2xl font-bold gradient-text">
                      ${total}
                    </span>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="mt-8 pt-6 border-t border-border space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <ShieldCheck className="h-5 w-5 text-green-600" />
                    <span className="text-muted-foreground">
                      Secure checkout
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Truck className="h-5 w-5 text-blue-600" />
                    <span className="text-muted-foreground">
                      Free shipping over $100
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <CreditCard className="h-5 w-5 text-purple-600" />
                    <span className="text-muted-foreground">
                      Multiple payment options
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  );
}
