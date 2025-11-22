/**
 * Custom hooks
 * Exported for use across the application
 */

// Entity-specific hooks
export { useConsumerLookups } from './useConsumerLookups';
export type { UseConsumerLookupsOptions, UseConsumerLookupsReturn } from './useConsumerLookups';

export { useRoutes } from './useRoutes';
export type { UseRoutesOptions, UseRoutesReturn } from './useRoutes';

export { useProducts } from './useProducts';
export type { UseProductsOptions, UseProductsReturn } from './useProducts';

export { useDeliveryPersons } from './useDeliveryPersons';
export type { UseDeliveryPersonsOptions, UseDeliveryPersonsReturn } from './useDeliveryPersons';

// Utility hooks
export { useDialog } from './useDialog';
export type { UseDialogOptions, UseDialogReturn } from './useDialog';

export { useSearch } from './useSearch';
export type { UseSearchOptions, UseSearchReturn } from './useSearch';
