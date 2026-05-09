"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Container from "@/components/shared/Container";
import { ArrowRight, Sparkles, ShoppingBag, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  const features = [
    {
      icon: Sparkles,
      text: "Premium Quality",
    },
    {
      icon: ShoppingBag,
      text: "Curated Selection",
    },
    {
      icon: TrendingUp,
      text: "Trending Styles",
    },
  ];

  return (
    <section className="relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <Container>
        <div className="grid lg:grid-cols-2 gap-12 items-center py-20 lg:py-32">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-border/40"
            >
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">
                Premium Marketplace Experience
              </span>
            </motion.div>

            {/* Heading */}
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-7xl font-bold tracking-tight leading-tight">
                Discover
                <span className="gradient-text block">Luxury Shopping</span>
              </h1>
              <p className="text-lg lg:text-xl text-muted-foreground max-w-lg">
                Experience premium products from trusted sellers worldwide.
                Curated collections that define elegance and quality.
              </p>
            </div>

            {/* Features */}
            <div className="flex flex-wrap gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.text}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="flex items-center gap-2"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="font-medium">{feature.text}</span>
                  </motion.div>
                );
              })}
            </div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-wrap gap-4"
            >
              <Button
                asChild
                size="lg"
                className="gradient-primary text-lg h-12 px-8"
              >
                <Link href="/products">
                  Explore Products
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="text-lg h-12 px-8"
              >
                <Link href="/sellers">Browse Sellers</Link>
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="grid grid-cols-3 gap-8 pt-8 border-t border-border/40"
            >
              <div>
                <div className="text-3xl font-bold gradient-text">10K+</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Products
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold gradient-text">500+</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Sellers
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold gradient-text">50K+</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Customers
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content - Image Grid */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative hidden lg:block"
          >
            <div className="grid grid-cols-2 gap-4">
              {/* Image Placeholder 1 */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-4"
              >
                <div className="aspect-square rounded-2xl glass p-8 flex items-center justify-center border border-border/40 overflow-hidden relative group">
                  <div className="absolute inset-0 gradient-primary opacity-5 group-hover:opacity-10 transition-opacity" />
                  <div className="text-center z-10">
                    <ShoppingBag className="h-16 w-16 mx-auto text-primary mb-4" />
                    <p className="font-semibold">Fashion</p>
                  </div>
                </div>
                <div className="aspect-[4/5] rounded-2xl glass p-8 flex items-center justify-center border border-border/40 overflow-hidden relative group">
                  <div className="absolute inset-0 gradient-primary opacity-5 group-hover:opacity-10 transition-opacity" />
                  <div className="text-center z-10">
                    <Sparkles className="h-16 w-16 mx-auto text-primary mb-4" />
                    <p className="font-semibold">Jewelry</p>
                  </div>
                </div>
              </motion.div>

              {/* Image Placeholder 2 */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-4 pt-12"
              >
                <div className="aspect-[4/5] rounded-2xl glass p-8 flex items-center justify-center border border-border/40 overflow-hidden relative group">
                  <div className="absolute inset-0 gradient-primary opacity-5 group-hover:opacity-10 transition-opacity" />
                  <div className="text-center z-10">
                    <TrendingUp className="h-16 w-16 mx-auto text-primary mb-4" />
                    <p className="font-semibold">Electronics</p>
                  </div>
                </div>
                <div className="aspect-square rounded-2xl glass p-8 flex items-center justify-center border border-border/40 overflow-hidden relative group">
                  <div className="absolute inset-0 gradient-primary opacity-5 group-hover:opacity-10 transition-opacity" />
                  <div className="text-center z-10">
                    <ShoppingBag className="h-16 w-16 mx-auto text-primary mb-4" />
                    <p className="font-semibold">Home</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Floating Elements */}
            <motion.div
              animate={{
                y: [0, -20, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -top-4 -right-4 w-24 h-24 gradient-primary rounded-2xl opacity-20 blur-xl"
            />
            <motion.div
              animate={{
                y: [0, 20, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -bottom-4 -left-4 w-32 h-32 bg-purple-500 rounded-2xl opacity-20 blur-xl"
            />
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
