"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Container from "@/components/shared/Container";
import { Button } from "@/components/ui/button";
import {
  Image as ImageIcon,
  Search,
  Filter,
  Edit,
  Trash2,
  Plus,
  Loader2,
  Link as LinkIcon,
  Eye,
  EyeOff,
} from "lucide-react";
import useAuthStore from "@/store/useAuthStore";
import api from "@/services/api";
import toast from "react-hot-toast";

export default function AdminBannersPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    link: "",
    buttonText: "Shop Now",
    position: "hero",
    order: "0",
  });
  const [imageFile, setImageFile] = useState(null);

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

    fetchBanners();
  }, [isAuthenticated, user]);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await api.get("/banners");
      setBanners(response.data.data);
    } catch (error) {
      console.error("Error fetching banners:", error);
      toast.error("Failed to load banners");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!editingBanner && !imageFile) {
      toast.error("Please upload a banner image");
      return;
    }

    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("subtitle", formData.subtitle);
      data.append("link", formData.link);
      data.append("buttonText", formData.buttonText);
      data.append("position", formData.position);
      data.append("order", formData.order);

      if (imageFile) {
        data.append("image", imageFile);
      }

      if (editingBanner) {
        await api.put(`/banners/${editingBanner._id}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Banner updated successfully");
      } else {
        await api.post("/banners", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Banner created successfully");
      }

      setShowModal(false);
      setEditingBanner(null);
      setImageFile(null);
      setImagePreview(null);
      setFormData({
        title: "",
        subtitle: "",
        link: "",
        buttonText: "Shop Now",
        position: "hero",
        order: "0",
      });
      fetchBanners();
    } catch (error) {
      console.error("Error saving banner:", error);
      toast.error(error.response?.data?.message || "Failed to save banner");
    }
  };

  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || "",
      link: banner.link || "",
      buttonText: banner.buttonText,
      position: banner.position,
      order: banner.order.toString(),
    });
    setImagePreview(banner.image.url);
    setShowModal(true);
  };

  const handleToggleActive = async (bannerId, currentStatus) => {
    try {
      await api.put(`/banners/${bannerId}`, {
        isActive: !currentStatus,
      });
      toast.success(`Banner ${!currentStatus ? "activated" : "deactivated"}`);
      fetchBanners();
    } catch (error) {
      console.error("Error updating banner:", error);
      toast.error("Failed to update banner");
    }
  };

  const handleDelete = async (bannerId) => {
    if (!window.confirm("Are you sure you want to delete this banner?")) {
      return;
    }

    try {
      await api.delete(`/banners/${bannerId}`);
      toast.success("Banner deleted successfully");
      fetchBanners();
    } catch (error) {
      console.error("Error deleting banner:", error);
      toast.error("Failed to delete banner");
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

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <Navbar />

      <main className="flex-1 py-12">
        <Container>
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4">
                Banner <span className="gradient-text">Management</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Create and manage promotional banners
              </p>
            </div>
            <Button
              onClick={() => {
                setEditingBanner(null);
                setImageFile(null);
                setImagePreview(null);
                setFormData({
                  title: "",
                  subtitle: "",
                  link: "",
                  buttonText: "Shop Now",
                  position: "hero",
                  order: "0",
                });
                setShowModal(true);
              }}
              className="gradient-primary"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Banner
            </Button>
          </div>

          {/* Banners Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {banners.map((banner) => (
              <motion.div
                key={banner._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl overflow-hidden border border-border/40 hover:shadow-xl transition-all"
              >
                {/* Banner Image */}
                <div className="relative h-48 bg-slate-100">
                  <img
                    src={banner.image.url}
                    alt={banner.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 flex gap-2">
                    <button
                      onClick={() =>
                        handleToggleActive(banner._id, banner.isActive)
                      }
                      className={`p-2 rounded-lg backdrop-blur-sm ${
                        banner.isActive
                          ? "bg-green-500/90 text-white"
                          : "bg-slate-500/90 text-white"
                      }`}
                    >
                      {banner.isActive ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Banner Info */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1">{banner.title}</h3>
                      {banner.subtitle && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {banner.subtitle}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-xs">
                        <span className="px-2 py-1 rounded-full bg-primary/10 text-primary">
                          {banner.position}
                        </span>
                        <span className="text-muted-foreground">
                          Order: {banner.order}
                        </span>
                      </div>
                    </div>
                  </div>

                  {banner.link && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <LinkIcon className="h-4 w-4" />
                      <span className="truncate">{banner.link}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-4 border-t border-border/40">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(banner)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(banner._id)}
                      className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {banners.length === 0 && (
            <div className="text-center glass rounded-2xl p-12 border border-border/40">
              <ImageIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No banners yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first promotional banner
              </p>
              <Button
                onClick={() => setShowModal(true)}
                className="gradient-primary"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Banner
              </Button>
            </div>
          )}
        </Container>
      </main>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-2xl p-6 max-w-2xl w-full border border-border/40 my-8"
          >
            <h3 className="text-xl font-bold mb-4">
              {editingBanner ? "Edit Banner" : "Create Banner"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Banner Image *
                </label>
                <div className="border-2 border-dashed border-border/40 rounded-lg p-4 text-center">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-h-48 mx-auto rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          setImageFile(null);
                        }}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Click to upload banner image
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="banner-image"
                      />
                      <label
                        htmlFor="banner-image"
                        className="inline-block px-4 py-2 bg-primary text-white rounded-lg cursor-pointer hover:bg-primary/90"
                      >
                        Choose Image
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-border/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Summer Sale 2024"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) =>
                      setFormData({ ...formData, subtitle: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-border/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Up to 50% off on selected items"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Link (URL)
                  </label>
                  <input
                    type="text"
                    value={formData.link}
                    onChange={(e) =>
                      setFormData({ ...formData, link: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-border/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="/products"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Button Text
                  </label>
                  <input
                    type="text"
                    value={formData.buttonText}
                    onChange={(e) =>
                      setFormData({ ...formData, buttonText: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-border/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Shop Now"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Position *
                  </label>
                  <select
                    value={formData.position}
                    onChange={(e) =>
                      setFormData({ ...formData, position: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-border/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="hero">Hero</option>
                    <option value="middle">Middle</option>
                    <option value="bottom">Bottom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Order
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) =>
                      setFormData({ ...formData, order: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-border/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    min="0"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1 gradient-primary">
                  {editingBanner ? "Update" : "Create"} Banner
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowModal(false);
                    setEditingBanner(null);
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
