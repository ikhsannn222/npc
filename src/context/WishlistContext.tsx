import React, { createContext, useContext, useState, useEffect } from "react";
import { Monitor } from "../types/monitor";
import { useAuth } from "./AuthContext";
import { supabase } from "../lib/supabase";

interface WishlistContextType {
  wishlist: Monitor[];
  addToWishlist: (monitor: Monitor) => Promise<void>;
  removeFromWishlist: (monitor: Monitor) => Promise<void>;
  isInWishlist: (monitorId: number) => boolean;
  loading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined,
);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<Monitor[]>([]);
  const [loading, setLoading] = useState(true);

  // Load wishlist on mount or user change
  useEffect(() => {
    const loadWishlist = async () => {
      setLoading(true);

      if (user) {
        // Load from Supabase
        try {
          // Assuming table 'wishlists' has columns: user_id, product_data (jsonb)
          // Since we only wishlisted Monitors for now, we store the full monitor object in product_data
          // Or separate table rows per item. Let's assume one row per item.
          const { data, error } = await supabase
            .from("wishlists")
            .select("product_data")
            .eq("user_id", user.id);

          if (error) {
            console.error("Error loading wishlist from Supabase:", error);
            // Fallback or empty?
          } else {
            const items = data?.map((row: any) => row.product_data) || [];
            setWishlist(items);
          }
        } catch (err) {
          console.error("Unexpected error loading wishlist:", err);
        }
      } else {
        // Load from LocalStorage
        const saved = localStorage.getItem("guest_wishlist");
        if (saved) {
          try {
            setWishlist(JSON.parse(saved));
          } catch (e) {
            console.error("Error parsing local wishlist", e);
            setWishlist([]);
          }
        } else {
          setWishlist([]);
        }
      }
      setLoading(false);
    };

    loadWishlist();
  }, [user]);

  // Sync to LocalStorage whenever wishlist changes (only for Guest)
  useEffect(() => {
    if (!user) {
      localStorage.setItem("guest_wishlist", JSON.stringify(wishlist));
    }
  }, [wishlist, user]);

  const addToWishlist = async (monitor: Monitor) => {
    // Optimistic update
    const newList = [...wishlist, monitor];
    setWishlist(newList);

    if (user) {
      // Sync to Supabase
      try {
        const { error } = await supabase.from("wishlists").insert({
          user_id: user.id,
          product_id: monitor.id, // Optional, for indexing
          product_type: "monitor",
          product_data: monitor,
        });
        if (error) throw error;
      } catch (err) {
        console.error("Error adding to wishlist DB:", err);
        // Revert on error? For now, keep it simple.
        alert("Gagal menyimpan ke database, cek koneksi.");
        setWishlist(wishlist); // Revert
      }
    }
  };

  const removeFromWishlist = async (monitor: Monitor) => {
    const newList = wishlist.filter((m) => m.id !== monitor.id);
    setWishlist(newList);

    if (user) {
      try {
        // We delete by product_id if available, or try to match product_data->id
        // Assuming we store product_id or rely on monitor.id
        // Since Supabase delete with JSONB match is tricky, let's assume we inserted product_id column
        // If not, we might need to delete by some ID.
        // Let's try matching product_data->>id if possible, or product_id.
        // Or we assume the table has `product_id`.
        const { error } = await supabase
          .from("wishlists")
          .delete()
          .eq("user_id", user.id)
          .eq("product_id", monitor.id);

        // Note: If product_id column doesn't exist, this will fail.
        // Alternative: .match({ user_id: user.id, product_id: monitor.id })

        if (error) {
          // Fallback: try filtering by product_data->id cast to string if product_id col doesn't exist?
          // But let's assume standard 'wishlists' schema I planned: user_id, product_id, product_data.
          throw error;
        }
      } catch (err) {
        console.error("Error deleting from wishlist DB:", err);
        setWishlist(wishlist); // Revert
      }
    }
  };

  const isInWishlist = (monitorId: number) => {
    return wishlist.some((m) => m.id === monitorId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        loading,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
