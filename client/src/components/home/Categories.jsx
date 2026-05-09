"use client";

import { motion } from "framer-motion";
import Container from "@/components/shared/Container";
import {
  Smartphone,
  Laptop,
  Watch,
  ShoppingBag,
  Home,
  Sparkles,
  Shirt,
  Heart,
} from "lucide-react";
import Link from "next/link";

const categories = [
  {
    id: 1,
    name: "Electronics",
    icon: Laptop,
    count: "2.5K+ items",
    color: "from-blue-500/20 to-cyan-500/20",
    href: "/categories/electronics",
  },
  {
    id: 2,
    name: "Fashion",
    icon: Shirt,
    count: "3.2K+ items",
    color: "from-pink-500/20 to-rose-500/20",
    href: "/categories/fashion",
  },
  {
    id: 3,
    name: "Jewelry",
    icon: Sparkles,
    count: "1.8K+ items",
    color: "from-amber-500/20 to-yellow-500/20",
    href: "/categories/jewelry",
  },
  {
    id: 4,
    name: "Watches",
    icon: Watch,
    count: "850+ items",
    color: "from-purple-500/20 to-indigo-500/20",
    href: "/categories/watches",
  },
  {
    id: 5,
    name: "Home & Living",
    icon: Home,
    count: "2.1K+ items",
    color: "from-green-500/20 to-emerald-500/20",
    href: "/categories/home",
  },
  {
    id: 6,
    name: "Accessories",
    icon: ShoppingBag,
    count: "1.5K+ items",
    color: "from-red-500/20 to-orange-500/20",
    href: "/categories/accessories",
  },
  {
    id: 7,
    name: "Mobile",
    icon: Smartphone,
    count: "950+ items",
    color: "from-teal-500/20 to-cyan-500/20",
    href: "/categories/mobile",
  },
  {
    id: 8,
    name: "Beauty",
    icon: Heart,
    count: "1.2K+ items",
    color: "from-fuchsia-500/20 to-pink-500/20",
    href: "/categories/beauty",
  },
];

export default function Categories() {
  return (
    <section className="py-20">
      <Container>
        {/* Section Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4">
              Shop by <span className="gradient-text">Category</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore our curated collections across various categories
            </p>
          </motion.div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <Link href={category.href}>
                  <div className="group relative overflow-hidden rounded-2xl glass p-6 lg:p-8 border border-border/40 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5">
                    {/* Background Gradient */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                    />

                    {/* Content */}
                    <div className="relative z-10 flex flex-col items-center text-center space-y-3">
                      {/* Icon */}
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Icon className="h-8 w-8 text-primary" />
                      </div>

                      {/* Title */}
                      <h3 className="font-semibold text-lg">{category.name}</h3>

                      {/* Count */}
                      <p className="text-sm text-muted-foreground">
                        {category.count}
                      </p>

                      {/* Hover Arrow */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-primary"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Shine Effect */}
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-12"
        >
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all"
          >
            View All Categories
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>
        </motion.div>
      </Container>
    </section>
  );
}
