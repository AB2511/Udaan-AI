/**
 * Performance optimization hooks
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

/**
 * Hook for debouncing values to reduce API calls
 */
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Hook for throttling function calls
 */
export const useThrottle = (callback, delay) => {
  const lastRun = useRef(Date.now());

  return useCallback((...args) => {
    if (Date.now() - lastRun.current >= delay) {
      callback(...args);
      lastRun.current = Date.now();
    }
  }, [callback, delay]);
};

/**
 * Hook for lazy loading data with intersection observer
 */
export const useLazyLoad = (options = {}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const elementRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setIsVisible(true);
          setHasLoaded(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [hasLoaded, options]);

  return [elementRef, isVisible, hasLoaded];
};

/**
 * Hook for virtual scrolling large lists
 */
export const useVirtualScroll = (items, itemHeight, containerHeight) => {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );

    return {
      startIndex,
      endIndex,
      items: items.slice(startIndex, endIndex),
      totalHeight: items.length * itemHeight,
      offsetY: startIndex * itemHeight
    };
  }, [items, itemHeight, containerHeight, scrollTop]);

  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  return {
    visibleItems,
    handleScroll,
    scrollTop
  };
};

/**
 * Hook for memoizing expensive calculations
 */
export const useExpensiveCalculation = (calculateFn, dependencies) => {
  return useMemo(() => {
    const startTime = performance.now();
    const result = calculateFn();
    const endTime = performance.now();
    
    if (endTime - startTime > 100) {
      console.warn(`Expensive calculation took ${endTime - startTime}ms`);
    }
    
    return result;
  }, dependencies);
};

/**
 * Hook for caching API responses
 */
export const useApiCache = (key, fetchFn, options = {}) => {
  const { ttl = 5 * 60 * 1000, enabled = true } = options; // 5 minutes default TTL
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const cacheRef = useRef(new Map());

  const getCachedData = useCallback((cacheKey) => {
    const cached = cacheRef.current.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.data;
    }
    return null;
  }, [ttl]);

  const setCachedData = useCallback((cacheKey, data) => {
    cacheRef.current.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
  }, []);

  const fetchData = useCallback(async (forceRefresh = false) => {
    if (!enabled) return;

    const cachedData = getCachedData(key);
    if (cachedData && !forceRefresh) {
      setData(cachedData);
      return cachedData;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await fetchFn();
      setData(result);
      setCachedData(key, result);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [key, fetchFn, enabled, getCachedData, setCachedData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: () => fetchData(true),
    clearCache: () => cacheRef.current.delete(key)
  };
};

/**
 * Hook for optimizing re-renders with shallow comparison
 */
export const useShallowMemo = (value) => {
  const ref = useRef(value);

  if (!shallowEqual(ref.current, value)) {
    ref.current = value;
  }

  return ref.current;
};

/**
 * Shallow equality comparison
 */
const shallowEqual = (obj1, obj2) => {
  if (obj1 === obj2) return true;
  
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') {
    return false;
  }
  
  if (obj1 === null || obj2 === null) {
    return obj1 === obj2;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (let key of keys1) {
    if (obj1[key] !== obj2[key]) {
      return false;
    }
  }

  return true;
};

/**
 * Hook for batching state updates
 */
export const useBatchedUpdates = (initialState) => {
  const [state, setState] = useState(initialState);
  const batchRef = useRef({});
  const timeoutRef = useRef(null);

  const batchUpdate = useCallback((updates) => {
    Object.assign(batchRef.current, updates);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setState(prevState => ({
        ...prevState,
        ...batchRef.current
      }));
      batchRef.current = {};
    }, 0);
  }, []);

  return [state, batchUpdate];
};

/**
 * Hook for measuring component performance
 */
export const usePerformanceMeasure = (componentName) => {
  const renderStartTime = useRef(performance.now());
  const mountTime = useRef(null);

  useEffect(() => {
    mountTime.current = performance.now();
    const mountDuration = mountTime.current - renderStartTime.current;
    
    if (mountDuration > 100) {
      console.warn(`${componentName} took ${mountDuration}ms to mount`);
    }
  }, [componentName]);

  useEffect(() => {
    renderStartTime.current = performance.now();
  });

  return {
    measureRender: (label) => {
      const duration = performance.now() - renderStartTime.current;
      if (duration > 50) {
        console.warn(`${componentName} ${label} took ${duration}ms`);
      }
    }
  };
};

/**
 * Hook for preloading resources
 */
export const usePreloadResources = (resources) => {
  const [loadedResources, setLoadedResources] = useState(new Set());

  useEffect(() => {
    const preloadPromises = resources.map(async (resource) => {
      try {
        if (resource.type === 'image') {
          const img = new Image();
          img.src = resource.url;
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
          });
        } else if (resource.type === 'script') {
          await import(resource.url);
        }
        
        setLoadedResources(prev => new Set([...prev, resource.url]));
      } catch (error) {
        console.warn(`Failed to preload resource: ${resource.url}`, error);
      }
    });

    Promise.allSettled(preloadPromises);
  }, [resources]);

  return loadedResources;
};

export default {
  useDebounce,
  useThrottle,
  useLazyLoad,
  useVirtualScroll,
  useExpensiveCalculation,
  useApiCache,
  useShallowMemo,
  useBatchedUpdates,
  usePerformanceMeasure,
  usePreloadResources
};