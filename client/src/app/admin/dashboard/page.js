"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Container from "@/components/shared/Container";
import { Button } from "@/components/ui/button";
import {
  Users,
  Package,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Loader2,
  BarChart3,
  Star,
  UserCheck,
} from "lucide-react";
import useAuthStore from "@/store/useAuthStore";
import api from "@/services/api";
import toast from "react-hot-toast";
import Link from "next/link";

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (user?.role !== "admin") {
      router.push("/");
      toast.error("Access denied. Admin account required.");
      return;
    }

    fetchStats();
  }, [isAuthenticated, user]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/stats");
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
      change: "+15.3%",
    },
    {
      title: "Total Users",
      value: stats?.overview.totalUsers || 0,
      icon: Users,
      color: "from-blue-500 to-cyan-600",
      link: "/admin/users",
    },
    {
      title: "Total Sellers",
      value: stats?.overview.totalSellers || 0,
      icon: UserCheck,
      color: "from-purple-500 to-pink-600",
      link: "/admin/users?role=seller",
    },
    {
      title: "Total Products",
      value: stats?.overview.totalProducts || 0,
      icon: Package,
      color: "from-orange-500 to-red-600",
      link: "/admin/products",
    },
    {
      title: "Total Orders",
      value: stats?.overview.totalOrders || 0,
      icon: ShoppingBag,
      color: "from-indigo-500 to-purple-600",
      link: "/admin/orders",
    },
    {
      title: "Pending Orders",
      value: stats?.overview.pendingOrders || 0,
      icon: AlertCircle,
      color: "from-yellow-500 to-amber-600",
      link: "/admin/orders?status=pending",
      alert: stats?.overview.pendingOrders > 0,
    },
    {
      title: "Pending Products",
      value: stats?.overview.pendingProducts || 0,
      icon: Package,
      color: "from-red-500 to-rose-600",
      link: "/admin/products?status=pending",
      alert: stats?.overview.pendingProducts > 0,
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
          <div className="mb-8">
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4">
              Admin <span className="gradient-text">Dashboard</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Platform overview and management center
            </p>
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
                  } hover:shadow-xl transition-all ${stat.link ? "cursor-pointer" : ""}`}
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
                {stats?.analytics.revenueByMonth.map((item, index) => {
                  const maxRevenue = Math.max(
                    ...stats.analytics.revenueByMonth.map((r) => r.revenue),
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
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Top Sellers */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="glass rounded-2xl p-6 border border-border/40"
            >
              <h2 className="text-xl font-bold mb-6">Top Sellers</h2>
              <div className="space-y-4">
                {stats?.analytics.topSellers.map((seller, index) => (
                  <div
                    key={seller._id}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white font-bold">
                      {seller.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{seller.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {seller.orders} orders • {seller.productCount} products
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        ${seller.revenue.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">Revenue</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Order Status Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass rounded-2xl p-6 border border-border/40 mb-8"
          >
            <h2 className="text-xl font-bold mb-6">
              Order Status Distribution
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {stats?.analytics.ordersByStatus.map((status) => (
                <div
                  key={status._id}
                  className="text-center p-4 rounded-xl bg-slate-50"
                >
                  <p className="text-2xl font-bold mb-1">{status.count}</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {status._id}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Users */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="glass rounded-2xl p-6 border border-border/40"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Recent Users</h2>
                <Button asChild variant="outline" size="sm">
                  <Link href="/admin/users">View All</Link>
                </Button>
              </div>
              <div className="space-y-3">
                {stats?.recentActivity.users.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {user.role}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Recent Orders */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="glass rounded-2xl p-6 border border-border/40"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Recent Orders</h2>
                <Button asChild variant="outline" size="sm">
                  <Link href="/admin/orders">View All</Link>
                </Button>
              </div>
              <div className="space-y-3">
                {stats?.recentActivity.orders.map((order) => (
                  <div
                    key={order._id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <ShoppingBag className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {order.user?.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ${order.totalPrice.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Recent Products */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="glass rounded-2xl p-6 border border-border/40"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Recent Products</h2>
                <Button asChild variant="outline" size="sm">
                  <Link href="/admin/products">View All</Link>
                </Button>
              </div>
              <div className="space-y-3">
                {stats?.recentActivity.products.map((product) => (
                  <div
                    key={product._id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-100">
                      {product.images?.[0]?.url && (
                        <img
                          src={product.images[0].url}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {product.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ${product.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8"
          >
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-auto py-6 flex-col gap-2"
            >
              <Link href="/admin/users">
                <Users className="h-8 w-8" />
                <span className="font-semibold">Manage Users</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-auto py-6 flex-col gap-2"
            >
              <Link href="/admin/products">
                <Package className="h-8 w-8" />
                <span className="font-semibold">Manage Products</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-auto py-6 flex-col gap-2"
            >
              <Link href="/admin/orders">
                <ShoppingBag className="h-8 w-8" />
                <span className="font-semibold">Manage Orders</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-auto py-6 flex-col gap-2"
            >
              <Link href="/admin/reviews">
                <Star className="h-8 w-8" />
                <span className="font-semibold">Manage Reviews</span>
              </Link>
            </Button>
          </motion.div>
        </Container>
      </main>

      <Footer />
    </div>
  );
}
