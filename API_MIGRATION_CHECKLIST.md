# API Routes Migration Checklist

This document tracks the migration status of all API routes from Express to Next.js.

## ✅ Completed Migrations

### Authentication Routes (`/api/auth/`)

- [x] POST `/register` - User registration
- [x] POST `/login` - User login
- [x] POST `/logout` - User logout
- [x] POST `/refresh` - Refresh access token
- [x] GET `/verify-email/:token` - Email verification
- [x] POST `/forgot-password` - Request password reset
- [x] POST `/reset-password` - Reset password
- [x] GET `/me` - Get current user
- [x] POST `/google` - Google OAuth

### Product Routes (`/api/products/`)

- [x] GET `/` - Get all products (with filters, search, pagination)
- [x] GET `/:identifier` - Get single product by ID or slug
- [ ] POST `/` - Create product (seller/admin)
- [ ] PUT `/:id` - Update product (seller/admin)
- [ ] DELETE `/:id` - Delete product (seller/admin)

### Cart Routes (`/api/cart/`)

- [x] GET `/` - Get user's cart
- [x] POST `/` - Add item to cart
- [x] PUT `/` - Update cart item quantity
- [x] DELETE `/` - Clear cart

### Order Routes (`/api/orders/`)

- [x] GET `/` - Get user's orders
- [x] POST `/` - Create new order
- [ ] GET `/:id` - Get single order
- [ ] PUT `/:id/cancel` - Cancel order
- [ ] PUT `/:id/status` - Update order status (admin/seller)

### Payment Routes (`/api/payments/`)

- [x] POST `/create-intent` - Create Stripe payment intent
- [ ] POST `/webhook` - Stripe webhook handler

## 🔄 Pending Migrations

### Category Routes (`/api/categories/`)

- [ ] GET `/` - Get all categories
- [ ] GET `/:id` - Get single category
- [ ] POST `/` - Create category (admin)
- [ ] PUT `/:id` - Update category (admin)
- [ ] DELETE `/:id` - Delete category (admin)

### Review Routes (`/api/reviews/`)

- [ ] GET `/` - Get reviews for a product
- [ ] GET `/:id` - Get single review
- [ ] POST `/` - Create review (authenticated)
- [ ] PUT `/:id` - Update review (owner)
- [ ] DELETE `/:id` - Delete review (owner/admin)

### Coupon Routes (`/api/coupons/`)

- [ ] GET `/` - Get all coupons (admin)
- [ ] POST `/validate` - Validate coupon code
- [ ] POST `/` - Create coupon (admin)
- [ ] PUT `/:id` - Update coupon (admin)
- [ ] DELETE `/:id` - Delete coupon (admin)

### Banner Routes (`/api/banners/`)

- [ ] GET `/` - Get all banners
- [ ] GET `/:id` - Get single banner
- [ ] POST `/` - Create banner (admin)
- [ ] PUT `/:id` - Update banner (admin)
- [ ] DELETE `/:id` - Delete banner (admin)

### Seller Routes (`/api/sellers/`)

- [ ] GET `/:id` - Get seller profile
- [ ] GET `/:id/products` - Get seller's products
- [ ] GET `/dashboard/stats` - Get seller dashboard stats
- [ ] GET `/orders` - Get seller's orders
- [ ] PUT `/profile` - Update seller profile

### Admin Routes (`/api/admin/`)

- [ ] GET `/dashboard` - Get admin dashboard stats
- [ ] GET `/users` - Get all users
- [ ] PUT `/users/:id/role` - Update user role
- [ ] DELETE `/users/:id` - Delete user
- [ ] GET `/products` - Get all products (including inactive)
- [ ] GET `/orders` - Get all orders

### User Routes (`/api/users/`)

- [ ] GET `/profile` - Get user profile
- [ ] PUT `/profile` - Update user profile
- [ ] PUT `/change-password` - Change password
- [ ] POST `/addresses` - Add address
- [ ] PUT `/addresses/:id` - Update address
- [ ] DELETE `/addresses/:id` - Delete address
- [ ] POST `/wishlist` - Add to wishlist
- [ ] DELETE `/wishlist/:productId` - Remove from wishlist
- [ ] GET `/wishlist` - Get wishlist

## 📊 Migration Progress

- **Completed:** 14 routes
- **Pending:** 33 routes
- **Total:** 47 routes
- **Progress:** 30%

## 🎯 Priority Order

### High Priority (Core Functionality)

1. Categories (required for product filtering)
2. Reviews (essential for e-commerce)
3. User profile management
4. Product CRUD for sellers

### Medium Priority

5. Seller dashboard
6. Coupons
7. Admin dashboard

### Low Priority

8. Banners
9. Advanced admin features

## 📝 Migration Template

Use this template for creating new routes:

```javascript
// Example: /api/categories/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Category from "@/models/Category";
import { protect, authorize } from "@/middleware/auth";
import { sendSuccess, sendError } from "@/lib/response";

export async function GET(request) {
  try {
    await connectDB();
    const categories = await Category.find({ isActive: true });
    return sendSuccess({ categories });
  } catch (error) {
    console.error("Get categories error:", error);
    return sendError(error.message || "Failed to get categories", 500);
  }
}

export async function POST(request) {
  try {
    const authCheck = await protect(request);
    if (!authCheck.authenticated) return authCheck.response;

    const roleCheck = authorize(authCheck.user, "admin");
    if (!roleCheck.authorized) return roleCheck.response;

    await connectDB();
    const body = await request.json();
    const category = await Category.create(body);

    return sendSuccess({ category }, 201, "Category created");
  } catch (error) {
    console.error("Create category error:", error);
    return sendError(error.message || "Failed to create category", 500);
  }
}
```

## 🔗 Useful Links

- [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) - Detailed migration guide
- [QUICKSTART.md](./QUICKSTART.md) - Quick start guide
- [Next.js API Routes Docs](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

---

**Note:** Check off items as you complete them. Update the progress counter after each completion.
