"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

export type FavoriteItem = {
  id: string; name: string; logo: string; color: string;
  price: number; rating: number; discount: string;
};

interface FavCtx {
  favorites: FavoriteItem[];
  toggleFavorite: (item: FavoriteItem) => void;
  isFavorite:    (id: string) => boolean;
  count:         number;
}

const Ctx = createContext<FavCtx | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  useEffect(() => {
    try { const s = localStorage.getItem("gf_favorites"); if (s) setFavorites(JSON.parse(s)); } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem("gf_favorites", JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = useCallback((item: FavoriteItem) => {
    setFavorites(prev =>
      prev.some(f => f.id === item.id)
        ? prev.filter(f => f.id !== item.id)
        : [...prev, item]
    );
  }, []);

  const isFavorite = useCallback((id: string) => favorites.some(f => f.id === id), [favorites]);

  return (
    <Ctx.Provider value={{ favorites, toggleFavorite, isFavorite, count: favorites.length }}>
      {children}
    </Ctx.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useFavorites outside provider");
  return ctx;
}
