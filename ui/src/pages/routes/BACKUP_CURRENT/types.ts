// TypeScript interfaces for Routes page

export interface Route {
  id: number;
  area_code: string;
  area_code_description: string;
  area_count: number;
  consumer_count: number;
  delivery_person_name: string | null;
}

export interface RouteResponse {
  count: number;
  page: number;
  page_size: number;
  results: Route[];
  statistics: RouteStats;
}

export interface RouteStats {
  total_routes: number;
  assigned_routes: number;
  unassigned_routes: number;
  total_consumers: number;
  assigned_consumers: number;
  average_consumers_per_route: number;
}

export type SortOption = "area_code" | "consumer_count" | "area_count" | "delivery_person";

export type AssignmentFilter = "all" | "assigned" | "unassigned";
