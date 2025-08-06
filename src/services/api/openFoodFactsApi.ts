import { config } from '../firebase/config';
import { Product, ProductCategory, ProductUnit } from '../../types/models';

interface OpenFoodFactsProduct {
  code: string;
  product: {
    product_name: string;
    brands: string;
    quantity: string;
    categories_tags: string[];
    image_url: string;
    nutriments: {
      energy_100g: number;
      proteins_100g: number;
      carbohydrates_100g: number;
      fat_100g: number;
    };
  };
  status: number;
}

export class OpenFoodFactsApiService {
  static async scanBarcode(barcode: string): Promise<Partial<Product>> {
    try {
      const response = await fetch(`${config.openFoodFactsUrl}/product/${barcode}.json`);
      const data: OpenFoodFactsProduct = await response.json();

      if (data.status !== 1) {
        throw new Error('Produkt nie został znaleziony');
      }

      const product = data.product;
      
      return {
        name: product.product_name || 'Nieznany produkt',
        barcode: barcode,
        category: this.mapCategory(product.categories_tags),
        unit: this.parseUnit(product.quantity),
        quantity: this.parseQuantity(product.quantity),
        imageUrl: product.image_url,
      };
    } catch (error) {
      console.error('Error scanning barcode:', error);
      throw new Error('Nie udało się zeskanować kodu kreskowego');
    }
  }

  private static mapCategory(tags: string[]): ProductCategory {
    const categoryMap: Record<string, ProductCategory> = {
      'dairy': 'dairy',
      'meat': 'meat',
      'vegetables': 'vegetables',
      'fruits': 'fruits',
      'bakery': 'bakery',
      'beverages': 'beverages',
      'frozen': 'frozen',
      'snacks': 'snacks',
    };

    for (const tag of tags) {
      for (const [key, value] of Object.entries(categoryMap)) {
        if (tag.includes(key)) {
          return value;
        }
      }
    }

    return 'other';
  }

  private static parseUnit(quantity: string): ProductUnit {
    const lowerQuantity = quantity.toLowerCase();
    
    if (lowerQuantity.includes('kg')) return 'kg';
    if (lowerQuantity.includes('g')) return 'g';
    if (lowerQuantity.includes('l')) return 'l';
    if (lowerQuantity.includes('ml')) return 'ml';
    
    return 'pcs';
  }

  private static parseQuantity(quantity: string): number {
    const match = quantity.match(/(\d+\.?\d*)/);
    return match ? parseFloat(match[1]) : 1;
  }

  static async searchProducts(query: string): Promise<Array<Partial<Product>>> {
    try {
      const response = await fetch(
        `${config.openFoodFactsUrl}/cgi/search.pl?search_terms=${encodeURIComponent(query)}&json=1&page_size=20`
      );
      const data = await response.json();

      return data.products.map((product: any) => ({
        name: product.product_name || 'Nieznany produkt',
        barcode: product.code,
        category: this.mapCategory(product.categories_tags || []),
        imageUrl: product.image_url,
      }));
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  }
}
