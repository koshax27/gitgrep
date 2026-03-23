// hooks/useGuestTracking.ts
import { useState, useEffect } from 'react';

export function useGuestTracking() {
  const [searchCount, setSearchCount] = useState(0);
  const [repoAnalysisCount, setRepoAnalysisCount] = useState(0);
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);

  useEffect(() => {
    // جلب العداد من localStorage
    const savedSearch = localStorage.getItem('guest_search_count');
    const savedAnalysis = localStorage.getItem('guest_analysis_count');
    if (savedSearch) setSearchCount(parseInt(savedSearch));
    if (savedAnalysis) setRepoAnalysisCount(parseInt(savedAnalysis));
  }, []);

  const incrementSearch = () => {
    const incrementSearch = () => {
  const newCount = searchCount + 1;
  setSearchCount(newCount);
  localStorage.setItem('guest_search_count', newCount.toString());
  console.log("🔍 Search count:", newCount);
  if (newCount === 2) {
    console.log("🎯 Showing signup prompt");
    setShowSignupPrompt(true);
  }
};
    const newCount = searchCount + 1;
    setSearchCount(newCount);
    localStorage.setItem('guest_search_count', newCount.toString());
    
    // بعد 2 searches، نعرض الـ Modal
    if (newCount === 2) {
      setShowSignupPrompt(true);
    }
  };

  const incrementAnalysis = () => {
    const newCount = repoAnalysisCount + 1;
    setRepoAnalysisCount(newCount);
    localStorage.setItem('guest_analysis_count', newCount.toString());
    
    // بعد أول analysis، نعرض الـ Modal
    if (newCount === 1) {
      setShowSignupPrompt(true);
    }
  };

  const reset = () => {
    setSearchCount(0);
    setRepoAnalysisCount(0);
    setShowSignupPrompt(false);
    localStorage.removeItem('guest_search_count');
    localStorage.removeItem('guest_analysis_count');
  };

  return {
    searchCount,
    repoAnalysisCount,
    showSignupPrompt,
    incrementSearch,
    incrementAnalysis,
    setShowSignupPrompt,
    reset,
  };
}