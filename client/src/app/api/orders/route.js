import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import Cart from "@/models/Cart";
import Product from "@/models/Product";
import { protect } from "@/middleware/auth";
import { sendSuccess, sendError } from "@/lib/response";

// GET /api/orders - Get user's orders
export async function GET(request) {
  try {
    const authCheck = await protect(request);
    if (!authCheck.authenticated) {
      return authCheck.response;
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ user: authCheck.user._id })
      .populate("products.product")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments({ user: authCheck.user._id });

    return sendSuccess({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get orders error:", error);
    return sendError(error.message || "Failed to get orders", 500);
  }
}

// POST /api/orders - Create new order
export async function POST(request) {
  try {
    const authCheck = await protect(request);
    if (!authCheck.authenticated) {
      return authCheck.response;
    }

    await connectDB();

    const { products, shippingAddress, paymentMethod } = await request.json();

    if (!products || !shippingAddress || !paymentMethod) {
      return sendError("Missing required fields", 400);
    }

    // Calculate totals
    let subtotal = 0;
    const orderProducts = [];

    for (const item of products) {
      const product = await Product.findById(item.product);
      if (!product) {
        return sendError(`Product ${item.product} not found`, 404);
      }

      if (product.stock < item.quantity) {
        return sendError(
          `Insufficient stock for product: ${product.title}`,
          400,
        );
      }

      const price = product.discountPrice || product.price;
      subtotal += price * item.quantity;

      orderProducts.push({
        product: product._id,
        quantity: item.quantity,
        price,
        seller: product.seller,
      });

      // Update product stock
      product.stock -= item.quantity;
      await product.save();
    }

    const shippingFee = subtotal > 50 ? 0 : 5; // Free shipping over $50
    const totalPrice = subtotal + shippingFee;

    // Create order
    const order = await Order.create({
      user: authCheck.user._id,
      products: orderProducts,
      shippingAddress,
      paymentMethod,
      paymentStatus: paymentMethod === "cod" ? "pending" : "pending",
      subtotal,
      shippingFee,
      totalPrice,
    });

    // Clear user's cart
    await Cart.findOneAndUpdate(
      { user: authCheck.user._id },
      { items: [], totalItems: 0, totalPrice: 0 },
    );

    await order.populate("products.product");

    return sendSuccess({ order }, 201, "Order created successfully");
  } catch (error) {
    console.error("Create order error:", error);
    return sendError(error.message || "Failed to create order", 500);
  }
}
