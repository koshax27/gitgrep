// hooks/useGuestTracking.ts
import { useState, useEffect } from 'react';

export function useGuestTracking() {
  const [searchCount, setSearchCount] = useState(0);
  const [repoAnalysisCount, setRepoAnalysisCount] = useState(0);
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    // جلب العداد من localStorage
    const savedSearch = localStorage.getItem('guest_search_count');
    const savedAnalysis = localStorage.getItem('guest_analysis_count');
    const savedUserCount = localStorage.getItem('gitgrep_user_count');
    
    if (savedSearch) setSearchCount(parseInt(savedSearch));
    if (savedAnalysis) setRepoAnalysisCount(parseInt(savedAnalysis));
    if (savedUserCount) setUserCount(parseInt(savedUserCount));
    
    // جلب عدد المستخدمين الحقيقي من API
    fetchUserCount();
  }, []);

  // جلب عدد المستخدمين الحقيقي من الـ API
  const fetchUserCount = async () => {
    try {
      const res = await fetch('/api/user-count');
      const data = await res.json();
      if (data.count) {
        setUserCount(data.count);
        localStorage.setItem('gitgrep_user_count', data.count.toString());
      }
    } catch (error) {
      console.error('Failed to fetch user count:', error);
    }
  };

  const incrementSearch = () => {
    const newCount = searchCount + 1;
    setSearchCount(newCount);
    localStorage.setItem('guest_search_count', newCount.toString());
    console.log("🔍 incrementSearch called, new count:", newCount);
    
    if (newCount === 2) {
      console.log("🎯 Showing signup prompt, count is 2");
      setShowSignupPrompt(true);
    }
    
    return newCount;
  };

  const incrementAnalysis = () => {
    const newCount = repoAnalysisCount + 1;
    setRepoAnalysisCount(newCount);
    localStorage.setItem('guest_analysis_count', newCount.toString());
    
    if (newCount === 1 && !showSignupPrompt) {
      console.log("🎯 Showing signup prompt after analysis");
      setShowSignupPrompt(true);
    }
    
    return newCount;
  };

  const reset = () => {
    setSearchCount(0);
    setRepoAnalysisCount(0);
    setShowSignupPrompt(false);
    localStorage.removeItem('guest_search_count');
    localStorage.removeItem('guest_analysis_count');
    console.log("🔄 Guest tracking reset");
  };

  const registerNewUser = async () => {
    try {
      const res = await fetch('/api/register-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.count) {
        setUserCount(data.count);
        localStorage.setItem('gitgrep_user_count', data.count.toString());
      }
      return data.count;
    } catch (error) {
      console.error('Failed to register user:', error);
      return null;
    }
  };

  const setShowSignupPromptManually = (show: boolean) => {
    setShowSignupPrompt(show);
  };

  return {
    searchCount,
    repoAnalysisCount,
    showSignupPrompt,
    userCount,
    incrementSearch,
    incrementAnalysis,
    setShowSignupPrompt: setShowSignupPromptManually,
    reset,
    registerNewUser,
    fetchUserCount,
  };
}