"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";

export default function ProductFilters({ onFilterChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: "",
    minPrice: "",
    maxPrice: "",
    brand: "",
    sort: "-createdAt",
  });

  const categories = [
    "Electronics",
    "Fashion",
    "Jewelry",
    "Watches",
    "Home & Living",
    "Accessories",
    "Mobile",
    "Beauty",
  ];

  const sortOptions = [
    { label: "Newest First", value: "-createdAt" },
    { label: "Oldest First", value: "createdAt" },
    { label: "Price: Low to High", value: "price" },
    { label: "Price: High to Low", value: "-price" },
    { label: "Best Rating", value: "-ratings.average" },
    { label: "Most Popular", value: "-ratings.count" },
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      category: "",
      minPrice: "",
      maxPrice: "",
      brand: "",
      sort: "-createdAt",
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const hasActiveFilters =
    filters.category || filters.minPrice || filters.maxPrice || filters.brand;

  return (
    <>
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden mb-6">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full"
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filters
          {hasActiveFilters && (
            <span className="ml-2 w-2 h-2 rounded-full bg-primary" />
          )}
        </Button>
      </div>

      {/* Filters Panel */}
      <motion.div
        initial={false}
        animate={{
          height: isOpen || window.innerWidth >= 1024 ? "auto" : 0,
          opacity: isOpen || window.innerWidth >= 1024 ? 1 : 0,
        }}
        className="overflow-hidden"
      >
        <div className="glass rounded-2xl p-6 space-y-6 border border-border/40">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5 text-primary" />
              Filters
            </h3>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-sm"
              >
                Clear All
              </Button>
            )}
          </div>

          {/* Sort */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Sort By</label>
            <select
              value={filters.sort}
              onChange={(e) => handleFilterChange("sort", e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Category</label>
            <div className="space-y-2">
              {categories.map((category) => (
                <label
                  key={category}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <input
                    type="radio"
                    name="category"
                    value={category}
                    checked={filters.category === category}
                    onChange={(e) =>
                      handleFilterChange("category", e.target.value)
                    }
                    className="w-4 h-4 text-primary focus:ring-primary focus:ring-2"
                  />
                  <span className="text-sm group-hover:text-primary transition-colors">
                    {category}
                  </span>
                </label>
              ))}
              {filters.category && (
                <button
                  onClick={() => handleFilterChange("category", "")}
                  className="text-sm text-primary hover:underline"
                >
                  Clear category
                </button>
              )}
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Price Range</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange("minPrice", e.target.value)}
                className="px-3 py-2 rounded-lg bg-background border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
                className="px-3 py-2 rounded-lg bg-background border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          {/* Brand */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Brand</label>
            <input
              type="text"
              placeholder="Search brand..."
              value={filters.brand}
              onChange={(e) => handleFilterChange("brand", e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="pt-4 border-t border-border/40">
              <p className="text-xs font-medium text-muted-foreground mb-3">
                Active Filters:
              </p>
              <div className="flex flex-wrap gap-2">
                {filters.category && (
                  <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs flex items-center gap-2">
                    {filters.category}
                    <button
                      onClick={() => handleFilterChange("category", "")}
                      className="hover:opacity-70"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                {filters.minPrice && (
                  <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs flex items-center gap-2">
                    Min: ${filters.minPrice}
                    <button
                      onClick={() => handleFilterChange("minPrice", "")}
                      className="hover:opacity-70"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                {filters.maxPrice && (
                  <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs flex items-center gap-2">
                    Max: ${filters.maxPrice}
                    <button
                      onClick={() => handleFilterChange("maxPrice", "")}
                      className="hover:opacity-70"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                {filters.brand && (
                  <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs flex items-center gap-2">
                    {filters.brand}
                    <button
                      onClick={() => handleFilterChange("brand", "")}
                      className="hover:opacity-70"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}
