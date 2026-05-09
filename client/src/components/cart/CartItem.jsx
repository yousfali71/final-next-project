"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import useCartStore from "@/store/useCartStore";
import { useState } from "react";

export default function CartItem({ item }) {
  const { updateQuantity, removeFromCart } = useCartStore();
  const [isUpdating, setIsUpdating] = useState(false);

  const product = item.product;
  const finalPrice = product.discountPrice || product.price;

  const handleQuantityChange = async (newQuantity) => {
    if (newQuantity < 1 || newQuantity > product.stock) return;

    setIsUpdating(true);
    await updateQuantity(product._id, newQuantity);
    setIsUpdating(false);
  };

  const handleRemove = async () => {
    setIsUpdating(true);
    await removeFromCart(product._id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="glass rounded-xl p-4 border border-border/40 hover:border-primary/50 transition-all"
    >
      <div className="flex gap-4">
        {/* Image */}
        <Link
          href={`/products/${product.slug || product._id}`}
          className="flex-shrink-0"
        >
          <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-slate-100">
            {product.images && product.images.length > 0 ? (
              <Image
                src={product.images[0].url}
                alt={product.title}
                fill
                className="object-cover hover:scale-110 transition-transform"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-muted-foreground text-xs">No Image</span>
              </div>
            )}
          </div>
        </Link>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between gap-4">
            <div className="flex-1 min-w-0">
              <Link href={`/products/${product.slug || product._id}`}>
                <h3 className="font-semibold line-clamp-2 hover:text-primary transition-colors">
                  {product.title}
                </h3>
              </Link>

              <p className="text-sm text-muted-foreground mt-1">
                Price: ${finalPrice.toFixed(2)}
              </p>

              {product.stock < 10 && product.stock > 0 && (
                <p className="text-xs text-orange-600 mt-1">
                  Only {product.stock} left in stock
                </p>
              )}

              {product.stock === 0 && (
                <p className="text-xs text-red-600 mt-1">Out of stock</p>
              )}
            </div>

            {/* Price */}
            <div className="text-right">
              <p className="text-lg font-bold gradient-text">
                ${(finalPrice * item.quantity).toFixed(2)}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between mt-4">
            {/* Quantity Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleQuantityChange(item.quantity - 1)}
                disabled={isUpdating || item.quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>

              <span className="text-sm font-medium w-8 text-center">
                {item.quantity}
              </span>

              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleQuantityChange(item.quantity + 1)}
                disabled={isUpdating || item.quantity >= product.stock}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Remove Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              disabled={isUpdating}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Remove
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
