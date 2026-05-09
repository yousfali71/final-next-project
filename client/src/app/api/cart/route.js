import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Cart from "@/models/Cart";
import Product from "@/models/Product";
import { protect } from "@/middleware/auth";
import { sendSuccess, sendError } from "@/lib/response";

// GET /api/cart - Get user's cart
export async function GET(request) {
  try {
    const authCheck = await protect(request);
    if (!authCheck.authenticated) {
      return authCheck.response;
    }

    await connectDB();

    let cart = await Cart.findOne({ user: authCheck.user._id }).populate(
      "items.product",
    );

    if (!cart) {
      cart = await Cart.create({ user: authCheck.user._id, items: [] });
    }

    return sendSuccess({ cart });
  } catch (error) {
    console.error("Get cart error:", error);
    return sendError(error.message || "Failed to get cart", 500);
  }
}

// POST /api/cart - Add item to cart
export async function POST(request) {
  try {
    const authCheck = await protect(request);
    if (!authCheck.authenticated) {
      return authCheck.response;
    }

    await connectDB();

    const { productId, quantity } = await request.json();

    if (!productId || !quantity) {
      return sendError("Product ID and quantity are required", 400);
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return sendError("Product not found", 404);
    }

    if (product.stock < quantity) {
      return sendError("Insufficient stock", 400);
    }

    // Get or create cart
    let cart = await Cart.findOne({ user: authCheck.user._id });
    if (!cart) {
      cart = new Cart({ user: authCheck.user._id, items: [] });
    }

    // Check if product already in cart
    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId,
    );

    const price = product.discountPrice || product.price;

    if (existingItemIndex > -1) {
      // Update quantity
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.items.push({ product: productId, quantity, price });
    }

    await cart.save();
    await cart.populate("items.product");

    return sendSuccess({ cart }, 200, "Item added to cart");
  } catch (error) {
    console.error("Add to cart error:", error);
    return sendError(error.message || "Failed to add item to cart", 500);
  }
}

// PUT /api/cart - Update cart item quantity
export async function PUT(request) {
  try {
    const authCheck = await protect(request);
    if (!authCheck.authenticated) {
      return authCheck.response;
    }

    await connectDB();

    const { productId, quantity } = await request.json();

    if (!productId || quantity === undefined) {
      return sendError("Product ID and quantity are required", 400);
    }

    const cart = await Cart.findOne({ user: authCheck.user._id });
    if (!cart) {
      return sendError("Cart not found", 404);
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId,
    );

    if (itemIndex === -1) {
      return sendError("Item not found in cart", 404);
    }

    if (quantity === 0) {
      // Remove item if quantity is 0
      cart.items.splice(itemIndex, 1);
    } else {
      // Update quantity
      cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();
    await cart.populate("items.product");

    return sendSuccess({ cart }, 200, "Cart updated");
  } catch (error) {
    console.error("Update cart error:", error);
    return sendError(error.message || "Failed to update cart", 500);
  }
}

// DELETE /api/cart - Clear cart
export async function DELETE(request) {
  try {
    const authCheck = await protect(request);
    if (!authCheck.authenticated) {
      return authCheck.response;
    }

    await connectDB();

    const cart = await Cart.findOne({ user: authCheck.user._id });
    if (!cart) {
      return sendError("Cart not found", 404);
    }

    cart.items = [];
    await cart.save();

    return sendSuccess({ cart }, 200, "Cart cleared");
  } catch (error) {
    console.error("Clear cart error:", error);
    return sendError(error.message || "Failed to clear cart", 500);
  }
}
