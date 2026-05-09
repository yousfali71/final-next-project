"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart, Star, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import useCartStore from "@/store/useCartStore";
import useWishlistStore from "@/store/useWishlistStore";
import useAuthStore from "@/store/useAuthStore";

export default function ProductCard({ product, listView = false }) {
  const { isAuthenticated } = useAuthStore();
  const { addToCart } = useCartStore();
  const { isInWishlist, addToWishlist, removeFromWishlist } =
    useWishlistStore();
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      setIsWishlisted(isInWishlist(product._id));
    }
  }, [isAuthenticated, product._id, isInWishlist]);

  const discount = product.discountPrice
    ? Math.round(
        ((product.price - product.discountPrice) / product.price) * 100,
      )
    : 0;

  const finalPrice = product.discountPrice || product.price;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }
    await addToCart(product._id, 1);
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }

    if (isWishlisted) {
      await removeFromWishlist(product._id);
      setIsWishlisted(false);
    } else {
      await addToWishlist(product._id);
      setIsWishlisted(true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative"
    >
      <Link href={`/products/${product.slug || product._id}`}>
        <div
          className={`glass rounded-2xl overflow-hidden border border-border/40 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 ${
            listView ? "flex flex-row" : ""
          }`}
        >
          {/* Image Container */}
          <div
            className={`relative overflow-hidden bg-slate-100 ${
              listView ? "w-48 h-48 flex-shrink-0" : "aspect-square"
            }`}
          >
            {product.images && product.images.length > 0 ? (
              <Image
                src={product.images[0].url}
                alt={product.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                <div className="text-center text-muted-foreground">
                  <ShoppingCart className="h-16 w-16 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">No Image</p>
                </div>
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {discount > 0 && (
                <div className="px-3 py-1 rounded-full gradient-primary text-white text-xs font-semibold">
                  -{discount}%
                </div>
              )}
              {product.featured && (
                <div className="px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-semibold">
                  Featured
                </div>
              )}
              {product.stock === 0 && (
                <div className="px-3 py-1 rounded-full bg-red-500 text-white text-xs font-semibold">
                  Out of Stock
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={handleWishlist}
                className={`w-9 h-9 rounded-full ${
                  isWishlisted
                    ? "bg-red-500 text-white"
                    : "bg-white/90 text-slate-700"
                } flex items-center justify-center hover:scale-110 transition-transform shadow-lg`}
              >
                <Heart
                  className="h-4 w-4"
                  fill={isWishlisted ? "currentColor" : "none"}
                />
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                }}
                className="w-9 h-9 rounded-full bg-white/90 text-slate-700 flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
              >
                <Eye className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div
            className={`p-4 space-y-3 ${listView ? "flex-1 flex flex-col justify-between" : ""}`}
          >
            <div className="space-y-3">
              {/* Category & Brand */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {product.category?.name && (
                  <>
                    <span>{product.category.name}</span>
                    {product.brand && <span>•</span>}
                  </>
                )}
                {product.brand && <span>{product.brand}</span>}
              </div>

              {/* Title */}
              <h3
                className={`font-semibold group-hover:text-primary transition-colors ${listView ? "text-lg line-clamp-2" : "text-base line-clamp-2"}`}
              >
                {product.title}
              </h3>

              {/* Description in list view */}
              {listView && product.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {product.description}
                </p>
              )}

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(product.ratings?.average || 0)
                          ? "text-amber-400 fill-amber-400"
                          : "text-slate-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">
                  {product.ratings?.average?.toFixed(1) || "0.0"} (
                  {product.ratings?.count || 0})
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold gradient-text">
                  ${finalPrice.toFixed(2)}
                </span>
                {product.discountPrice && (
                  <span className="text-sm text-muted-foreground line-through">
                    ${product.price.toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            {/* Add to Cart Button */}
            <Button
              className="w-full gradient-primary"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              {product.stock === 0 ? (
                "Out of Stock"
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </>
              )}
            </Button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
