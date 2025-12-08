// Add your type definitions here
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// Re-export all type modules
export * from './address';
export * from './auth';
export * from './person';
export * from './consumers';
export * from './products';
export * from './routes';
export * from './orderbook';
