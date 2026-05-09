"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Container from "@/components/shared/Container";
import { Button } from "@/components/ui/button";
import {
  ShoppingBag,
  Search,
  Filter,
  Eye,
  Loader2,
  Package,
  Truck,
  CheckCircle,
  XCircle,
} from "lucide-react";
import useAuthStore from "@/store/useAuthStore";
import api from "@/services/api";
import toast from "react-hot-toast";
import Link from "next/link";

export default function SellerOrdersPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("all");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (user?.role !== "seller" && user?.role !== "admin") {
      router.push("/");
      toast.error("Access denied. Seller account required.");
      return;
    }

    fetchOrders();
  }, [isAuthenticated, user, pagination.page, status]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...(status !== "all" && { status }),
      });

      const response = await api.get(`/sellers/orders?${params}`);
      setOrders(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedOrder || !newStatus) return;

    try {
      await api.put(`/sellers/orders/${selectedOrder._id}/status`, {
        orderStatus: newStatus,
        ...(trackingNumber && { trackingNumber }),
      });
      toast.success("Order status updated successfully");
      setShowStatusModal(false);
      setSelectedOrder(null);
      setNewStatus("");
      setTrackingNumber("");
      fetchOrders();
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Failed to update order status");
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="h-4 w-4" />;
      case "shipped":
        return <Truck className="h-4 w-4" />;
      case "processing":
        return <Package className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      default:
        return <ShoppingBag className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-slate-100 text-slate-800";
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
              Order <span className="gradient-text">Management</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Track and manage your customer orders
            </p>
          </div>

          {/* Filters */}
          <div className="glass rounded-2xl p-6 border border-border/40 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Status Filter */}
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className="px-4 py-2 border border-border/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <div className="text-sm text-muted-foreground flex items-center">
                Total: {pagination.total} orders
              </div>
            </div>
          </div>

          {/* Orders Table */}
          {orders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center glass rounded-2xl p-12 border border-border/40"
            >
              <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No orders found</h3>
              <p className="text-muted-foreground">
                {status !== "all"
                  ? `No ${status} orders at the moment`
                  : "Your orders will appear here"}
              </p>
            </motion.div>
          ) : (
            <>
              <div className="glass rounded-2xl border border-border/40 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                          Order ID
                        </th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                          Customer
                        </th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                          Items
                        </th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                          Total
                        </th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                          Status
                        </th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                          Date
                        </th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <motion.tr
                          key={order._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="border-t border-border/40 hover:bg-slate-50/50 transition-colors"
                        >
                          <td className="py-4 px-6">
                            <Link
                              href={`/orders/${order._id}`}
                              className="text-primary hover:underline font-mono text-sm"
                            >
                              #{order._id.slice(-8)}
                            </Link>
                          </td>
                          <td className="py-4 px-6">
                            <div>
                              <p className="font-medium">{order.user?.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {order.user?.email}
                              </p>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            {order.products.length} item(s)
                          </td>
                          <td className="py-4 px-6 font-medium">
                            ${order.totalPrice.toFixed(2)}
                          </td>
                          <td className="py-4 px-6">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                order.orderStatus,
                              )}`}
                            >
                              {getStatusIcon(order.orderStatus)}
                              {order.orderStatus}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-sm text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="ghost" asChild>
                                <Link href={`/orders/${order._id}`}>
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setNewStatus(order.orderStatus);
                                  setTrackingNumber(order.trackingNumber || "");
                                  setShowStatusModal(true);
                                }}
                              >
                                Update
                              </Button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    disabled={pagination.page === 1 || loading}
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        page: prev.page - 1,
                      }))
                    }
                  >
                    Previous
                  </Button>

                  <span className="text-sm text-muted-foreground px-4">
                    Page {pagination.page} of {pagination.pages}
                  </span>

                  <Button
                    variant="outline"
                    disabled={pagination.page === pagination.pages || loading}
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        page: prev.page + 1,
                      }))
                    }
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </Container>
      </main>

      {/* Update Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-2xl p-6 max-w-md w-full border border-border/40"
          >
            <h3 className="text-xl font-bold mb-4">Update Order Status</h3>
            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Order Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-border/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Tracking Number (Optional)
                </label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number"
                  className="w-full px-4 py-2 border border-border/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="flex gap-3">
                <Button type="submit" className="flex-1 gradient-primary">
                  Update Status
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowStatusModal(false);
                    setSelectedOrder(null);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <Footer />
    </div>
  );
}
