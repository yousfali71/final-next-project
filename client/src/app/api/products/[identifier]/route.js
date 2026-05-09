import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";
import Review from "@/models/Review";
import { sendSuccess, sendError } from "@/lib/response";

// GET /api/products/[identifier] - Get single product by ID or slug
export async function GET(request, { params }) {
  try {
    await connectDB();

    const { identifier } = params;

    // Try to find by ID first, then by slug
    let product;
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(identifier);
    } else {
      product = await Product.findOne({ slug: identifier });
    }

    if (!product) {
      return sendError("Product not found", 404);
    }

    // Populate related data
    await product.populate("category", "name slug");
    await product.populate("seller", "name avatar");
    await product.populate({
      path: "reviews",
      populate: { path: "user", select: "name avatar" },
      options: { sort: { createdAt: -1 }, limit: 10 },
    });

    return sendSuccess({ product });
  } catch (error) {
    console.error("Get product error:", error);
    return sendError(error.message || "Failed to get product", 500);
  }
}
