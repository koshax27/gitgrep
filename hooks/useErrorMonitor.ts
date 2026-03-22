import { useEffect } from 'react';

async function reportError(errorData: any) {
  try {
    await fetch('/api/error-monitor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(errorData)
    });
  } catch (e) {
    console.error("Failed to report error:", e);
  }
}

export function useErrorMonitor() {
  useEffect(() => {
    // JavaScript Errors
    const handleError = (event: ErrorEvent) => {
      reportError({
        type: 'javascript',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
      });
    };

    // Promise Rejections
    const handleRejection = (event: PromiseRejectionEvent) => {
      reportError({
        type: 'promise',
        message: event.reason?.message || String(event.reason),
        stack: event.reason?.stack,
      });
    };

    // Console Errors
    const originalConsoleError = console.error;
    console.error = (...args) => {
      originalConsoleError(...args);
      reportError({
        type: 'console',
        message: args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' '),
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
      console.error = originalConsoleError;
    };
  }, []);
}