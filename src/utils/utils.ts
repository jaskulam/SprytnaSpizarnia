// utils.ts - Funkcje pomocnicze dla aplikacji Sprytna Spiżarnia

import { Product, ProductCategory, Recipe, ShoppingListItem } from '../types/models';

// ============== FORMATOWANIE DAT ==============

/**
 * Formatuje datę do polskiego formatu
 */
export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

/**
 * Formatuje datę z czasem
 */
export const formatDateTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Formatuje datę do formatu względnego (np. "za 3 dni", "wczoraj")
 */
export const formatRelativeDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffTime = d.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Dzisiaj';
  if (diffDays === 1) return 'Jutro';
  if (diffDays === -1) return 'Wczoraj';
  if (diffDays > 0 && diffDays <= 7) return `Za ${diffDays} dni`;
  if (diffDays < 0 && diffDays >= -7) return `${Math.abs(diffDays)} dni temu`;
  
  return formatDate(d);
};

/**
 * Oblicza dni do daty ważności
 */
export const getDaysUntilExpiry = (expiryDate: Date | string): number => {
  const d = typeof expiryDate === 'string' ? new Date(expiryDate) : expiryDate;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  
  const diffTime = d.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Sprawdza czy produkt jest przeterminowany
 */
export const isExpired = (expiryDate: Date | string): boolean => {
  return getDaysUntilExpiry(expiryDate) < 0;
};

/**
 * Sprawdza czy produkt wkrótce się przeterminuje
 */
export const isExpiringSoon = (expiryDate: Date | string, daysThreshold: number = 3): boolean => {
  const days = getDaysUntilExpiry(expiryDate);
  return days >= 0 && days <= daysThreshold;
};

// ============== ŚWIEŻOŚĆ PRODUKTÓW ==============

/**
 * Określa status świeżości produktu
 */
export type FreshnessStatus = 'expired' | 'expiring-soon' | 'fresh';

export const getFreshnessStatus = (expiryDate: Date | string, daysThreshold: number = 3): FreshnessStatus => {
  if (isExpired(expiryDate)) return 'expired';
  if (isExpiringSoon(expiryDate, daysThreshold)) return 'expiring-soon';
  return 'fresh';
};

/**
 * Zwraca kolor dla statusu świeżości
 */
export const getFreshnessColor = (status: FreshnessStatus): string => {
  switch (status) {
    case 'expired': return 'red';
    case 'expiring-soon': return 'orange';
    case 'fresh': return 'green';
  }
};

/**
 * Zwraca klasę CSS dla statusu świeżości
 */
export const getFreshnessClass = (status: FreshnessStatus): string => {
  switch (status) {
    case 'expired': return 'bg-red-500';
    case 'expiring-soon': return 'bg-orange-500';
    case 'fresh': return 'bg-green-500';
  }
};

// ============== SORTOWANIE I FILTROWANIE ==============

/**
 * Sortuje produkty według daty ważności
 */
export const sortProductsByExpiry = (products: Product[]): Product[] => {
  return [...products].sort((a, b) => {
    const dateA = new Date(a.expiryDate).getTime();
    const dateB = new Date(b.expiryDate).getTime();
    return dateA - dateB;
  });
};

/**
 * Filtruje produkty według lokalizacji
 */
export const filterProductsByLocation = (products: Product[], location: string): Product[] => {
  return products.filter(p => p.location === location);
};

/**
 * Filtruje produkty według kategorii
 */
export const filterProductsByCategory = (products: Product[], category: ProductCategory): Product[] => {
  return products.filter(p => p.category === category);
};

/**
 * Grupuje produkty według lokalizacji
 */
export const groupProductsByLocation = (products: Product[]): Record<string, Product[]> => {
  return products.reduce((acc, product) => {
    const location = product.location || 'Inne';
    if (!acc[location]) acc[location] = [];
    acc[location].push(product);
    return acc;
  }, {} as Record<string, Product[]>);
};

/**
 * Grupuje produkty według statusu świeżości
 */
export const groupProductsByFreshness = (products: Product[], daysThreshold: number = 3): {
  expired: Product[];
  expiringSoon: Product[];
  fresh: Product[];
} => {
  const result = {
    expired: [] as Product[],
    expiringSoon: [] as Product[],
    fresh: [] as Product[]
  };
  
  products.forEach(product => {
    const status = getFreshnessStatus(product.expiryDate, daysThreshold);
    switch (status) {
      case 'expired':
        result.expired.push(product);
        break;
      case 'expiring-soon':
        result.expiringSoon.push(product);
        break;
      case 'fresh':
        result.fresh.push(product);
        break;
    }
  });
  
  return result;
};

// ============== WYSZUKIWANIE ==============

/**
 * Wyszukuje produkty po nazwie
 */
export const searchProducts = (products: Product[], query: string): Product[] => {
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) return products;
  
  return products.filter(product => 
    product.name.toLowerCase().includes(normalizedQuery) ||
    product.category?.toLowerCase().includes(normalizedQuery) ||
    product.location?.toLowerCase().includes(normalizedQuery) ||
    product.tags?.some(tag => tag.toLowerCase().includes(normalizedQuery))
  );
};

/**
 * Wyszukuje przepisy po składnikach
 */
export const searchRecipesByIngredients = (recipes: Recipe[], ingredients: string[]): Recipe[] => {
  const normalizedIngredients = ingredients.map(i => i.toLowerCase());
  
  return recipes.filter(recipe => {
    const recipeIngredients = recipe.ingredients.map(i => i.name.toLowerCase());
    return normalizedIngredients.some(ingredient => 
      recipeIngredients.some(recipeIngredient => 
        recipeIngredient.includes(ingredient)
      )
    );
  });
};

// ============== WALIDACJA ==============

/**
 * Waliduje adres email
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Waliduje hasło według wymagań
 */
export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Hasło musi mieć co najmniej 8 znaków');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Hasło musi zawierać co najmniej jedną dużą literę');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Hasło musi zawierać co najmniej jedną małą literę');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Hasło musi zawierać co najmniej jedną cyfrę');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Waliduje kod kreskowy
 */
export const validateBarcode = (barcode: string): boolean => {
  // EAN-13 lub EAN-8
  return /^[0-9]{8}$/.test(barcode) || /^[0-9]{13}$/.test(barcode);
};

// ============== FORMATOWANIE TEKSTU ==============

/**
 * Formatuje ilość produktu
 */
export const formatQuantity = (quantity: string | number, unit?: string): string => {
  if (unit) {
    return `${quantity} ${unit}`;
  }
  return quantity.toString();
};

/**
 * Formatuje cenę
 */
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN'
  }).format(price / 100); // cena w groszach
};

/**
 * Skraca tekst do określonej długości
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

/**
 * Kapitalizuje pierwszą literę
 */
export const capitalize = (text: string): string => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * Normalizuje tekst do wyszukiwania
 */
export const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // usuwa znaki diakrytyczne
    .replace(/[^a-z0-9\s]/g, '') // usuwa znaki specjalne
    .trim();
};

// ============== LISTA ZAKUPÓW ==============

/**
 * Generuje listę zakupów na podstawie brakujących produktów
 */
export const generateShoppingList = (
  products: Product[], 
  minQuantityThreshold: number = 1
): ShoppingListItem[] => {
  const lowStockProducts = products.filter(p => {
    const quantity = parseInt(p.quantity) || 0;
    return quantity <= minQuantityThreshold;
  });
  
  return lowStockProducts.map(product => ({
    id: generateId(),
    name: product.name,
    quantity: product.quantity,
    checked: false,
    addedBy: 'System',
    addedAt: new Date(),
    category: product.category,
    productId: product.id
  }));
};

/**
 * Łączy duplikaty na liście zakupów
 */
export const mergeDuplicateItems = (items: ShoppingListItem[]): ShoppingListItem[] => {
  const merged = new Map<string, ShoppingListItem>();
  
  items.forEach(item => {
    const key = normalizeText(item.name);
    if (merged.has(key)) {
      const existing = merged.get(key)!;
      // Łączymy ilości jeśli są liczbowe
      const existingQty = parseInt(existing.quantity || '1');
      const newQty = parseInt(item.quantity || '1');
      existing.quantity = (existingQty + newQty).toString();
    } else {
      merged.set(key, { ...item });
    }
  });
  
  return Array.from(merged.values());
};

// ============== STATYSTYKI ==============

/**
 * Oblicza statystyki produktów
 */
export const calculateProductStats = (products: Product[]) => {
  const total = products.length;
  const expired = products.filter(p => isExpired(p.expiryDate)).length;
  const expiringSoon = products.filter(p => isExpiringSoon(p.expiryDate)).length;
  const fresh = total - expired - expiringSoon;
  
  const byLocation = products.reduce((acc, p) => {
    const loc = p.location || 'Inne';
    acc[loc] = (acc[loc] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const byCategory = products.reduce((acc, p) => {
    const cat = p.category || 'Inne';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return {
    total,
    expired,
    expiringSoon,
    fresh,
    byLocation,
    byCategory,
    expiryRate: total > 0 ? (expired / total) * 100 : 0,
    freshnessScore: total > 0 ? (fresh / total) * 100 : 100
  };
};

/**
 * Oblicza wartość marnowanych produktów
 */
export const calculateWasteValue = (
  expiredProducts: Product[], 
  estimatedPrices: Record<string, number>
): number => {
  return expiredProducts.reduce((total, product) => {
    const price = estimatedPrices[product.id] || 0;
    return total + price;
  }, 0);
};

// ============== POMOCNICZE ==============

/**
 * Generuje unikalny ID
 */
export const generateId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Głębokie klonowanie obiektu
 */
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Debounce funkcji
 */
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

/**
 * Throttle funkcji
 */
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

/**
 * Sprawdza czy aplikacja jest w trybie development
 */
export const isDevelopment = (): boolean => {
  return process.env.NODE_ENV === 'development';
};

/**
 * Sprawdza czy aplikacja jest w trybie produkcji
 */
export const isProduction = (): boolean => {
  return process.env.NODE_ENV === 'production';
};

/**
 * Loguje w trybie development
 */
export const devLog = (...args: any[]): void => {
  if (isDevelopment()) {
    console.log('[DEV]', ...args);
  }
};

// ============== OBRAZY ==============

/**
 * Kompresuje obraz przed wysłaniem
 */
export const compressImage = async (
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1080,
  quality: number = 0.8
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Skalowanie zachowując proporcje
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Błąd kompresji obrazu'));
          },
          'image/webp',
          quality
        );
      };
    };
    reader.onerror = reject;
  });
};

/**
 * Konwertuje obraz do base64
 */
export const imageToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });
};

// ============== LOCALSTORAGE ==============

/**
 * Bezpieczny zapis do localStorage
 */
export const saveToLocalStorage = (key: string, value: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Błąd zapisu do localStorage:', error);
  }
};

/**
 * Bezpieczny odczyt z localStorage
 */
export const getFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Błąd odczytu z localStorage:', error);
    return defaultValue;
  }
};

/**
 * Usuwa z localStorage
 */
export const removeFromLocalStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Błąd usuwania z localStorage:', error);
  }
};

// ============== SIEĆ ==============

/**
 * Sprawdza czy jest połączenie z internetem
 */
export const isOnline = (): boolean => {
  return navigator.onLine;
};

/**
 * Retry wrapper dla operacji sieciowych
 */
export const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error | undefined;
  
  for (let i = 0; i < maxAttempts; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      if (i < maxAttempts - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }
  
  throw lastError;
};

// ============== EKSPORT DANYCH ==============

/**
 * Eksportuje dane do JSON
 */
export const exportToJSON = (data: any, filename: string): void => {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

/**
 * Eksportuje dane do CSV
 */
export const exportToCSV = (data: any[], filename: string): void => {
  if (data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : value;
      }).join(',')
    )
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};
