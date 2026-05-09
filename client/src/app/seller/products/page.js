"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Container from "@/components/shared/Container";
import { Button } from "@/components/ui/button";
import {
  Package,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Plus,
  Loader2,
  AlertCircle,
} from "lucide-react";
import useAuthStore from "@/store/useAuthStore";
import api from "@/services/api";
import toast from "react-hot-toast";
import Link from "next/link";

export default function SellerProductsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
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

    if (user?.role !== "seller" && user?.role !== "admin") {
      router.push("/");
      toast.error("Access denied. Seller account required.");
      return;
    }

    fetchProducts();
  }, [isAuthenticated, user, pagination.page, status]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...(search && { search }),
        ...(status !== "all" && { status }),
      });

      const response = await api.get(`/sellers/products?${params}`);
      setProducts(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchProducts();
  };

  const handleDelete = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      await api.delete(`/products/${productId}`);
      toast.success("Product deleted successfully");
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };

  const handleToggleStatus = async (productId, currentStatus) => {
    try {
      await api.put(`/products/${productId}`, {
        isActive: !currentStatus,
      });
      toast.success(
        `Product ${!currentStatus ? "activated" : "deactivated"} successfully`,
      );
      fetchProducts();
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product");
    }
  };

  if (loading && products.length === 0) {
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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4">
                My <span className="gradient-text">Products</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Manage your product inventory and listings
              </p>
            </div>
            <Button asChild className="gradient-primary">
              <Link href="/products/new">
                <Plus className="h-5 w-5 mr-2" />
                Add Product
              </Link>
            </Button>
          </div>

          {/* Filters */}
          <div className="glass rounded-2xl p-6 border border-border/40 mb-8">
            <form
              onSubmit={handleSearch}
              className="flex flex-col md:flex-row gap-4"
            >
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-border/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              {/* Status Filter */}
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className="px-4 py-2 border border-border/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="all">All Products</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              <Button type="submit">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </form>
          </div>

          {/* Products Table */}
          {products.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center glass rounded-2xl p-12 border border-border/40"
            >
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground mb-6">
                Start by adding your first product
              </p>
              <Button asChild className="gradient-primary">
                <Link href="/products/new">
                  <Plus className="h-5 w-5 mr-2" />
                  Add Product
                </Link>
              </Button>
            </motion.div>
          ) : (
            <>
              <div className="glass rounded-2xl border border-border/40 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                          Product
                        </th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                          Category
                        </th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                          Price
                        </th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                          Stock
                        </th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                          Sold
                        </th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                          Status
                        </th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <motion.tr
                          key={product._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="border-t border-border/40 hover:bg-slate-50/50 transition-colors"
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100">
                                {product.images?.[0]?.url && (
                                  <img
                                    src={product.images[0].url}
                                    alt={product.title}
                                    className="w-full h-full object-cover"
                                  />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium truncate max-w-xs">
                                  {product.title}
                                </p>
                                <p className="text-sm text-muted-foreground truncate">
                                  {product.brand}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="inline-flex px-2 py-1 rounded-full bg-primary/10 text-primary text-sm">
                              {product.category?.name || "N/A"}
                            </span>
                          </td>
                          <td className="py-4 px-6 font-medium">
                            ${product.price.toFixed(2)}
                          </td>
                          <td className="py-4 px-6">
                            <span
                              className={`font-medium ${
                                product.stock < 10
                                  ? "text-red-600"
                                  : "text-green-600"
                              }`}
                            >
                              {product.stock}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-muted-foreground">
                            {product.sold || 0}
                          </td>
                          <td className="py-4 px-6">
                            <button
                              onClick={() =>
                                handleToggleStatus(
                                  product._id,
                                  product.isActive,
                                )
                              }
                              className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                                product.isActive
                                  ? "bg-green-100 text-green-800"
                                  : "bg-slate-100 text-slate-800"
                              }`}
                            >
                              {product.isActive ? "Active" : "Inactive"}
                            </button>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="ghost" asChild>
                                <Link
                                  href={`/products/${product.slug || product._id}`}
                                >
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </Button>
                              <Button size="sm" variant="ghost" asChild>
                                <Link href={`/products/${product._id}/edit`}>
                                  <Edit className="h-4 w-4" />
                                </Link>
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDelete(product._id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
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

      <Footer />
    </div>
  );
}
