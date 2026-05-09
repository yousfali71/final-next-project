"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Container from "@/components/shared/Container";
import ProductCard from "@/components/products/ProductCard";
import { Button } from "@/components/ui/button";
import { Heart, Loader2, ArrowRight, ShoppingCart } from "lucide-react";
import useWishlistStore from "@/store/useWishlistStore";
import useAuthStore from "@/store/useAuthStore";

export default function WishlistPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { wishlist, isLoading, fetchWishlist } = useWishlistStore();

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchWishlist();
    }
  }, [authLoading, isAuthenticated]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Container>
            <div className="text-center glass rounded-2xl p-12 border border-border/40 max-w-md mx-auto">
              <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-2xl font-bold mb-2">Login Required</h2>
              <p className="text-muted-foreground mb-6">
                Please login to view your wishlist
              </p>
              <div className="flex gap-3 justify-center">
                <Button asChild variant="outline">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild className="gradient-primary">
                  <Link href="/register">Register</Link>
                </Button>
              </div>
            </div>
          </Container>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <Navbar />

      <main className="flex-1 py-12">
        <Container>
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4">
              My <span className="gradient-text">Wishlist</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              {wishlist.length > 0
                ? `You have ${wishlist.length} item${wishlist.length > 1 ? "s" : ""} in your wishlist`
                : "Your wishlist is empty"}
            </p>
          </div>

          {wishlist.length === 0 ? (
            /* Empty Wishlist */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center glass rounded-2xl p-12 border border-border/40"
            >
              <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                <Heart className="h-10 w-10 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Your wishlist is empty
              </h3>
              <p className="text-muted-foreground mb-6">
                Save your favorite products for later
              </p>
              <Button asChild size="lg" className="gradient-primary">
                <Link href="/products">
                  Browse Products
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </motion.div>
          ) : (
            /* Wishlist Items */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlist.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          )}
        </Container>
      </main>

      <Footer />
    </div>
  );
}
