import { useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

export interface UseUtilitiesReturn {
  // Formatting utilities
  formatCurrency: (amount: number, currency?: string) => string;
  formatDate: (date: Date | string, format?: 'short' | 'long' | 'relative') => string;
  formatFileSize: (bytes: number) => string;
  formatQuantity: (quantity: number, unit?: string) => string;
  
  // Validation utilities
  validateEmail: (email: string) => boolean;
  validateBarcode: (barcode: string) => boolean;
  validatePassword: (password: string) => { isValid: boolean; errors: string[] };
  
  // String utilities
  capitalizeFirst: (text: string) => string;
  truncateText: (text: string, maxLength: number) => string;
  generateSlug: (text: string) => string;
  sanitizeInput: (input: string) => string;
  
  // Array utilities
  sortByProperty: <T>(array: T[], property: keyof T, order?: 'asc' | 'desc') => T[];
  groupByProperty: <T>(array: T[], property: keyof T) => Record<string, T[]>;
  uniqueBy: <T>(array: T[], property: keyof T) => T[];
  
  // Device utilities
  isTablet: boolean;
  isPhone: boolean;
  isDesktop: boolean;
  deviceInfo: {
    platform: string;
    screenWidth: number;
    screenHeight: number;
    isLandscape: boolean;
  };
  
  // Storage utilities
  saveToStorage: (key: string, value: any) => Promise<void>;
  loadFromStorage: (key: string) => Promise<any>;
  removeFromStorage: (key: string) => Promise<void>;
  clearStorage: () => Promise<void>;
  
  // Network utilities
  isOnline: boolean;
  networkType: string;
  downloadSpeed: number | null;
  
  // Debugging utilities
  logDebug: (message: string, data?: any) => void;
  logError: (error: Error, context?: string) => void;
  logPerformance: (label: string, fn: () => void) => void;
  
  // Permissions utilities
  hasPermission: (permission: string) => boolean;
  requestPermission: (permission: string) => Promise<boolean>;
  
  // App utilities
  appVersion: string;
  buildNumber: string;
  isDebugMode: boolean;
}

export const useUtilities = (): UseUtilitiesReturn => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [networkInfo, setNetworkInfo] = useState({
    isOnline: navigator.onLine,
    type: 'unknown',
    speed: null as number | null,
  });

  // Device detection
  const deviceInfo = useMemo(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    return {
      platform: navigator.platform || 'unknown',
      screenWidth: width,
      screenHeight: height,
      isLandscape: width > height,
    };
  }, []);

  const isTablet = useMemo(() => 
    deviceInfo.screenWidth >= 768 && deviceInfo.screenWidth < 1024
  , [deviceInfo.screenWidth]);

  const isPhone = useMemo(() => 
    deviceInfo.screenWidth < 768
  , [deviceInfo.screenWidth]);

  const isDesktop = useMemo(() => 
    deviceInfo.screenWidth >= 1024
  , [deviceInfo.screenWidth]);

  // Format currency
  const formatCurrency = useCallback((amount: number, currency: string = 'PLN') => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency,
    }).format(amount);
  }, []);

  // Format date
  const formatDate = useCallback((date: Date | string, format: 'short' | 'long' | 'relative' = 'short') => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    switch (format) {
      case 'long':
        return new Intl.DateTimeFormat('pl-PL', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }).format(dateObj);
      
      case 'relative':
        const now = new Date();
        const diffMs = now.getTime() - dateObj.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Dzisiaj';
        if (diffDays === 1) return 'Wczoraj';
        if (diffDays < 7) return `${diffDays} dni temu`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} tygodni temu`;
        return `${Math.floor(diffDays / 30)} miesięcy temu`;
      
      default:
        return new Intl.DateTimeFormat('pl-PL').format(dateObj);
    }
  }, []);

  // Format file size
  const formatFileSize = useCallback((bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
  }, []);

  // Format quantity
  const formatQuantity = useCallback((quantity: number, unit?: string) => {
    const formatted = quantity % 1 === 0 ? quantity.toString() : quantity.toFixed(1);
    return unit ? `${formatted} ${unit}` : formatted;
  }, []);

  // Validate email
  const validateEmail = useCallback((email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  // Validate barcode
  const validateBarcode = useCallback((barcode: string) => {
    // EAN-13 or UPC-A validation
    const cleanBarcode = barcode.replace(/\D/g, '');
    return cleanBarcode.length === 13 || cleanBarcode.length === 12;
  }, []);

  // Validate password
  const validatePassword = useCallback((password: string) => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Hasło musi mieć co najmniej 8 znaków');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Hasło musi zawierać co najmniej jedną wielką literę');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Hasło musi zawierać co najmniej jedną małą literę');
    }
    if (!/\d/.test(password)) {
      errors.push('Hasło musi zawierać co najmniej jedną cyfrę');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }, []);

  // Capitalize first letter
  const capitalizeFirst = useCallback((text: string) => {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }, []);

  // Truncate text
  const truncateText = useCallback((text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }, []);

  // Generate slug
  const generateSlug = useCallback((text: string) => {
    return text
      .toLowerCase()
      .replace(/[ąćęłńóśźż]/g, (match) => {
        const replacements: Record<string, string> = {
          'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'ń': 'n',
          'ó': 'o', 'ś': 's', 'ź': 'z', 'ż': 'z',
        };
        return replacements[match] || match;
      })
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }, []);

  // Sanitize input
  const sanitizeInput = useCallback((input: string) => {
    return input
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .trim();
  }, []);

  // Sort by property
  const sortByProperty = useCallback(<T>(array: T[], property: keyof T, order: 'asc' | 'desc' = 'asc') => {
    return [...array].sort((a, b) => {
      const aVal = a[property];
      const bVal = b[property];
      
      if (aVal < bVal) return order === 'asc' ? -1 : 1;
      if (aVal > bVal) return order === 'asc' ? 1 : -1;
      return 0;
    });
  }, []);

  // Group by property
  const groupByProperty = useCallback(<T>(array: T[], property: keyof T) => {
    return array.reduce((groups, item) => {
      const key = String(item[property]);
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
      return groups;
    }, {} as Record<string, T[]>);
  }, []);

  // Get unique items by property
  const uniqueBy = useCallback(<T>(array: T[], property: keyof T) => {
    const seen = new Set();
    return array.filter(item => {
      const key = item[property];
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }, []);

  // Storage utilities
  const saveToStorage = useCallback(async (key: string, value: any) => {
    try {
      const jsonValue = JSON.stringify(value);
      localStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error('Error saving to storage:', error);
      throw error;
    }
  }, []);

  const loadFromStorage = useCallback(async (key: string) => {
    try {
      const jsonValue = localStorage.getItem(key);
      return jsonValue ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Error loading from storage:', error);
      return null;
    }
  }, []);

  const removeFromStorage = useCallback(async (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from storage:', error);
      throw error;
    }
  }, []);

  const clearStorage = useCallback(async () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }, []);

  // Debug utilities
  const logDebug = useCallback((message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${message}`, data || '');
    }
  }, []);

  const logError = useCallback((error: Error, context?: string) => {
    console.error(`[ERROR] ${context || 'Unknown context'}:`, error);
  }, []);

  const logPerformance = useCallback((label: string, fn: () => void) => {
    if (process.env.NODE_ENV === 'development') {
      console.time(label);
      fn();
      console.timeEnd(label);
    } else {
      fn();
    }
  }, []);

  // Permission utilities
  const hasPermission = useCallback((permission: string) => {
    // This would be implemented based on your permission system
    return true; // Mock implementation
  }, []);

  const requestPermission = useCallback(async (permission: string) => {
    // This would be implemented based on your permission system
    return true; // Mock implementation
  }, []);

  return {
    // Formatting utilities
    formatCurrency,
    formatDate,
    formatFileSize,
    formatQuantity,
    
    // Validation utilities
    validateEmail,
    validateBarcode,
    validatePassword,
    
    // String utilities
    capitalizeFirst,
    truncateText,
    generateSlug,
    sanitizeInput,
    
    // Array utilities
    sortByProperty,
    groupByProperty,
    uniqueBy,
    
    // Device utilities
    isTablet,
    isPhone,
    isDesktop,
    deviceInfo,
    
    // Storage utilities
    saveToStorage,
    loadFromStorage,
    removeFromStorage,
    clearStorage,
    
    // Network utilities
    isOnline: networkInfo.isOnline,
    networkType: networkInfo.type,
    downloadSpeed: networkInfo.speed,
    
    // Debugging utilities
    logDebug,
    logError,
    logPerformance,
    
    // Permissions utilities
    hasPermission,
    requestPermission,
    
    // App utilities
    appVersion: process.env.REACT_APP_VERSION || '1.0.0',
    buildNumber: process.env.REACT_APP_BUILD || '1',
    isDebugMode: process.env.NODE_ENV === 'development',
  };
};
