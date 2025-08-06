import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useMemo, useState } from 'react';
import { RootState, AppDispatch } from '../store/store';
import { 
  fetchProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  markProductAsConsumed,
  scanBarcode,
  uploadProductImage,
  setProductFilter,
  setProductSort
} from '../store/slices/productsSlice';
import { Product, ProductCategory, StorageLocation } from '../types/models';

export interface UseProductsReturn {
  // State
  products: Product[];
  filteredProducts: Product[];
  isLoading: boolean;
  error: string | null;
  filter: {
    category?: ProductCategory;
    location?: StorageLocation;
    expiryDays?: number;
    search?: string;
  };
  sort: {
    field: 'name' | 'expiryDate' | 'createdAt' | 'category';
    direction: 'asc' | 'desc';
  };
  
  // Actions
  loadProducts: () => Promise<void>;
  addNewProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Product>;
  updateExistingProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  removeProduct: (id: string) => Promise<void>;
  consumeProduct: (id: string, quantity?: number) => Promise<void>;
  scanProductBarcode: (barcode: string) => Promise<Product | null>;
  uploadImage: (productId: string, imageUri: string) => Promise<string>;
  setFilter: (filter: Partial<UseProductsReturn['filter']>) => void;
  setSort: (field: UseProductsReturn['sort']['field'], direction?: UseProductsReturn['sort']['direction']) => void;
  clearFilters: () => void;
  
  // Computed values
  totalProducts: number;
  expiredProducts: Product[];
  expiringProducts: Product[];
  categorizedProducts: Record<ProductCategory, Product[]>;
  productsByLocation: Record<StorageLocation, Product[]>;
  lowStockProducts: Product[];
  recentlyAddedProducts: Product[];
}

export const useProducts = (): UseProductsReturn => {
  const dispatch = useDispatch<AppDispatch>();
  const productsState = useSelector((state: RootState) => state.products);
  const { user, familyId } = useSelector((state: RootState) => state.auth);
  const [isProcessing, setIsProcessing] = useState(false);

  // Get filtered and sorted products
  const filteredProducts = useMemo(() => {
    let filtered = [...productsState.products];

    // Apply filters
    if (productsState.filter.category) {
      filtered = filtered.filter(product => product.category === productsState.filter.category);
    }
    
    if (productsState.filter.location) {
      filtered = filtered.filter(product => product.location === productsState.filter.location);
    }
    
    if (productsState.filter.search) {
      const searchTerm = productsState.filter.search.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        product.notes?.toLowerCase().includes(searchTerm)
      );
    }
    
    if (productsState.filter.expiryDays !== undefined) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + productsState.filter.expiryDays);
      filtered = filtered.filter(product => 
        new Date(product.expiryDate) <= targetDate
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const { field, direction } = productsState.sort;
      let comparison = 0;

      switch (field) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'expiryDate':
          comparison = new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'category':
          comparison = (a.category || '').localeCompare(b.category || '');
          break;
        default:
          comparison = 0;
      }

      return direction === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [productsState.products, productsState.filter, productsState.sort]);

  // Computed values
  const expiredProducts = useMemo(() => 
    productsState.products.filter(product => 
      new Date(product.expiryDate) < new Date() && !product.isConsumed
    ), [productsState.products]
  );

  const expiringProducts = useMemo(() => {
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    
    return productsState.products.filter(product => {
      const expiryDate = new Date(product.expiryDate);
      return expiryDate > new Date() && expiryDate <= threeDaysFromNow && !product.isConsumed;
    });
  }, [productsState.products]);

  const categorizedProducts = useMemo(() => {
    const categories: Record<ProductCategory, Product[]> = {
      'Nabiał': [],
      'Mięso i ryby': [],
      'Warzywa i owoce': [],
      'Pieczywo': [],
      'Przyprawy': [],
      'Napoje': [],
      'Słodycze': [],
      'Konserwy': [],
      'Mrożonki': [],
      'Kosmetyki': [],
      'Środki czystości': [],
      'Leki': [],
      'Inne': [],
    };

    productsState.products.forEach(product => {
      const category = product.category || 'Inne';
      categories[category].push(product);
    });

    return categories;
  }, [productsState.products]);

  const productsByLocation = useMemo(() => {
    const locations: Record<StorageLocation, Product[]> = {
      'Lodówka': [],
      'Spiżarnia': [],
      'Kuchnia': [],
      'Piwnica': [],
      'Szafka z przyprawami': [],
      'Zamrażarka': [],
      'Garaż': [],
      'Balkon': [],
      'Inne': [],
    };

    productsState.products.forEach(product => {
      locations[product.location].push(product);
    });

    return locations;
  }, [productsState.products]);

  const lowStockProducts = useMemo(() => 
    productsState.products.filter(product => {
      // Logic to determine low stock (could be based on quantity patterns)
      const quantity = parseFloat(product.quantity) || 0;
      return quantity <= 1 && !product.isConsumed;
    }), [productsState.products]
  );

  const recentlyAddedProducts = useMemo(() => {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    return productsState.products
      .filter(product => new Date(product.createdAt) > oneDayAgo)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [productsState.products]);

  // Load products
  const loadProducts = useCallback(async () => {
    try {
      await dispatch(fetchProducts({ familyId })).unwrap();
    } catch (error) {
      throw error;
    }
  }, [dispatch, familyId]);

  // Add new product
  const addNewProduct = useCallback(async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsProcessing(true);
    try {
      const product = await dispatch(addProduct({
        ...productData,
        ownerId: user?.uid || '',
        familyId,
      })).unwrap();
      return product;
    } catch (error) {
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [dispatch, user?.uid, familyId]);

  // Update existing product
  const updateExistingProduct = useCallback(async (id: string, updates: Partial<Product>) => {
    setIsProcessing(true);
    try {
      await dispatch(updateProduct({ id, updates })).unwrap();
    } catch (error) {
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [dispatch]);

  // Remove product
  const removeProduct = useCallback(async (id: string) => {
    setIsProcessing(true);
    try {
      await dispatch(deleteProduct({ id })).unwrap();
    } catch (error) {
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [dispatch]);

  // Mark product as consumed
  const consumeProduct = useCallback(async (id: string, quantity?: number) => {
    setIsProcessing(true);
    try {
      await dispatch(markProductAsConsumed({ id, quantity })).unwrap();
    } catch (error) {
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [dispatch]);

  // Scan barcode
  const scanProductBarcode = useCallback(async (barcode: string) => {
    setIsProcessing(true);
    try {
      const result = await dispatch(scanBarcode({ barcode })).unwrap();
      return result;
    } catch (error) {
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [dispatch]);

  // Upload product image
  const uploadImage = useCallback(async (productId: string, imageUri: string) => {
    setIsProcessing(true);
    try {
      const imageUrl = await dispatch(uploadProductImage({ productId, imageUri })).unwrap();
      return imageUrl;
    } catch (error) {
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [dispatch]);

  // Set filter
  const setFilter = useCallback((filter: Partial<UseProductsReturn['filter']>) => {
    dispatch(setProductFilter(filter));
  }, [dispatch]);

  // Set sort
  const setSort = useCallback((field: UseProductsReturn['sort']['field'], direction: UseProductsReturn['sort']['direction'] = 'asc') => {
    dispatch(setProductSort({ field, direction }));
  }, [dispatch]);

  // Clear filters
  const clearFilters = useCallback(() => {
    dispatch(setProductFilter({}));
  }, [dispatch]);

  return {
    // State
    products: productsState.products,
    filteredProducts,
    isLoading: productsState.loading || isProcessing,
    error: productsState.error,
    filter: productsState.filter,
    sort: productsState.sort,
    
    // Actions
    loadProducts,
    addNewProduct,
    updateExistingProduct,
    removeProduct,
    consumeProduct,
    scanProductBarcode,
    uploadImage,
    setFilter,
    setSort,
    clearFilters,
    
    // Computed values
    totalProducts: productsState.products.length,
    expiredProducts,
    expiringProducts,
    categorizedProducts,
    productsByLocation,
    lowStockProducts,
    recentlyAddedProducts,
  };
};
