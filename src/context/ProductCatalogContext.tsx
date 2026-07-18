import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { Product } from '../types';
import { syncPublishedProductsFromApi, getPublishedProducts } from '../services/productService';

interface ProductCatalogContextValue {
  products: Product[];
  loading: boolean;
  refreshProducts: () => Promise<void>;
}

const ProductCatalogContext = createContext<ProductCatalogContextValue | null>(null);

export function ProductCatalogProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() => getPublishedProducts());
  const [loading, setLoading] = useState(true);

  const refreshProducts = useCallback(async () => {
    setLoading(true);
    try {
      const list = await syncPublishedProductsFromApi();
      setProducts(list);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshProducts();
  }, [refreshProducts]);

  return (
    <ProductCatalogContext.Provider value={{ products, loading, refreshProducts }}>
      {children}
    </ProductCatalogContext.Provider>
  );
}

export function useProductCatalog() {
  const ctx = useContext(ProductCatalogContext);
  if (!ctx) {
    throw new Error('useProductCatalog must be used within ProductCatalogProvider');
  }
  return ctx;
}
