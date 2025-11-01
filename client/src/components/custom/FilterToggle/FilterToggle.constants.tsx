import type { FilterOption } from './FilterToggle.types';

// Example preset for KYC filtering
export const KYC_FILTER_OPTIONS: FilterOption[] = [
  {
    value: 'all',
    colors: {
      selected: 'rgba(168, 85, 247, 1)',
      unselected: 'rgba(243, 232, 255, 0.35)',
    },
  },
  {
    value: 'done',
    colors: {
      selected: 'rgba(34, 197, 94, 1)',
      unselected: 'rgba(220, 252, 231, 0.35)',
    },
  },
  {
    value: 'pending',
    colors: {
      selected: 'rgba(248, 113, 113, 1)',   
      unselected: 'rgba(254, 226, 226, 0.35)',
    },
  },
];

// Example preset for user status
export const USER_STATUS_OPTIONS: FilterOption[] = [
  {
    value: 'active',
    colors: {
      selected: 'rgba(34, 197, 94, 1)',
      unselected: 'rgba(220, 252, 231, 0.35)',
    },
  },
  {
    value: 'inactive',
    colors: {
      selected: 'rgba(156, 163, 175, 1)',
      unselected: 'rgba(243, 244, 246, 0.35)',
    },
  },
];

export const SHADOWS = {
  selected: '0 8px 16px -4px rgba(0, 0, 0, 0.25), 0 4px 8px -2px rgba(0, 0, 0, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.4)',
  unselected: '0 2px 8px -2px rgba(0, 0, 0, 0.08)',
} as const;

export const getFilterColors = (options: FilterOption[], filterValue: string) => {
  return options.find(option => option.value === filterValue)?.colors;
};
