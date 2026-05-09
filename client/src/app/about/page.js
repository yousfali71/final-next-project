"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Container from "@/components/shared/Container";
import {
  Store,
  Shield,
  Truck,
  Heart,
  Users,
  Globe,
  Award,
  Zap,
} from "lucide-react";

export default function AboutPage() {
  const features = [
    {
      icon: Store,
      title: "Multi-Vendor Platform",
      description:
        "Connect with trusted sellers from around the world in one convenient marketplace",
    },
    {
      icon: Shield,
      title: "Secure Shopping",
      description:
        "Your transactions are protected with bank-level encryption and buyer protection",
    },
    {
      icon: Truck,
      title: "Fast Delivery",
      description:
        "Enjoy quick and reliable shipping with real-time tracking on all orders",
    },
    {
      icon: Heart,
      title: "Curated Selection",
      description:
        "Every product is carefully selected to ensure quality and authenticity",
    },
  ];

  const stats = [
    { icon: Users, value: "10K+", label: "Active Customers" },
    { icon: Store, value: "500+", label: "Trusted Sellers" },
    { icon: Globe, value: "50+", label: "Countries" },
    { icon: Award, value: "4.8/5", label: "Customer Rating" },
  ];

  const values = [
    {
      icon: Zap,
      title: "Innovation",
      description:
        "We continuously improve our platform with cutting-edge technology",
    },
    {
      icon: Shield,
      title: "Trust",
      description:
        "Building lasting relationships through transparency and reliability",
    },
    {
      icon: Heart,
      title: "Customer First",
      description: "Your satisfaction is our top priority in everything we do",
    },
    {
      icon: Globe,
      title: "Global Reach",
      description: "Connecting buyers and sellers across borders seamlessly",
    },
  ];

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
              className="text-center space-y-6 max-w-3xl mx-auto"
            >
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
                <span className="gradient-text">About Luxora</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                We're revolutionizing online shopping by connecting quality
                sellers with discerning customers worldwide. Our mission is to
                create a trusted marketplace where everyone wins.
              </p>
            </motion.div>
          </Container>
        </div>

        {/* Stats Section */}
        <Container className="py-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="glass rounded-2xl p-8 text-center"
              >
                <stat.icon className="h-8 w-8 mx-auto mb-4 text-primary" />
                <p className="text-4xl font-bold gradient-text mb-2">
                  {stat.value}
                </p>
                <p className="text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </Container>

        {/* Features Section */}
        <div className="py-20 bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold mb-4">
                <span className="gradient-text">Why Choose Luxora</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Experience the difference of a marketplace built for modern
                shoppers
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="glass rounded-2xl p-8 space-y-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </Container>
        </div>

        {/* Values Section */}
        <Container className="py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">
              <span className="gradient-text">Our Values</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center space-y-4"
              >
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary/10 to-purple-500/10 flex items-center justify-center">
                  <value.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">{value.title}</h3>
                <p className="text-muted-foreground">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </Container>

        {/* CTA Section */}
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
                <span className="gradient-text">Ready to Get Started?</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Join thousands of satisfied customers shopping on Luxora today
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/products"
                  className="inline-flex items-center justify-center px-8 py-3 rounded-lg bg-gradient-to-r from-primary via-purple-500 to-pink-500 text-white font-medium hover:opacity-90 transition-opacity"
                >
                  Start Shopping
                </a>
                <a
                  href="/register"
                  className="inline-flex items-center justify-center px-8 py-3 rounded-lg border border-border bg-background hover:bg-accent transition-colors font-medium"
                >
                  Become a Seller
                </a>
              </div>
            </motion.div>
          </Container>
        </div>
      </main>
      <Footer />
    </div>
  );
}
