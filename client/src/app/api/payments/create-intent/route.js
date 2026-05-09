import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import stripe from "@/lib/stripe";
import Order from "@/models/Order";
import { protect } from "@/middleware/auth";
import { sendSuccess, sendError } from "@/lib/response";

// POST /api/payments/create-intent - Create Stripe payment intent
export async function POST(request) {
  try {
    const authCheck = await protect(request);
    if (!authCheck.authenticated) {
      return authCheck.response;
    }

    await connectDB();

    const { amount, orderId } = await request.json();

    if (!amount || !orderId) {
      return sendError("Amount and order ID are required", 400);
    }

    // Verify order exists and belongs to user
    const order = await Order.findOne({
      _id: orderId,
      user: authCheck.user._id,
    });

    if (!order) {
      return sendError("Order not found", 404);
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: "usd",
      metadata: {
        orderId: orderId.toString(),
        userId: authCheck.user._id.toString(),
      },
    });

    // Update order with payment intent ID
    order.paymentInfo.stripePaymentIntentId = paymentIntent.id;
    await order.save();

    return sendSuccess(
      {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      },
      200,
      "Payment intent created",
    );
  } catch (error) {
    console.error("Create payment intent error:", error);
    return sendError(error.message || "Failed to create payment intent", 500);
  }
}
