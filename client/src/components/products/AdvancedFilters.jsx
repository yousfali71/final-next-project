"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, X, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/services/api";

export default function AdvancedFilters({ filters, onFilterChange, onReset }) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    price: true,
    brand: true,
    rating: true,
  });
  const [filterOptions, setFilterOptions] = useState({
    brands: [],
    priceRange: { minPrice: 0, maxPrice: 10000 },
    ratingDistribution: [],
  });
  const [priceRange, setPriceRange] = useState({
    min: filters.minPrice || "",
    max: filters.maxPrice || "",
  });

  useEffect(() => {
    fetchFilterOptions();
  }, [filters.category]);

  const fetchFilterOptions = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.category) {
        params.append("category", filters.category);
      }

      const response = await api.get(`/products/filters/options?${params}`);
      setFilterOptions(response.data.data);
    } catch (error) {
      console.error("Error fetching filter options:", error);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleBrandChange = (brand) => {
    const currentBrands = filters.brand ? filters.brand.split(",") : [];
    const newBrands = currentBrands.includes(brand)
      ? currentBrands.filter((b) => b !== brand)
      : [...currentBrands, brand];

    onFilterChange("brand", newBrands.length > 0 ? newBrands.join(",") : "");
  };

  const handlePriceChange = () => {
    if (priceRange.min) onFilterChange("minPrice", priceRange.min);
    if (priceRange.max) onFilterChange("maxPrice", priceRange.max);
  };

  const handleRatingChange = (rating) => {
    onFilterChange("minRating", filters.minRating === rating ? "" : rating);
  };

  const handleStockChange = (value) => {
    onFilterChange("inStock", filters.inStock === value ? "" : value);
  };

  const activeFiltersCount = [
    filters.brand,
    filters.minPrice || filters.maxPrice,
    filters.minRating,
    filters.inStock,
  ].filter(Boolean).length;

  return (
    <div className="glass rounded-2xl border border-border/40 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Filters</h3>
          {activeFiltersCount > 0 && (
            <span className="px-2 py-0.5 bg-primary text-white text-xs rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </div>
        {isOpen ? (
          <ChevronUp className="h-5 w-5" />
        ) : (
          <ChevronDown className="h-5 w-5" />
        )}
      </button>

      {/* Filters Content */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-border/40"
        >
          <div className="p-4 space-y-6 max-h-[600px] overflow-y-auto">
            {/* Price Range */}
            <div>
              <button
                onClick={() => toggleSection("price")}
                className="w-full flex items-center justify-between mb-3"
              >
                <span className="font-medium">Price Range</span>
                {expandedSections.price ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>

              {expandedSections.price && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceRange.min}
                      onChange={(e) =>
                        setPriceRange({ ...priceRange, min: e.target.value })
                      }
                      className="flex-1 px-3 py-2 border border-border/40 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <span className="text-muted-foreground">-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceRange.max}
                      onChange={(e) =>
                        setPriceRange({ ...priceRange, max: e.target.value })
                      }
                      className="flex-1 px-3 py-2 border border-border/40 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <Button
                    onClick={handlePriceChange}
                    size="sm"
                    className="w-full"
                  >
                    Apply Price
                  </Button>
                  {filterOptions.priceRange && (
                    <p className="text-xs text-muted-foreground">
                      Range: ${Math.floor(filterOptions.priceRange.minPrice)} -
                      ${Math.ceil(filterOptions.priceRange.maxPrice)}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Brand Filter */}
            {filterOptions.brands.length > 0 && (
              <div>
                <button
                  onClick={() => toggleSection("brand")}
                  className="w-full flex items-center justify-between mb-3"
                >
                  <span className="font-medium">Brand</span>
                  {expandedSections.brand ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>

                {expandedSections.brand && (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {filterOptions.brands.map((brand) => {
                      const isSelected = filters.brand
                        ?.split(",")
                        .includes(brand);
                      return (
                        <label
                          key={brand}
                          className="flex items-center gap-2 cursor-pointer group"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleBrandChange(brand)}
                            className="w-4 h-4 rounded border-border/40 text-primary focus:ring-2 focus:ring-primary/20"
                          />
                          <span className="text-sm group-hover:text-primary transition-colors">
                            {brand}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Rating Filter */}
            <div>
              <button
                onClick={() => toggleSection("rating")}
                className="w-full flex items-center justify-between mb-3"
              >
                <span className="font-medium">Rating</span>
                {expandedSections.rating ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>

              {expandedSections.rating && (
                <div className="space-y-2">
                  {[4, 3, 2, 1].map((rating) => (
                    <label
                      key={rating}
                      className="flex items-center gap-2 cursor-pointer group"
                    >
                      <input
                        type="radio"
                        name="rating"
                        checked={filters.minRating === rating.toString()}
                        onChange={() => handleRatingChange(rating.toString())}
                        className="w-4 h-4 border-border/40 text-primary focus:ring-2 focus:ring-primary/20"
                      />
                      <div className="flex items-center gap-1">
                        <span className="text-sm">{rating}</span>
                        <span className="text-yellow-500">★</span>
                        <span className="text-sm text-muted-foreground">
                          & up
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Stock Availability */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.inStock === "true"}
                  onChange={() => handleStockChange("true")}
                  className="w-4 h-4 rounded border-border/40 text-primary focus:ring-2 focus:ring-primary/20"
                />
                <span className="text-sm font-medium group-hover:text-primary transition-colors">
                  In Stock Only
                </span>
              </label>
            </div>

            {/* Reset Button */}
            {activeFiltersCount > 0 && (
              <Button
                onClick={() => {
                  onReset();
                  setPriceRange({ min: "", max: "" });
                }}
                variant="outline"
                className="w-full"
              >
                <X className="h-4 w-4 mr-2" />
                Reset All Filters
              </Button>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
