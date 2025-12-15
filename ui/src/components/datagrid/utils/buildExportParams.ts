/**
 * buildExportParams - Builds export parameters from grid state
 *
 * Extracts filters, sorting, and other params from DataGrid state
 * to send to the export endpoint
 */
import type { GridSortModel, GridFilterModel } from '@mui/x-data-grid';

interface BuildExportParamsOptions {
  extraParams: Record<string, any>;
  filterModel: GridFilterModel;
  sortModel: GridSortModel;
}

/**
 * Builds comprehensive export parameters including all active filters
 */
export function buildExportParams({
  extraParams,
  filterModel,
  sortModel,
}: BuildExportParamsOptions): Record<string, any> {
  const params: Record<string, any> = {
    ...extraParams,
  };

  // Add quick filter (search bar)
  if (filterModel.quickFilterValues?.[0]) {
    params.search = filterModel.quickFilterValues[0];
  }

  // Add column filters from filter panel
  if (filterModel.items && filterModel.items.length > 0) {
    filterModel.items.forEach((filter) => {
      if (!filter.field || filter.value === undefined || filter.value === null) {
        return;
      }

      const { field, operator, value } = filter;

      // Map DataGrid operators to backend query params
      switch (operator) {
        case 'contains':
        case 'startsWith':
        case 'endsWith':
          params[field] = value;
          break;

        case 'equals':
        case '=':
          params[field] = value;
          break;

        case 'is':
          params[field] = value;
          break;

        case '>':
        case 'after':
          params[`${field}__gt`] = value;
          break;

        case '>=':
        case 'onOrAfter':
          params[`${field}__gte`] = value;
          break;

        case '<':
        case 'before':
          params[`${field}__lt`] = value;
          break;

        case '<=':
        case 'onOrBefore':
          params[`${field}__lte`] = value;
          break;

        case '!=':
        case 'not':
          params[`${field}__ne`] = value;
          break;

        case 'isEmpty':
          params[`${field}__isnull`] = 'true';
          break;

        case 'isNotEmpty':
          params[`${field}__isnull`] = 'false';
          break;

        case 'isAnyOf':
          if (Array.isArray(value) && value.length > 0) {
            params[`${field}__in`] = value.join(',');
          }
          break;

        default:
          params[field] = value;
      }
    });
  }

  // Add ordering (sorting)
  if (sortModel.length > 0) {
    const orderingFields = sortModel
      .filter((s) => s?.field)
      .map((s) => (s.sort === 'desc' ? `-${s.field}` : s.field));

    if (orderingFields.length > 0) {
      params.ordering = orderingFields.join(',');
    }
  }

  return params;
}
