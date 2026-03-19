
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ContentProvider } from './contexts/ContentContext';
import './index.css';

/**
 * Specifically suppress the 'ResizeObserver loop completed with undelivered notifications' error.
 * This error is benign and occurs when a ResizeObserver is unable to deliver all notifications 
 * within a single animation frame, common in complex layouts with charting libraries like Recharts.
 */
const silenceBenignErrors = () => {
  const benignPatterns = [
    'ResizeObserver loop completed with undelivered notifications',
    'ResizeObserver loop limit exceeded',
    'ResizeObserver loop'
  ];

  const isBenign = (message: any): boolean => {
    if (typeof message !== 'string') return false;
    const msg = message.toLowerCase();
    return benignPatterns.some(pattern => msg.includes(pattern.toLowerCase()));
  };

  // 1. Handle Window Error Events (for runtime exceptions)
  const errorHandler = (e: ErrorEvent | PromiseRejectionEvent) => {
    const message = (e instanceof ErrorEvent) ? e.message : (e as any).reason?.message;
    if (isBenign(message)) {
      e.stopImmediatePropagation();
      e.preventDefault();
      return true;
    }
    return false;
  };

  window.addEventListener('error', errorHandler, true);
  window.addEventListener('unhandledrejection', errorHandler as any, true);

  // Also handle window.onerror
  const originalOnerror = window.onerror;
  window.onerror = (msg, url, lineNo, columnNo, error) => {
    if (isBenign(msg)) return true;
    if (originalOnerror) return originalOnerror(msg, url, lineNo, columnNo, error);
    return false;
  };

  // 2. Monkey-patch Console (for direct browser/library logs)
  const originalError = console.error;
  console.error = (...args: any[]) => {
    if (args.some(arg => isBenign(arg) || (arg instanceof Error && isBenign(arg.message)))) {
      return;
    }
    originalError.apply(console, args);
  };

  const originalWarn = console.warn;
  console.warn = (...args: any[]) => {
    if (args.some(arg => isBenign(arg))) {
      return;
    }
    originalWarn.apply(console, args);
  };
};

silenceBenignErrors();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ContentProvider>
      <App />
    </ContentProvider>
  </React.StrictMode>
);
