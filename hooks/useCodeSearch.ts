import { useState, useCallback } from 'react';
import type { SearchResult, FavoriteItem } from "@/lib/types/search";

export function useCodeSearch(filters: any, guestTracking: any) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 3) return;
    
    setLoading(true);
    try {
      // إضافة فلتر "Time-Travel" بسيط (بحث في آخر 24 ساعة برمجياً)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const dateStr = yesterday.toISOString().split('T')[0];
      
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}+pushed:>${dateStr}&per_page=50`);
      if (!res.ok) throw new Error("API Error");
      
      const data = await res.json();
      let items = data.items || [];

      // تطبيق الفلاتر
      if (filters.language) {
        items = items.filter((r: any) => r.repository?.language === filters.language);
      }
      if (filters.minStars > 0) {
        items = items.filter((r: any) => (r.repository?.stargazers_count || 0) >= filters.minStars);
      }

      setResults(items);
      guestTracking.incrementSearch(); // عداد السيرش
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters, guestTracking]);

  return { results, loading, query, setQuery, performSearch };
}