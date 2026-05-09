"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Loader2, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/services/api";
import { useDebounce } from "@/hooks/useDebounce";

export default function SearchBar({ fullWidth = false, showIcon = true }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);
  const debouncedQuery = useDebounce(query, 300);

  // Popular searches (static or can be fetched from backend)
  const popularSearches = [
    "iPhone",
    "MacBook",
    "AirPods",
    "Samsung Galaxy",
    "Sony Headphones",
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch suggestions when query changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedQuery.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        setLoading(true);
        const response = await api.get(
          `/products/search/suggestions?q=${encodeURIComponent(debouncedQuery)}&limit=5`,
        );
        setSuggestions(response.data.data);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedQuery]);

  const handleSearch = (searchQuery) => {
    if (!searchQuery.trim()) return;

    setIsOpen(false);
    setQuery("");
    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch(query);
  };

  const handleSuggestionClick = (product) => {
    setIsOpen(false);
    setQuery("");
    router.push(`/products/${product.slug}`);
  };

  const handlePopularSearch = (search) => {
    handleSearch(search);
  };

  return (
    <div
      ref={searchRef}
      className={`relative ${fullWidth ? "w-full" : "w-full max-w-md"}`}
    >
      {/* Search Input */}
      <form onSubmit={handleSubmit}>
        <div className="relative">
          {showIcon && (
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          )}
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="Search products, brands..."
            className={`w-full ${showIcon ? "pl-10" : "pl-4"} pr-10 py-2 rounded-full bg-secondary/50 border border-border/40 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all`}
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setSuggestions([]);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {loading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary animate-spin" />
          )}
        </div>
      </form>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {isOpen && (query.length >= 2 || query.length === 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 glass rounded-2xl border border-border/40 shadow-xl overflow-hidden z-50 max-h-[400px] overflow-y-auto"
          >
            {/* Product Suggestions */}
            {suggestions.length > 0 && (
              <div className="p-2">
                <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">
                  Products
                </div>
                {suggestions.map((product) => (
                  <button
                    key={product._id}
                    onClick={() => handleSuggestionClick(product)}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors text-left"
                  >
                    {product.images?.[0]?.url && (
                      <img
                        src={product.images[0].url}
                        alt={product.title}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {product.title}
                      </div>
                      {product.brand && (
                        <div className="text-xs text-muted-foreground">
                          {product.brand}
                        </div>
                      )}
                    </div>
                    <Search className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            )}

            {/* No Results */}
            {query.length >= 2 && suggestions.length === 0 && !loading && (
              <div className="p-8 text-center">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-sm text-muted-foreground">
                  No products found for "{query}"
                </p>
                <button
                  onClick={() => handleSearch(query)}
                  className="mt-3 text-sm text-primary hover:underline"
                >
                  Search anyway →
                </button>
              </div>
            )}

            {/* Popular Searches */}
            {query.length === 0 && (
              <div className="p-2">
                <div className="px-3 py-2 text-xs font-semibold text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="h-3 w-3" />
                  Popular Searches
                </div>
                {popularSearches.map((search) => (
                  <button
                    key={search}
                    onClick={() => handlePopularSearch(search)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-secondary/50 transition-colors text-left text-sm"
                  >
                    <TrendingUp className="h-4 w-4 text-primary" />
                    {search}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
