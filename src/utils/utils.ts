// General utility functions for Sprytna Spiżarnia

import { Platform, Dimensions, PixelRatio } from 'react-native';
import { validate as uuidValidate, version as uuidVersion } from 'uuid';

// String utilities
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const generateRandomString = (length: number = 8): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/\s+/g, ''));
};

export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 9) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
  }
  if (cleaned.length === 11 && cleaned.startsWith('48')) {
    return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{3})/, '+$1 $2 $3 $4');
  }
  return phone;
};

export const isValidUuid = (uuid: string): boolean => {
  return uuidValidate(uuid) && uuidVersion(uuid) === 4;
};

export const sanitizeFilename = (filename: string): string => {
  return filename.replace(/[^a-z0-9]/gi, '_').toLowerCase();
};

// Number utilities
export const formatNumber = (num: number, decimals: number = 2): string => {
  return num.toFixed(decimals).replace(/\.?0+$/, '');
};

export const formatCurrency = (amount: number, currency: string = 'PLN'): string => {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const formatPercentage = (value: number, total: number): string => {
  if (total === 0) return '0%';
  const percentage = (value / total) * 100;
  return `${formatNumber(percentage, 1)}%`;
};

export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

export const lerp = (start: number, end: number, factor: number): number => {
  return start + (end - start) * factor;
};

export const roundToNearest = (value: number, nearest: number): number => {
  return Math.round(value / nearest) * nearest;
};

// Array utilities
export const chunk = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

export const shuffle = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const unique = <T>(array: T[]): T[] => {
  return [...new Set(array)];
};

export const uniqueBy = <T>(array: T[], key: keyof T): T[] => {
  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
};

export const groupBy = <T, K extends keyof T>(array: T[], key: K): Record<string, T[]> => {
  return array.reduce((groups, item) => {
    const groupKey = String(item[key]);
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<string, T[]>);
};

export const sortBy = <T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
};

export const findLast = <T>(array: T[], predicate: (item: T) => boolean): T | undefined => {
  for (let i = array.length - 1; i >= 0; i--) {
    if (predicate(array[i])) {
      return array[i];
    }
  }
  return undefined;
};

// Object utilities
export const omit = <T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
  const result = { ...obj };
  keys.forEach(key => delete result[key]);
  return result;
};

export const pick = <T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
  const result = {} as Pick<T, K>;
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
};

export const deepMerge = <T extends object>(target: T, source: Partial<T>): T => {
  const result = { ...target };
  
  Object.keys(source).forEach(key => {
    const sourceValue = source[key as keyof T];
    const targetValue = result[key as keyof T];
    
    if (isObject(sourceValue) && isObject(targetValue)) {
      result[key as keyof T] = deepMerge(targetValue, sourceValue);
    } else {
      result[key as keyof T] = sourceValue as T[keyof T];
    }
  });
  
  return result;
};

export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as T;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as T;
  if (typeof obj === 'object') {
    const cloned = {} as T;
    Object.keys(obj).forEach(key => {
      cloned[key as keyof T] = deepClone(obj[key as keyof T]);
    });
    return cloned;
  }
  return obj;
};

export const isObject = (item: any): item is object => {
  return item !== null && typeof item === 'object' && !Array.isArray(item);
};

export const isEmpty = (value: any): boolean => {
  if (value == null) return true;
  if (typeof value === 'string') return value.length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

export const hasOwnProperty = <T extends object>(obj: T, prop: string): prop is keyof T => {
  return Object.prototype.hasOwnProperty.call(obj, prop);
};

// Function utilities
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

export const memoize = <T extends (...args: any[]) => any>(func: T): T => {
  const cache = new Map();
  
  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = func(...args);
    cache.set(key, result);
    return result;
  }) as T;
};

export const retry = async <T>(
  func: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> => {
  try {
    return await func();
  } catch (error) {
    if (retries > 0) {
      await sleep(delay);
      return retry(func, retries - 1, delay * 2); // exponential backoff
    }
    throw error;
  }
};

export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Platform utilities
export const isIOS = (): boolean => Platform.OS === 'ios';
export const isAndroid = (): boolean => Platform.OS === 'android';
export const isWeb = (): boolean => Platform.OS === 'web';

export const getScreenDimensions = () => {
  const { width, height } = Dimensions.get('window');
  return { width, height };
};

export const getPixelRatio = (): number => PixelRatio.get();

export const isTablet = (): boolean => {
  const { width, height } = getScreenDimensions();
  const aspectRatio = Math.max(width, height) / Math.min(width, height);
  return aspectRatio < 1.6 && Math.min(width, height) > 600;
};

export const getDeviceType = (): 'phone' | 'tablet' => {
  return isTablet() ? 'tablet' : 'phone';
};

// Validation utilities
export const isValidDate = (date: any): date is Date => {
  return date instanceof Date && !isNaN(date.getTime());
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const isValidJSON = (str: string): boolean => {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
};

export const validateRequired = (value: any): boolean => {
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return value != null;
};

export const validateMinLength = (value: string, minLength: number): boolean => {
  return value.length >= minLength;
};

export const validateMaxLength = (value: string, maxLength: number): boolean => {
  return value.length <= maxLength;
};

export const validateNumericRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max;
};

// Color utilities
export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

export const rgbToHex = (r: number, g: number, b: number): string => {
  return "#" + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }).join("");
};

export const adjustColorOpacity = (color: string, opacity: number): string => {
  const rgb = hexToRgb(color);
  if (!rgb) return color;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
};

// Storage size utilities
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const bytesToMB = (bytes: number): number => {
  return bytes / (1024 * 1024);
};

// Error handling utilities
export const safeJsonParse = <T>(json: string, fallback: T): T => {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
};

export const safeAsyncCall = async <T>(
  asyncFunc: () => Promise<T>,
  fallback: T
): Promise<T> => {
  try {
    return await asyncFunc();
  } catch {
    return fallback;
  }
};

export const createErrorHandler = (context: string) => {
  return (error: Error) => {
    console.error(`[${context}] Error:`, error);
    // Here you could integrate with crash reporting service
  };
};

// Random utilities
export const getRandomElement = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

export const getRandomElements = <T>(array: T[], count: number): T[] => {
  const shuffled = shuffle(array);
  return shuffled.slice(0, Math.min(count, array.length));
};

export const randomBetween = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

export const randomIntBetween = (min: number, max: number): number => {
  return Math.floor(randomBetween(min, max + 1));
};

// Performance utilities
export const measureTime = async <T>(func: () => Promise<T>): Promise<{ result: T; time: number }> => {
  const start = Date.now();
  const result = await func();
  const time = Date.now() - start;
  return { result, time };
};

export const createBatchProcessor = <T, R>(
  processor: (batch: T[]) => Promise<R[]>,
  batchSize: number = 10,
  delay: number = 100
) => {
  return async (items: T[]): Promise<R[]> => {
    const results: R[] = [];
    const batches = chunk(items, batchSize);
    
    for (const batch of batches) {
      const batchResults = await processor(batch);
      results.push(...batchResults);
      
      if (delay > 0 && batches.indexOf(batch) < batches.length - 1) {
        await sleep(delay);
      }
    }
    
    return results;
  };
};

// Environment utilities
export const isDevelopment = (): boolean => __DEV__;
export const isProduction = (): boolean => !__DEV__;

// Type guards
export const isString = (value: any): value is string => typeof value === 'string';
export const isNumber = (value: any): value is number => typeof value === 'number' && !isNaN(value);
export const isBoolean = (value: any): value is boolean => typeof value === 'boolean';
export const isArray = (value: any): value is any[] => Array.isArray(value);
export const isFunction = (value: any): value is Function => typeof value === 'function';

// Constants
export const EMPTY_ARRAY: readonly never[] = [];
export const EMPTY_OBJECT: Readonly<{}> = {};

// Default export with all utilities
export default {
  // String
  capitalize,
  truncateText,
  slugify,
  generateRandomString,
  isValidEmail,
  isValidPhoneNumber,
  formatPhoneNumber,
  isValidUuid,
  sanitizeFilename,
  
  // Number
  formatNumber,
  formatCurrency,
  formatPercentage,
  clamp,
  lerp,
  roundToNearest,
  
  // Array
  chunk,
  shuffle,
  unique,
  uniqueBy,
  groupBy,
  sortBy,
  findLast,
  
  // Object
  omit,
  pick,
  deepMerge,
  deepClone,
  isObject,
  isEmpty,
  hasOwnProperty,
  
  // Function
  debounce,
  throttle,
  memoize,
  retry,
  sleep,
  
  // Platform
  isIOS,
  isAndroid,
  isWeb,
  getScreenDimensions,
  getPixelRatio,
  isTablet,
  getDeviceType,
  
  // Validation
  isValidDate,
  isValidUrl,
  isValidJSON,
  validateRequired,
  validateMinLength,
  validateMaxLength,
  validateNumericRange,
  
  // Color
  hexToRgb,
  rgbToHex,
  adjustColorOpacity,
  
  // Storage
  formatFileSize,
  bytesToMB,
  
  // Error handling
  safeJsonParse,
  safeAsyncCall,
  createErrorHandler,
  
  // Random
  getRandomElement,
  getRandomElements,
  randomBetween,
  randomIntBetween,
  
  // Performance
  measureTime,
  createBatchProcessor,
  
  // Environment
  isDevelopment,
  isProduction,
  
  // Type guards
  isString,
  isNumber,
  isBoolean,
  isArray,
  isFunction,
  
  // Constants
  EMPTY_ARRAY,
  EMPTY_OBJECT,
};