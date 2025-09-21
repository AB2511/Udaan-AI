/**
 * Lazy loading components for performance optimization
 */

import { lazy, Suspense } from 'react';
import LoadingStates from './LoadingStates';

// Lazy load heavy components for minimal demo
export const LazyResumeAnalyzer = lazy(() => 
  import('./dashboard/ResumeAnalyzer').then(module => ({
    default: module.default
  }))
);

export const LazyMockInterviewWidget = lazy(() => 
  import('./dashboard/MockInterviewWidget').then(module => ({
    default: module.default
  }))
);



// Higher-order component for lazy loading with error boundary
export const withLazyLoading = (LazyComponent, fallback = null) => {
  return function LazyWrapper(props) {
    return (
      <Suspense fallback={fallback || <LoadingStates.ComponentLoading />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
};

// Pre-configured lazy components with loading states for minimal demo
export const ResumeAnalyzer = withLazyLoading(
  LazyResumeAnalyzer,
  <LoadingStates.ResumeLoading />
);

export const MockInterviewWidget = withLazyLoading(
  LazyMockInterviewWidget,
  <LoadingStates.InterviewLoading />
);



// Preload components for better UX - minimal demo
export const preloadComponents = {
  resume: () => import('./dashboard/ResumeAnalyzer'),
  interview: () => import('./dashboard/MockInterviewWidget')
};

// Preload component based on user interaction
export const preloadComponent = (componentName) => {
  if (preloadComponents[componentName]) {
    preloadComponents[componentName]().catch(error => {
      console.warn(`Failed to preload ${componentName} component:`, error);
    });
  }
};

// Hook for preloading components on hover or focus
export const usePreloadOnHover = (componentName) => {
  const handleMouseEnter = () => {
    preloadComponent(componentName);
  };

  const handleFocus = () => {
    preloadComponent(componentName);
  };

  return {
    onMouseEnter: handleMouseEnter,
    onFocus: handleFocus
  };
};

export default {
  ResumeAnalyzer,
  MockInterviewWidget,
  withLazyLoading,
  preloadComponent,
  usePreloadOnHover
};