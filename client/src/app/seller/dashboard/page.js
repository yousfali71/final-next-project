"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Container from "@/components/shared/Container";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  ShoppingBag,
  Package,
  TrendingUp,
  AlertCircle,
  Star,
  Loader2,
  Eye,
  Edit,
  Trash2,
  BarChart3,
} from "lucide-react";
import useAuthStore from "@/store/useAuthStore";
import api from "@/services/api";
import toast from "react-hot-toast";
import Link from "next/link";

export default function SellerDashboard() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

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

    fetchStats();
  }, [isAuthenticated, user]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get("/sellers/stats");
      setStats(response.data.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast.error("Failed to load dashboard stats");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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

  const statCards = [
    {
      title: "Total Revenue",
      value: `$${stats?.overview.totalRevenue.toFixed(2) || "0.00"}`,
      icon: DollarSign,
      color: "from-green-500 to-emerald-600",
      change: "+12.5%",
    },
    {
      title: "Total Orders",
      value: stats?.overview.totalOrders || 0,
      icon: ShoppingBag,
      color: "from-blue-500 to-cyan-600",
      change: "+8.2%",
    },
    {
      title: "Total Products",
      value: stats?.overview.totalProducts || 0,
      icon: Package,
      color: "from-purple-500 to-pink-600",
      link: "/seller/products",
    },
    {
      title: "Items Sold",
      value: stats?.overview.totalItemsSold || 0,
      icon: TrendingUp,
      color: "from-orange-500 to-red-600",
    },
    {
      title: "Pending Orders",
      value: stats?.overview.pendingOrders || 0,
      icon: AlertCircle,
      color: "from-yellow-500 to-amber-600",
      link: "/seller/orders?status=pending",
    },
    {
      title: "Low Stock Items",
      value: stats?.overview.lowStockProducts || 0,
      icon: Package,
      color: "from-red-500 to-rose-600",
      alert: stats?.overview.lowStockProducts > 0,
    },
    {
      title: "Average Rating",
      value: stats?.overview.averageRating || "0.0",
      icon: Star,
      color: "from-yellow-400 to-orange-500",
    },
  ];

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <Navbar />

      <main className="flex-1 py-12">
        <Container>
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4">
                Seller <span className="gradient-text">Dashboard</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Welcome back, {user?.name}! Here's your store overview.
              </p>
            </div>
            <Button asChild className="gradient-primary">
              <Link href="/seller/products/new">
                <Package className="h-5 w-5 mr-2" />
                Add Product
              </Link>
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div
                  className={`glass rounded-2xl p-6 border ${
                    stat.alert ? "border-red-500/50" : "border-border/40"
                  } hover:shadow-xl transition-all cursor-pointer`}
                  onClick={() => stat.link && router.push(stat.link)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}
                    >
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                    {stat.change && (
                      <span className="text-sm text-green-600 font-medium">
                        {stat.change}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm text-muted-foreground mb-1">
                    {stat.title}
                  </h3>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Revenue Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass rounded-2xl p-6 border border-border/40"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Revenue Overview</h2>
                <BarChart3 className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="space-y-4">
                {stats?.revenueByMonth.map((item, index) => {
                  const maxRevenue = Math.max(
                    ...stats.revenueByMonth.map((r) => r.revenue),
                  );
                  const percentage = (item.revenue / maxRevenue) * 100;
                  const month = monthNames[item._id.month - 1];

                  return (
                    <div key={index}>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="font-medium">{month}</span>
                        <span className="text-muted-foreground">
                          ${item.revenue.toFixed(2)}
                        </span>
                      </div>
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-cyan-600 transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Top Products */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="glass rounded-2xl p-6 border border-border/40"
            >
              <h2 className="text-xl font-bold mb-6">Top Selling Products</h2>
              <div className="space-y-4">
                {stats?.topProducts.map((product, index) => (
                  <div
                    key={product._id}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100">
                      {product.image?.url && (
                        <img
                          src={product.image.url}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{product.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {product.totalSold} sold • ${product.revenue.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-2xl font-bold text-muted-foreground">
                      #{index + 1}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass rounded-2xl p-6 border border-border/40"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Recent Orders</h2>
              <Button asChild variant="outline" size="sm">
                <Link href="/seller/orders">View All</Link>
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/40">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Order ID
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Customer
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Total
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.recentOrders.map((order) => (
                    <tr
                      key={order._id}
                      className="border-b border-border/40 hover:bg-slate-50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <Link
                          href={`/orders/${order._id}`}
                          className="text-primary hover:underline font-mono text-sm"
                        >
                          #{order._id.slice(-8)}
                        </Link>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{order.user?.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.user?.email}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            order.orderStatus === "delivered"
                              ? "bg-green-100 text-green-800"
                              : order.orderStatus === "shipped"
                                ? "bg-blue-100 text-blue-800"
                                : order.orderStatus === "processing"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-slate-100 text-slate-800"
                          }`}
                        >
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium">
                        ${order.totalPrice.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"
          >
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-auto py-6 flex-col gap-2"
            >
              <Link href="/seller/products">
                <Package className="h-8 w-8" />
                <span className="font-semibold">Manage Products</span>
                <span className="text-xs text-muted-foreground">
                  {stats?.overview.totalProducts || 0} products
                </span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-auto py-6 flex-col gap-2"
            >
              <Link href="/seller/orders">
                <ShoppingBag className="h-8 w-8" />
                <span className="font-semibold">Manage Orders</span>
                <span className="text-xs text-muted-foreground">
                  {stats?.overview.pendingOrders || 0} pending
                </span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-auto py-6 flex-col gap-2"
            >
              <Link href="/seller/analytics">
                <BarChart3 className="h-8 w-8" />
                <span className="font-semibold">View Analytics</span>
                <span className="text-xs text-muted-foreground">
                  Revenue & trends
                </span>
              </Link>
            </Button>
          </motion.div>
        </Container>
      </main>

      <Footer />
    </div>
  );
}
