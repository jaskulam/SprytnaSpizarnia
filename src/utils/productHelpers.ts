import { Product, ProductCategory, ProductUnit } from '../types/models';
import { PRODUCT_CATEGORIES } from '../constants/categories';
import { getDaysUntilExpiry } from './dateHelpers';

export const getFreshnessColor = (expiryDate?: Date): string => {
  const days = getDaysUntilExpiry(expiryDate);
  if (days < 0) return '#F44336';
  if (days <= 3) return '#FF9800';
  return '#4CAF50';
};

export const estimateExpiryDate = (category: ProductCategory): Date => {
  const categoryInfo = PRODUCT_CATEGORIES[category];
  const days = categoryInfo.averageFreshnessDays;
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + days);
  return expiryDate;
};

export const groupProductsByCategory = (products: Product[]): Record<ProductCategory, Product[]> => {
  return products.reduce((groups, product) => {
    const category = product.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(product);
    return groups;
  }, {} as Record<ProductCategory, Product[]>);
};

export const sortProductsByExpiry = (products: Product[]): Product[] => {
  return [...products].sort((a, b) => {
    const daysA = getDaysUntilExpiry(a.expiryDate);
    const daysB = getDaysUntilExpiry(b.expiryDate);
    return daysA - daysB;
  });
};

export const getExpiringProducts = (products: Product[], daysThreshold: number = 3): Product[] => {
  return products.filter(product => {
    const days = getDaysUntilExpiry(product.expiryDate);
    return days >= 0 && days <= daysThreshold;
  });
};

export const getExpiredProducts = (products: Product[]): Product[] => {
  return products.filter(product => {
    const days = getDaysUntilExpiry(product.expiryDate);
    return days < 0;
  });
};

export const formatProductQuantity = (quantity: number, unit: ProductUnit): string => {
  if (unit === 'pcs' && quantity === 1) {
    return '1 sztuka';
  } else if (unit === 'pcs') {
    return `${quantity} ${quantity > 4 ? 'sztuk' : 'sztuki'}`;
  }
  return `${quantity} ${unit}`;
};

export const getProductSummary = (products: Product[]): {
  total: number;
  expiring: number;
  expired: number;
  categories: Record<ProductCategory, number>;
} => {
  const summary = {
    total: products.length,
    expiring: getExpiringProducts(products).length,
    expired: getExpiredProducts(products).length,
    categories: {} as Record<ProductCategory, number>,
  };

  products.forEach(product => {
    if (!summary.categories[product.category]) {
      summary.categories[product.category] = 0;
    }
    summary.categories[product.category]++;
  });

  return summary;
};

export const searchProducts = (products: Product[], query: string): Product[] => {
  const lowerQuery = query.toLowerCase();
  return products.filter(product => 
    product.name.toLowerCase().includes(lowerQuery) ||
    product.category.toLowerCase().includes(lowerQuery) ||
    product.location.toLowerCase().includes(lowerQuery) ||
    product.notes?.toLowerCase().includes(lowerQuery)
  );
};

export const validateProductData = (data: Partial<Product>): string[] => {
  const errors: string[] = [];

  if (!data.name || data.name.trim().length === 0) {
    errors.push('Nazwa produktu jest wymagana');
  }

  if (!data.quantity || data.quantity <= 0) {
    errors.push('Ilość musi być większa od 0');
  }

  if (!data.unit) {
    errors.push('Jednostka jest wymagana');
  }

  if (!data.category) {
    errors.push('Kategoria jest wymagana');
  }

  return errors;
};
