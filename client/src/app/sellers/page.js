"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Container from "@/components/shared/Container";
import { Loader2, Store, Package, Star, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/services/api";
import toast from "react-hot-toast";

export default function SellersPage() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSellers();
  }, []);

  const fetchSellers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/sellers");
      setSellers(response.data.data || []);
    } catch (error) {
      console.error("Error fetching sellers:", error);
      toast.error("Failed to load sellers");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <div className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5" />
          <Container className="relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center space-y-4"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                <Store className="h-4 w-4" />
                Trusted Sellers
              </div>
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
                <span className="gradient-text">Meet Our Sellers</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Discover quality products from verified sellers around the world
              </p>
            </motion.div>
          </Container>
        </div>

        {/* Sellers Grid */}
        <Container className="py-16">
          {sellers.length === 0 ? (
            <div className="text-center py-20">
              <Store className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-xl text-muted-foreground">No sellers found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sellers.map((seller, index) => (
                <motion.div
                  key={seller._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="glass rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  <div className="p-8 space-y-6">
                    {/* Seller Avatar */}
                    <div className="flex flex-col items-center text-center space-y-4">
                      {seller.avatar?.url ? (
                        <img
                          src={seller.avatar.url}
                          alt={seller.name}
                          className="w-24 h-24 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                          <Store className="h-12 w-12 text-primary" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-xl font-bold mb-1">
                          {seller.name}
                        </h3>
                        {seller.email && (
                          <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                            <Mail className="h-3 w-3" />
                            {seller.email}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Seller Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 rounded-xl bg-primary/5">
                        <Package className="h-5 w-5 mx-auto mb-2 text-primary" />
                        <p className="text-2xl font-bold">
                          {seller.productCount || 0}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Products
                        </p>
                      </div>
                      <div className="text-center p-4 rounded-xl bg-primary/5">
                        <Star className="h-5 w-5 mx-auto mb-2 text-primary" />
                        <p className="text-2xl font-bold">
                          {seller.rating || "N/A"}
                        </p>
                        <p className="text-xs text-muted-foreground">Rating</p>
                      </div>
                    </div>

                    {/* View Products Button */}
                    <Button asChild className="w-full gradient-primary">
                      <Link href={`/products?seller=${seller._id}`}>
                        View Products
                      </Link>
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Container>

        {/* Become a Seller CTA */}
        <div className="py-20 bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="glass rounded-3xl p-12 text-center space-y-6"
            >
              <h2 className="text-4xl font-bold">
                <span className="gradient-text">Become a Seller</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Join our growing community of sellers and reach millions of
                customers worldwide
              </p>
              <Button size="lg" className="gradient-primary" asChild>
                <Link href="/register">Get Started</Link>
              </Button>
            </motion.div>
          </Container>
        </div>
      </main>
      <Footer />
    </div>
  );
}
