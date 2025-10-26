export interface Unit {
  id: number;
  short_name: string;
  description: string;
  created_at?: string;
  updated_at?: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  created_at?: string;
  updated_at?: string;
  variants_count?: number;
}

export type VariantType = 'DOMESTIC' | 'COMMERCIAL' | 'INDUSTRIAL' | 'OTHER';

export interface ProductVariant {
  id: number;
  product_code: string;
  name: string;
  product: number;
  product_name?: string;
  unit: number;
  unit_name?: string;
  size: number;
  variant_type: VariantType;
  price?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ProductCatalog {
  total_products: number;
  catalog: Array<{
    id: number;
    name: string;
    description: string;
    variants: ProductVariant[];
  }>;
}

export interface ProductStatistics {
  total_products: number;
  total_variants: number;
  variants_by_type: {
    [key: string]: number;
  };
}

export interface VariantStatistics {
  total_variants: number;
  by_type: {
    [key: string]: number;
  };
  by_product: Array<{
    product_id: number;
    product_name: string;
    variant_count: number;
  }>;
}
