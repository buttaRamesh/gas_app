import { routesApi, deliveryPersonsApi, consumersApi } from "@/services/api";
import {
  LocationOn as LocationIcon,
  LocalShipping as RouteIcon,
  People as ConsumersIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
} from "@mui/icons-material";
import type { Route, DeliveryPerson } from "@/types/routes";

export interface EntityConfig<T = any> {
  api: {
    getAll: () => Promise<any>;
    getConsumers: (id: number, options?: any) => Promise<any>;
  };
  labels: {
    entity: string;
    entityPlural: string;
    selector: string;
  };
  getDisplayName: (entity: T) => string;
  getDescription: (entity: T) => string;
  getEntityId: (entity: T) => number;
  columns: Array<{
    field: string;
    headerName: string;
    width?: number;
    flex?: number;
    type?: string;
    renderCell?: (params: any) => any;
  }>;
  summaryCards: Array<{
    label: string;
    getValue: (entity: T | null, count?: number) => string | number;
    icon: any;
    color: "success" | "primary" | "info" | "warning" | "error";
  }>;
  exportFilenamePrefix: string;
}

export const entityConfigs: Record<string, EntityConfig> = {
  route: {
    api: {
      getAll: () => routesApi.getAll(),
      getConsumers: (id: number, options?: any) => consumersApi.getByRoute(id, options),
    },
    labels: {
      entity: "Route",
      entityPlural: "Routes",
      selector: "Select Route",
    },
    getDisplayName: (route: Route) => route.area_code,
    getDescription: (route: Route) =>
      `${route.area_code_description} • ${route.consumer_count || 0} consumers`,
    getEntityId: (route: Route) => route.id,
    columns: [
      {
        field: "consumer_number",
        headerName: "Consumer Number",
        width: 150,
      },
      {
        field: "consumer_name",
        headerName: "Name",
        width: 200,
        flex: 1,
      },
      {
        field: "category",
        headerName: "Category",
        width: 130,
      },
      {
        field: "consumer_type",
        headerName: "Type",
        width: 130,
      },
      {
        field: "mobile",
        headerName: "Mobile",
        width: 130,
        renderCell: (params: any) => params.value || "-",
      },
      {
        field: "address",
        headerName: "Address",
        width: 250,
        flex: 1,
        renderCell: (params: any) => params.value || "-",
      },
      {
        field: "cylinders",
        headerName: "Cylinders",
        width: 100,
        type: "number",
      },
    ],
    summaryCards: [
      {
        label: "Total Consumers",
        getValue: (_, count) => count || 0,
        icon: ConsumersIcon,
        color: "success",
      },
      {
        label: "Route Code",
        getValue: (route: Route | null) => route?.area_code || "-",
        icon: RouteIcon,
        color: "primary",
      },
      {
        label: "Areas Count",
        getValue: (route: Route | null) => route?.area_count || 0,
        icon: LocationIcon,
        color: "info",
      },
    ],
    exportFilenamePrefix: "route",
  },
  delivery_person: {
    api: {
      getAll: () => deliveryPersonsApi.getAll(),
      getConsumers: (id: number, options?: any) => deliveryPersonsApi.getConsumers(id, options),
    },
    labels: {
      entity: "Delivery Person",
      entityPlural: "Delivery Persons",
      selector: "Select Delivery Person",
    },
    getDisplayName: (person: DeliveryPerson) => person.name,
    getDescription: (person: DeliveryPerson) =>
      `${person.assigned_routes_count || 0} routes • ${person.total_consumers || 0} consumers`,
    getEntityId: (person: DeliveryPerson) => person.id,
    columns: [
      {
        field: "consumer_number",
        headerName: "Consumer Number",
        width: 150,
      },
      {
        field: "consumer_name",
        headerName: "Name",
        width: 200,
        flex: 1,
      },
      {
        field: "category",
        headerName: "Category",
        width: 130,
      },
      {
        field: "consumer_type",
        headerName: "Type",
        width: 130,
      },
      {
        field: "route_code",
        headerName: "Route",
        width: 100,
      },
      {
        field: "mobile",
        headerName: "Mobile",
        width: 130,
        renderCell: (params: any) => params.value || "-",
      },
      {
        field: "address",
        headerName: "Address",
        width: 250,
        flex: 1,
        renderCell: (params: any) => params.value || "-",
      },
      {
        field: "cylinders",
        headerName: "Cylinders",
        width: 100,
        type: "number",
      },
    ],
    summaryCards: [
      {
        label: "Assigned Routes",
        getValue: (person: DeliveryPerson | null) => person?.assigned_routes_count || 0,
        icon: RouteIcon,
        color: "info",
      },
      {
        label: "Total Consumers",
        getValue: (_, count) => count || 0,
        icon: ConsumersIcon,
        color: "success",
      },
      {
        label: "Delivery Person",
        getValue: (person: DeliveryPerson | null) => person?.name || "-",
        icon: PersonIcon,
        color: "primary",
      },
    ],
    exportFilenamePrefix: "delivery_person",
  },
};
