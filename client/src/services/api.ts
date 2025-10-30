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
  getConsumers: (id: number, options?: { page?: number; page_size?: number; search?: string }) => {
    const params = new URLSearchParams();
    if (options?.page) params.append('page', options.page.toString());
    if (options?.page_size) params.append('page_size', options.page_size.toString());
    if (options?.search?.trim()) params.append('search', options.search.trim());
    return api.get(`/delivery-persons/${id}/consumers/?${params.toString()}`);
  },
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

// Consumers API
export const consumersApi = {
  getAll: (filters?: {
    category?: number;
    consumer_type?: number;
    opting_status?: string;
    is_kyc_done?: boolean;
    scheme?: number;
    search?: string;
    ordering?: string;
    page?: number;
  }) => {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category.toString());
    if (filters?.consumer_type) params.append('consumer_type', filters.consumer_type.toString());
    if (filters?.opting_status) params.append('opting_status', filters.opting_status);
    if (filters?.is_kyc_done !== undefined) params.append('is_kyc_done', filters.is_kyc_done.toString());
    if (filters?.scheme) params.append('scheme', filters.scheme.toString());
    if (filters?.search?.trim()) params.append('search', filters.search.trim());
    if (filters?.ordering) params.append('ordering', filters.ordering);
    if (filters?.page) params.append('page', filters.page.toString());
    return api.get(`/consumers/?${params.toString()}`);
  },
  getById: (id: number) => api.get(`/consumers/${id}/`),
  create: (data: any) => api.post('/consumers/', data),
  update: (id: number, data: any) => api.patch(`/consumers/${id}/`, data),
  delete: (id: number) => api.delete(`/consumers/${id}/`),
  getKycPending: () => api.get('/consumers/kyc_pending/'),
  getByRoute: (routeIdOrCode: number | string, options?: { page?: number; page_size?: number; search?: string }) => {
    const params = new URLSearchParams();
    if (typeof routeIdOrCode === 'number') {
      params.append('route_id', routeIdOrCode.toString());
    } else {
      params.append('route_code', routeIdOrCode);
    }
    if (options?.page) params.append('page', options.page.toString());
    if (options?.page_size) params.append('page_size', options.page_size.toString());
    if (options?.search?.trim()) params.append('search', options.search.trim());
    return api.get(`/consumers/by_route/?${params.toString()}`);
  },
  getRoute: (id: number) => api.get(`/consumers/${id}/route/`),
  updateKycStatus: (id: number, isKycDone: boolean) =>
    api.patch(`/consumers/${id}/update_kyc_status/`, { is_kyc_done: isKycDone }),
  getStatistics: () => api.get('/consumers/statistics/'),
};

// Connections API
export const connectionsApi = {
  getAll: (filters?: {
    consumer?: number;
    connection_type?: number;
    product?: number;
    search?: string;
    ordering?: string;
    page?: number;
  }) => {
    const params = new URLSearchParams();
    if (filters?.consumer) params.append('consumer', filters.consumer.toString());
    if (filters?.connection_type) params.append('connection_type', filters.connection_type.toString());
    if (filters?.product) params.append('product', filters.product.toString());
    if (filters?.search?.trim()) params.append('search', filters.search.trim());
    if (filters?.ordering) params.append('ordering', filters.ordering);
    if (filters?.page) params.append('page', filters.page.toString());
    return api.get(`/connections/?${params.toString()}`);
  },
  getById: (id: number) => api.get(`/connections/${id}/`),
  getByConsumer: (consumerId: number) => api.get(`/connections/by-consumer/${consumerId}/`),
  getByConnectionType: (connectionTypeId: number) =>
    api.get(`/connections/by_connection_type/?connection_type=${connectionTypeId}`),
  create: (data: any) => api.post('/connections/', data),
  update: (id: number, data: any) => api.patch(`/connections/${id}/`, data),
  delete: (id: number) => api.delete(`/connections/${id}/`),
  getStatistics: () => api.get('/connections/statistics/'),
};

// Consumer Categories API
export const consumerCategoriesApi = {
  getAll: (search?: string) => {
    const params = new URLSearchParams();
    if (search?.trim()) params.append('search', search.trim());
    return api.get(`/lookups/consumer-categories/?${params.toString()}`);
  },
  getById: (id: number) => api.get(`/lookups/consumer-categories/${id}/`),
  create: (data: any) => api.post('/lookups/consumer-categories/', data),
  update: (id: number, data: any) => api.patch(`/lookups/consumer-categories/${id}/`, data),
  delete: (id: number) => api.delete(`/lookups/consumer-categories/${id}/`),
};

// Consumer Types API
export const consumerTypesApi = {
  getAll: (search?: string) => {
    const params = new URLSearchParams();
    if (search?.trim()) params.append('search', search.trim());
    return api.get(`/lookups/consumer-types/?${params.toString()}`);
  },
  getById: (id: number) => api.get(`/lookups/consumer-types/${id}/`),
  create: (data: any) => api.post('/lookups/consumer-types/', data),
  update: (id: number, data: any) => api.patch(`/lookups/consumer-types/${id}/`, data),
  delete: (id: number) => api.delete(`/lookups/consumer-types/${id}/`),
};

// BPL Types API
export const bplTypesApi = {
  getAll: (search?: string) => {
    const params = new URLSearchParams();
    if (search?.trim()) params.append('search', search.trim());
    return api.get(`/lookups/bpl-types/?${params.toString()}`);
  },
  getById: (id: number) => api.get(`/lookups/bpl-types/${id}/`),
  create: (data: any) => api.post('/lookups/bpl-types/', data),
  update: (id: number, data: any) => api.patch(`/lookups/bpl-types/${id}/`, data),
  delete: (id: number) => api.delete(`/lookups/bpl-types/${id}/`),
};

// DCT Types API
export const dctTypesApi = {
  getAll: (search?: string) => {
    const params = new URLSearchParams();
    if (search?.trim()) params.append('search', search.trim());
    return api.get(`/lookups/dct-types/?${params.toString()}`);
  },
  getById: (id: number) => api.get(`/lookups/dct-types/${id}/`),
  create: (data: any) => api.post('/lookups/dct-types/', data),
  update: (id: number, data: any) => api.patch(`/lookups/dct-types/${id}/`, data),
  delete: (id: number) => api.delete(`/lookups/dct-types/${id}/`),
};

// Market Types API
export const marketTypesApi = {
  getAll: (search?: string) => {
    const params = new URLSearchParams();
    if (search?.trim()) params.append('search', search.trim());
    return api.get(`/lookups/market-types/?${params.toString()}`);
  },
  getById: (id: number) => api.get(`/lookups/market-types/${id}/`),
  create: (data: any) => api.post('/lookups/market-types/', data),
  update: (id: number, data: any) => api.patch(`/lookups/market-types/${id}/`, data),
  delete: (id: number) => api.delete(`/lookups/market-types/${id}/`),
};

// Connection Types API
export const connectionTypesApi = {
  getAll: (search?: string) => {
    const params = new URLSearchParams();
    if (search?.trim()) params.append('search', search.trim());
    return api.get(`/lookups/connection-types/?${params.toString()}`);
  },
  getById: (id: number) => api.get(`/lookups/connection-types/${id}/`),
  create: (data: any) => api.post('/lookups/connection-types/', data),
  update: (id: number, data: any) => api.patch(`/lookups/connection-types/${id}/`, data),
  delete: (id: number) => api.delete(`/lookups/connection-types/${id}/`),
};

// Schemes API
export const schemesApi = {
  getAll: (search?: string) => {
    const params = new URLSearchParams();
    if (search?.trim()) params.append('search', search.trim());
    return api.get(`/schemes/?${params.toString()}`);
  },
  getById: (id: number) => api.get(`/schemes/${id}/`),
  create: (data: any) => api.post('/schemes/', data),
  update: (id: number, data: any) => api.patch(`/schemes/${id}/`, data),
  delete: (id: number) => api.delete(`/schemes/${id}/`),
};

// Subsidy Details API
export const subsidyDetailsApi = {
  getAll: (search?: string, year?: number) => {
    const params = new URLSearchParams();
    if (search?.trim()) params.append('search', search.trim());
    if (year) params.append('year', year.toString());
    return api.get(`/subsidy-details/?${params.toString()}`);
  },
  getById: (id: number) => api.get(`/subsidy-details/${id}/`),
  create: (data: any) => api.post('/subsidy-details/', data),
  update: (id: number, data: any) => api.patch(`/subsidy-details/${id}/`, data),
  delete: (id: number) => api.delete(`/subsidy-details/${id}/`),
};

// Legacy Lookups API (for backward compatibility)
export const lookupsApi = {
  getConsumerCategories: () => api.get('/lookups/consumer-categories/'),
  getConsumerTypes: () => api.get('/lookups/consumer-types/'),
  getBPLTypes: () => api.get('/lookups/bpl-types/'),
  getDCTTypes: () => api.get('/lookups/dct-types/'),
};

// Addresses API
export const addressesApi = {
  getAll: (filters?: {
    content_type?: number;
    content_type_model?: string;
    object_id?: number;
    city_town_village?: string;
    district?: string;
    pin_code?: string;
    search?: string;
    ordering?: string;
    page?: number;
  }) => {
    const params = new URLSearchParams();
    if (filters?.content_type) params.append('content_type', filters.content_type.toString());
    if (filters?.content_type_model) params.append('content_type_model', filters.content_type_model);
    if (filters?.object_id) params.append('object_id', filters.object_id.toString());
    if (filters?.city_town_village) params.append('city_town_village', filters.city_town_village);
    if (filters?.district) params.append('district', filters.district);
    if (filters?.pin_code) params.append('pin_code', filters.pin_code);
    if (filters?.search?.trim()) params.append('search', filters.search.trim());
    if (filters?.ordering) params.append('ordering', filters.ordering);
    if (filters?.page) params.append('page', filters.page.toString());
    return api.get(`/addresses/?${params.toString()}`);
  },
  getById: (id: number) => api.get(`/addresses/${id}/`),
  create: (data: any) => api.post('/addresses/', data),
  update: (id: number, data: any) => api.patch(`/addresses/${id}/`, data),
  delete: (id: number) => api.delete(`/addresses/${id}/`),
  getStatistics: () => api.get('/addresses/statistics/'),
};

// Contacts API
export const contactsApi = {
  getAll: (filters?: {
    content_type?: number;
    content_type_model?: string;
    object_id?: number;
    search?: string;
    ordering?: string;
    page?: number;
  }) => {
    const params = new URLSearchParams();
    if (filters?.content_type) params.append('content_type', filters.content_type.toString());
    if (filters?.content_type_model) params.append('content_type_model', filters.content_type_model);
    if (filters?.object_id) params.append('object_id', filters.object_id.toString());
    if (filters?.search?.trim()) params.append('search', filters.search.trim());
    if (filters?.ordering) params.append('ordering', filters.ordering);
    if (filters?.page) params.append('page', filters.page.toString());
    return api.get(`/contacts/?${params.toString()}`);
  },
  getById: (id: number) => api.get(`/contacts/${id}/`),
  create: (data: any) => api.post('/contacts/', data),
  update: (id: number, data: any) => api.patch(`/contacts/${id}/`, data),
  delete: (id: number) => api.delete(`/contacts/${id}/`),
  getStatistics: () => api.get('/contacts/statistics/'),
};

// Content Types API
export const contentTypesApi = {
  getAll: () => api.get('/content-types/'),
  getByModel: (modelName: string) => api.get(`/content-types/?model=${modelName}`),
};

export default api;
