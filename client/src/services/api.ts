import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Routes API
export const routesApi = {
  getAll: () => api.get('/routes/'),
  getById: (id: number) => api.get(`/routes/${id}/`),
  create: (data: any) => api.post('/routes/', data),
  update: (id: number, data: any) => api.put(`/routes/${id}/`, data),
  delete: (id: number) => api.delete(`/routes/${id}/`),
  getStatistics: () => api.get('/routes/statistics/'),
};

// Areas API
export const areasApi = {
  getAll: (page?: number, search?: string) => {
    const params = new URLSearchParams();
    params.append('page_size', '10');
    if (page) params.append('page', page.toString());
    if (search?.trim()) params.append('search', search.trim());
    return api.get(`/route-areas/?${params.toString()}`);
  },
  getById: (id: number) => api.get(`/route-areas/${id}/`),
  getByRoute: (routeId: number) => api.get(`/route-areas/?route=${routeId}`),
  getAvailable: (page?: number, search?: string) => {
    const params = new URLSearchParams();
    params.append('assigned', 'false');
    params.append('page_size', '10');
    if (page) params.append('page', page.toString());
    if (search?.trim()) params.append('search', search.trim());
    return api.get(`/route-areas/?${params.toString()}`);
  },
  create: (data: any) => api.post('/route-areas/', data),
  update: (id: number, data: any) => api.put(`/route-areas/${id}/`, data),
  delete: (id: number) => api.delete(`/route-areas/${id}/`),
  assignToRoute: (areaId: number, routeId: number) => api.post(`/route-areas/${areaId}/assign_to_route/`, { route: routeId }),
  removeFromRoute: (areaId: number) => api.post(`/route-areas/${areaId}/unassign_from_route/`),
};

// Delivery Persons API
export const deliveryPersonsApi = {
  getAll: (search?: string) => {
    const params = new URLSearchParams();
    if (search?.trim()) params.append('search', search.trim());
    return api.get(`/delivery-persons/?${params.toString()}`);
  },
  getById: (id: number) => api.get(`/delivery-persons/${id}/`),
  create: (data: any) => api.post('/delivery-persons/', data),
  update: (id: number, data: any) => api.patch(`/delivery-persons/${id}/`, data),
  delete: (id: number) => api.delete(`/delivery-persons/${id}/`),
  getAssignedRoutes: (id: number) => api.get(`/delivery-persons/${id}/assigned_routes/`),
  getConsumers: (id: number) => api.get(`/delivery-persons/${id}/consumers/`),
  getUnassigned: () => api.get('/delivery-persons/unassigned/'),
  getStatistics: () => api.get('/delivery-persons/statistics/'),
};

// Route Assignments API
export const routeAssignmentsApi = {
  getAll: (personId?: number, routeId?: number) => {
    const params = new URLSearchParams();
    if (personId) params.append('delivery_person', personId.toString());
    if (routeId) params.append('route', routeId.toString());
    return api.get(`/delivery-route-assignments/?${params.toString()}`);
  },
  getById: (id: number) => api.get(`/delivery-route-assignments/${id}/`),
  create: (data: any) => api.post('/delivery-route-assignments/', data),
  update: (id: number, data: any) => api.patch(`/delivery-route-assignments/${id}/`, data),
  delete: (id: number) => api.delete(`/delivery-route-assignments/${id}/`),
  bulkAssign: (deliveryPersonId: number, routeIds: number[]) => 
    api.post('/delivery-route-assignments/bulk_assign/', { 
      delivery_person: deliveryPersonId, 
      routes: routeIds 
    }),
  reassign: (routeId: number, newDeliveryPersonId: number) =>
    api.post('/delivery-route-assignments/reassign/', {
      route: routeId,
      new_delivery_person: newDeliveryPersonId
    }),
  unassignRoute: (routeId: number) =>
    api.delete(`/delivery-route-assignments/unassign_route/?route=${routeId}`),
};

// Units API
export const unitsApi = {
  getAll: (search?: string) => {
    const params = new URLSearchParams();
    if (search?.trim()) params.append('search', search.trim());
    return api.get(`/products/units/?${params.toString()}`);
  },
  getById: (id: number) => api.get(`/products/units/${id}/`),
  create: (data: any) => api.post('/products/units/', data),
  update: (id: number, data: any) => api.patch(`/products/units/${id}/`, data),
  delete: (id: number) => api.delete(`/products/units/${id}/`),
  getStatistics: () => api.get('/products/units/statistics/'),
};

// Products API
export const productsApi = {
  getAll: (search?: string, ordering?: string) => {
    const params = new URLSearchParams();
    if (search?.trim()) params.append('search', search.trim());
    if (ordering) params.append('ordering', ordering);
    return api.get(`/products/products/?${params.toString()}`);
  },
  getById: (id: number) => api.get(`/products/products/${id}/`),
  create: (data: any) => api.post('/products/products/', data),
  update: (id: number, data: any) => api.patch(`/products/products/${id}/`, data),
  delete: (id: number) => api.delete(`/products/products/${id}/`),
  getVariants: (id: number) => api.get(`/products/products/${id}/variants/`),
  addVariant: (id: number, variantData: any) => api.post(`/products/products/${id}/add_variant/`, variantData),
  getStatistics: () => api.get('/products/products/statistics/'),
  getCatalog: () => api.get('/products/products/catalog/'),
};

// Product Variants API
export const variantsApi = {
  getAll: (filters?: {
    product?: number;
    variant_type?: string;
    unit?: number;
    search?: string;
    ordering?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.product) params.append('product', filters.product.toString());
    if (filters?.variant_type) params.append('variant_type', filters.variant_type);
    if (filters?.unit) params.append('unit', filters.unit.toString());
    if (filters?.search?.trim()) params.append('search', filters.search.trim());
    if (filters?.ordering) params.append('ordering', filters.ordering);
    return api.get(`/products/variants/?${params.toString()}`);
  },
  getById: (id: number) => api.get(`/products/variants/${id}/`),
  create: (data: any) => api.post('/products/variants/', data),
  update: (id: number, data: any) => api.patch(`/products/variants/${id}/`, data),
  delete: (id: number) => api.delete(`/products/variants/${id}/`),
  getByType: (type: string) => api.get(`/products/variants/by_type/?type=${type}`),
  getByProduct: (productId: number) => api.get(`/products/variants/by_product/?product_id=${productId}`),
  searchBySize: (minSize?: number, maxSize?: number) => {
    const params = new URLSearchParams();
    if (minSize !== undefined) params.append('min_size', minSize.toString());
    if (maxSize !== undefined) params.append('max_size', maxSize.toString());
    return api.get(`/products/variants/search_by_size/?${params.toString()}`);
  },
  getStatistics: () => api.get('/products/variants/statistics/'),
  bulkCreate: (data: any[]) => api.post('/products/variants/bulk_create/', { variants: data }),
};

export default api;
