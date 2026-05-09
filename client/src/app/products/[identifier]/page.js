"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Container from "@/components/shared/Container";
import ProductCard from "@/components/products/ProductCard";
import ReviewForm from "@/components/reviews/ReviewForm";
import ReviewCard from "@/components/reviews/ReviewCard";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  Heart,
  Star,
  Minus,
  Plus,
  Loader2,
  ArrowLeft,
  Check,
  Truck,
  Shield,
  RefreshCw,
  Store,
} from "lucide-react";
import api from "@/services/api";
import toast from "react-hot-toast";
import useCartStore from "@/store/useCartStore";
import useWishlistStore from "@/store/useWishlistStore";
import useAuthStore from "@/store/useAuthStore";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { addToCart } = useCartStore();
  const { isInWishlist, addToWishlist, removeFromWishlist } =
    useWishlistStore();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [ratingStats, setRatingStats] = useState({});
  const [reviewsPagination, setReviewsPagination] = useState({
    page: 1,
    limit: 5,
    total: 0,
    pages: 1,
  });
  const [canReview, setCanReview] = useState(false);
  const [existingReview, setExistingReview] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    if (params.identifier) {
      fetchProduct();
    }
  }, [params.identifier]);

  useEffect(() => {
    if (product && isAuthenticated) {
      setIsWishlisted(isInWishlist(product._id));
      checkCanReview();
    }
  }, [product, isAuthenticated, isInWishlist]);

  useEffect(() => {
    if (product) {
      fetchReviews();
    }
  }, [product, reviewsPagination.page]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/products/${params.identifier}`);
      setProduct(response.data.data);

      // Fetch related products
      const relatedResponse = await api.get(
        `/products/${response.data.data._id}/related`,
      );
      setRelatedProducts(relatedResponse.data.data);
    } catch (error) {
      console.error("Error fetching product:", error);
      toast.error("Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    await addToCart(product._id, quantity);
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const fetchReviews = async () => {
      try {
        const response = await api.get(
          `/reviews/product/${product._id}?page=${reviewsPagination.page}&limit=${reviewsPagination.limit}`,
        );
        setReviews(response.data.data);
        setRatingStats(response.data.ratingStats);
        setReviewsPagination(response.data.pagination);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };

    const checkCanReview = async () => {
      try {
        const response = await api.get(`/reviews/can-review/${product._id}`);
        setCanReview(response.data.canReview);
        if (!response.data.canReview && response.data.review) {
          setExistingReview(response.data.review);
        }
      } catch (error) {
        console.error("Error checking review status:", error);
      }
    };

    const handleReviewSuccess = (newReview) => {
      setShowReviewForm(false);
      setExistingReview(newReview);
      setCanReview(false);
      fetchReviews();
      fetchProduct(); // Refresh product to update rating
    };
    if (isWishlisted) {
      await removeFromWishlist(product._id);
      setIsWishlisted(false);
    } else {
      await addToWishlist(product._id);
      setIsWishlisted(true);
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

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Product not found</h2>
            <Link href="/products">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Products
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const discount = product.discountPrice
    ? Math.round(
        ((product.price - product.discountPrice) / product.price) * 100,
      )
    : 0;

  const finalPrice = product.discountPrice || product.price;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <Navbar />

      <main className="flex-1 py-12">
        <Container>
          {/* Breadcrumb */}
          <div className="mb-8 flex items-center gap-2 text-sm">
            <Link href="/" className="text-muted-foreground hover:text-primary">
              Home
            </Link>
            <span className="text-muted-foreground">/</span>
            <Link
              href="/products"
              className="text-muted-foreground hover:text-primary"
            >
              Products
            </Link>
            {product.category && (
              <>
                <span className="text-muted-foreground">/</span>
                <span className="text-muted-foreground">
                  {product.category.name}
                </span>
              </>
            )}
          </div>

          {/* Product Details */}
          <div className="grid lg:grid-cols-2 gap-12 mb-20">
            {/* Left - Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="aspect-square rounded-2xl overflow-hidden glass border border-border/40 relative">
                {product.images && product.images.length > 0 ? (
                  <Image
                    src={product.images[selectedImage].url}
                    alt={product.title}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-100">
                    <ShoppingCart className="h-24 w-24 text-muted-foreground opacity-20" />
                  </div>
                )}

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {discount > 0 && (
                    <div className="px-4 py-2 rounded-full gradient-primary text-white font-semibold">
                      -{discount}%
                    </div>
                  )}
                  {product.featured && (
                    <div className="px-4 py-2 rounded-full bg-amber-500 text-white font-semibold">
                      Featured
                    </div>
                  )}
                </div>
              </div>

              {/* Thumbnails */}
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === index
                          ? "border-primary"
                          : "border-border/40 hover:border-primary/50"
                      }`}
                    >
                      <Image
                        src={image.url}
                        alt={`${product.title} ${index + 1}`}
                        width={150}
                        height={150}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right - Details */}
            <div className="space-y-6">
              {/* Title & Category */}
              <div>
                {product.brand && (
                  <p className="text-sm text-primary font-medium mb-2">
                    {product.brand}
                  </p>
                )}
                <h1 className="text-3xl lg:text-4xl font-bold mb-3">
                  {product.title}
                </h1>
                {product.category && (
                  <div className="inline-flex px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                    {product.category.name}
                  </div>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-3">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(product.ratings?.average || 0)
                          ? "text-amber-400 fill-amber-400"
                          : "text-slate-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.ratings?.average?.toFixed(1) || "0.0"} (
                  {product.ratings?.count || 0} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="space-y-2">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold gradient-text">
                    ${finalPrice.toFixed(2)}
                  </span>
                  {product.discountPrice && (
                    <span className="text-xl text-muted-foreground line-through">
                      ${product.price.toFixed(2)}
                    </span>
                  )}
                </div>
                {product.stock > 0 ? (
                  <p className="text-sm text-green-600 flex items-center gap-1">
                    <Check className="h-4 w-4" />
                    In Stock ({product.stock} available)
                  </p>
                ) : (
                  <p className="text-sm text-red-600">Out of Stock</p>
                )}
              </div>

              {/* Description */}
              <div className="prose max-w-none">
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Specifications */}
              {product.specifications && product.specifications.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold">Specifications</h3>
                  <div className="glass rounded-xl p-4 space-y-2 border border-border/40">
                    {product.specifications.map((spec, index) => (
                      <div
                        key={index}
                        className="flex justify-between text-sm border-b border-border/40 last:border-0 pb-2 last:pb-0"
                      >
                        <span className="text-muted-foreground">
                          {spec.key}
                        </span>
                        <span className="font-medium">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              {product.stock > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold">Quantity</h3>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="text-xl font-semibold w-12 text-center">
                      {quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        setQuantity(Math.min(product.stock, quantity + 1))
                      }
                      disabled={quantity >= product.stock}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  className="flex-1 gradient-primary h-12"
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Add to Cart
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12"
                  onClick={handleWishlist}
                >
                  <Heart
                    className="h-5 w-5"
                    fill={isWishlisted ? "currentColor" : "none"}
                  />
                </Button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-border/40">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Truck className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Free Shipping</p>
                    <p className="text-xs text-muted-foreground">
                      On orders over $100
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Secure Payment</p>
                    <p className="text-xs text-muted-foreground">
                      100% Protected
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <RefreshCw className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Easy Returns</p>
                    <p className="text-xs text-muted-foreground">
                      30-day policy
                    </p>
                  </div>
                </div>
              </div>

              {/* Seller Info */}
              {product.seller && (
                <div className="mt-6 pt-6 border-t border-border/40">
                  <h3 className="text-lg font-semibold mb-3">Sold By</h3>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Store className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{product.seller.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {product.seller.email}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Reviews Section */}
          <div className="mt-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold">
                <span className="gradient-text">Customer Reviews</span>
              </h2>
              {isAuthenticated && canReview && !showReviewForm && (
                <Button
                  onClick={() => setShowReviewForm(true)}
                  className="gradient-primary"
                >
                  Write a Review
                </Button>
              )}
            </div>

            {/* Rating Overview */}
            <div className="glass rounded-2xl p-6 mb-8">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Average Rating */}
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-5xl font-bold gradient-text mb-2">
                      {product.rating?.toFixed(1) || "0.0"}
                    </div>
                    <div className="flex items-center justify-center mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-5 w-5 ${
                            star <= Math.floor(product.rating || 0)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-slate-300"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {product.numReviews || 0} reviews
                    </p>
                  </div>
                </div>

                {/* Rating Distribution */}
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = ratingStats[rating] || 0;
                    const percentage =
                      product.numReviews > 0
                        ? (count / product.numReviews) * 100
                        : 0;
                    return (
                      <div key={rating} className="flex items-center gap-3">
                        <span className="text-sm w-12">{rating} stars</span>
                        <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-yellow-400"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-12 text-right">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Review Form */}
            {showReviewForm && isAuthenticated && (
              <div className="mb-8">
                <ReviewForm
                  productId={product._id}
                  onSuccess={handleReviewSuccess}
                  existingReview={existingReview}
                />
              </div>
            )}

            {/* Existing Review Notice */}
            {!canReview &&
              existingReview &&
              !showReviewForm &&
              isAuthenticated && (
                <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <p className="text-sm text-blue-800">
                    You have already reviewed this product.{" "}
                    <button
                      onClick={() => setShowReviewForm(true)}
                      className="font-medium underline"
                    >
                      Edit your review
                    </button>
                  </p>
                </div>
              )}

            {/* Reviews List */}
            <div className="space-y-6">
              {reviews.length > 0 ? (
                <>
                  {reviews.map((review) => (
                    <ReviewCard key={review._id} review={review} />
                  ))}

                  {/* Pagination */}
                  {reviewsPagination.pages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-8">
                      <Button
                        variant="outline"
                        disabled={reviewsPagination.page === 1}
                        onClick={() =>
                          setReviewsPagination((prev) => ({
                            ...prev,
                            page: prev.page - 1,
                          }))
                        }
                      >
                        Previous
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        Page {reviewsPagination.page} of{" "}
                        {reviewsPagination.pages}
                      </span>
                      <Button
                        variant="outline"
                        disabled={
                          reviewsPagination.page === reviewsPagination.pages
                        }
                        onClick={() =>
                          setReviewsPagination((prev) => ({
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
              ) : (
                <div className="text-center py-12 glass rounded-2xl">
                  <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No reviews yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Be the first to review this product
                  </p>
                  {isAuthenticated && canReview && (
                    <Button
                      onClick={() => setShowReviewForm(true)}
                      className="gradient-primary"
                    >
                      Write a Review
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Re<div className="glass rounded-xl p-4 border border-border/40">
                  <p className="text-sm text-muted-foreground mb-2">Sold by</p>
                  <div className="flex items-center gap-3">
                    {product.seller.avatar ? (
                      <Image
                        src={product.seller.avatar.url}
                        alt={product.seller.name}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="font-semibold text-primary">
                          {product.seller.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{product.seller.name}</p>
                      <Link
                        href={`/sellers/${product.seller._id}`}
                        className="text-sm text-primary hover:underline"
                      >
                        View Shop
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div>
              <h2 className="text-3xl font-bold mb-8">
                <span className="gradient-text">Related Products</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <ProductCard
                    key={relatedProduct._id}
                    product={relatedProduct}
                  />
                ))}
              </div>
            </div>
          )}
        </Container>
      </main>

      <Footer />
    </div>
  );
}
