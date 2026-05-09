"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Container from "@/components/shared/Container";
import { Button } from "@/components/ui/button";
import {
  Package,
  ChevronRight,
  Loader2,
  ShoppingBag,
  Calendar,
  DollarSign,
  Eye,
} from "lucide-react";
import useAuthStore from "@/store/useAuthStore";
import api from "@/services/api";
import toast from "react-hot-toast";

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    fetchOrders();
  }, [isAuthenticated, pagination.page]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `/orders?page=${pagination.page}&limit=${pagination.limit}`,
      );
      setOrders(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "processing":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "shipped":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  if (loading && orders.length === 0) {
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

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <Navbar />

      <main className="flex-1 py-12">
        <Container>
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4">
              My <span className="gradient-text">Orders</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              {pagination.total > 0
                ? `You have ${pagination.total} order${pagination.total > 1 ? "s" : ""}`
                : "You haven't placed any orders yet"}
            </p>
          </div>

          {orders.length === 0 ? (
            /* Empty State */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center glass rounded-2xl p-12 border border-border/40"
            >
              <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
              <p className="text-muted-foreground mb-6">
                Start shopping to place your first order
              </p>
              <Button asChild size="lg" className="gradient-primary">
                <Link href="/products">
                  Browse Products
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </motion.div>
          ) : (
            /* Orders List */
            <div className="space-y-4">
              {orders.map((order, index) => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass rounded-2xl p-6 border border-border/40 hover:shadow-lg transition-shadow"
                >
                  {/* Order Header */}
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-6 pb-6 border-b border-border">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <Package className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold">
                          Order #{order._id.slice(-8).toUpperCase()}
                        </h3>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(order.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              },
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          <span className="font-medium">
                            ${order.totalPrice.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`px-4 py-1.5 rounded-full text-sm font-medium border ${getStatusColor(
                          order.orderStatus,
                        )}`}
                      >
                        {order.orderStatus.charAt(0).toUpperCase() +
                          order.orderStatus.slice(1)}
                      </span>
                      <Button asChild size="sm" className="gradient-primary">
                        <Link href={`/orders/${order._id}`}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Link>
                      </Button>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-muted-foreground">
                      Order Items ({order.products.length})
                    </h4>
                    <div className="flex gap-3 overflow-x-auto pb-2">
                      {order.products.slice(0, 4).map((item, idx) => (
                        <div
                          key={idx}
                          className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-slate-100 relative group"
                        >
                          <img
                            src={
                              item.product?.images?.[0]?.url ||
                              "/placeholder.png"
                            }
                            alt={item.product?.title || "Product"}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white text-xs">
                              ×{item.quantity}
                            </span>
                          </div>
                        </div>
                      ))}
                      {order.products.length > 4 && (
                        <div className="flex-shrink-0 w-20 h-20 rounded-lg bg-slate-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-muted-foreground">
                            +{order.products.length - 4}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="mt-4 pt-4 border-t border-border flex flex-wrap items-center justify-between gap-3 text-sm">
                    <div className="text-muted-foreground">
                      <span className="font-medium text-foreground">
                        Payment:
                      </span>{" "}
                      {order.paymentMethod === "card"
                        ? "Card"
                        : "Cash on Delivery"}
                    </div>
                    <div className="text-muted-foreground">
                      <span className="font-medium text-foreground">
                        Shipping:
                      </span>{" "}
                      {order.shippingAddress.city},{" "}
                      {order.shippingAddress.state}
                    </div>
                    {order.trackingNumber && (
                      <div className="text-muted-foreground">
                        <span className="font-medium text-foreground">
                          Tracking:
                        </span>{" "}
                        <span className="font-mono">
                          {order.trackingNumber}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    disabled={pagination.page === 1 || loading}
                    onClick={() => handlePageChange(pagination.page - 1)}
                  >
                    Previous
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from(
                      { length: Math.min(5, pagination.pages) },
                      (_, i) => {
                        let pageNum;
                        if (pagination.pages <= 5) {
                          pageNum = i + 1;
                        } else if (pagination.page <= 3) {
                          pageNum = i + 1;
                        } else if (pagination.page >= pagination.pages - 2) {
                          pageNum = pagination.pages - 4 + i;
                        } else {
                          pageNum = pagination.page - 2 + i;
                        }

                        return (
                          <Button
                            key={pageNum}
                            variant={
                              pagination.page === pageNum
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            onClick={() => handlePageChange(pageNum)}
                            disabled={loading}
                            className={
                              pagination.page === pageNum
                                ? "gradient-primary"
                                : ""
                            }
                          >
                            {pageNum}
                          </Button>
                        );
                      },
                    )}
                  </div>

                  <Button
                    variant="outline"
                    disabled={pagination.page === pagination.pages || loading}
                    onClick={() => handlePageChange(pagination.page + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}

              {loading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              )}
            </div>
          )}
        </Container>
      </main>

      <Footer />
    </div>
  );
}
