import axiosInstance from './axiosInstance';

export type Unit = {
  id: number;
  short_name: string;
  description: string | null;
  is_active: boolean;
};

export type ProductCategory = {
  id: number;
  name: string;
  description: string | null;
  is_active: boolean;
};

export type Product = {
  id: number;
  name: string;
  product_code: string | null;
  category: ProductCategory;
  unit: Unit;
  is_cylinder: boolean;
  description: string | null;
  is_active: boolean;
};

export type ProductWrite = {
  name: string;
  product_code?: string | null;
  category: number;
  unit: number;
  is_cylinder: boolean;
  description?: string | null;
  is_active: boolean;
};

const inventoryApi = {
  // Products
  getProducts: (params?: any) =>
    axiosInstance.get('/inventory/products/', { params }).then((res) => res.data),

  createProduct: (data: ProductWrite) =>
    axiosInstance.post('/inventory/products/', data).then((res) => res.data),

  updateProduct: (id: number, data: Partial<ProductWrite>) =>
    axiosInstance.patch(`/inventory/products/${id}/`, data).then((res) => res.data),

  deleteProduct: (id: number) =>
    axiosInstance.delete(`/inventory/products/${id}/`).then((res) => res.data),

  // Categories
  getProductCategories: (params?: any) =>
    axiosInstance.get('/inventory/categories/', { params }).then((res) => res.data),

  createProductCategory: (data: Partial<ProductCategory>) =>
    axiosInstance.post('/inventory/categories/', data).then((res) => res.data),

  updateProductCategory: (id: number, data: Partial<ProductCategory>) =>
    axiosInstance.patch(`/inventory/categories/${id}/`, data).then((res) => res.data),

  deleteProductCategory: (id: number) =>
    axiosInstance.delete(`/inventory/categories/${id}/`).then((res) => res.data),

  // Units
  getUnits: (params?: any) =>
    axiosInstance.get('/inventory/units/', { params }).then((res) => res.data),

  createUnit: (data: Partial<Unit>) =>
    axiosInstance.post('/inventory/units/', data).then((res) => res.data),

  updateUnit: (id: number, data: Partial<Unit>) =>
    axiosInstance.patch(`/inventory/units/${id}/`, data).then((res) => res.data),

  deleteUnit: (id: number) =>
    axiosInstance.delete(`/inventory/units/${id}/`).then((res) => res.data),
};

export default inventoryApi;
