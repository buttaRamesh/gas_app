export interface Route {
  id: number;
  area_code: string;
  area_code_description: string;
  area_count: number;
  consumer_count: number;
  delivery_person: DeliveryPerson | null;
  areas?: Area[];
}

export interface Area {
  id: number;
  area_name: string;
  area_code?: string;
  consumer_count?: number;
  route: number | null;
  route_code?: string;
  route_description?: string;
}

export interface DeliveryPerson {
  id: number;
  name: string;
  contacts?: any[];
  assigned_routes_count?: number;
  assigned_routes?: Array<{
    route_id: number;
    route_code: string;
    route_description: string;
    consumer_count: number;
    areas: string[];
  }>;
  total_consumers?: number;
}

export interface DeliveryPersonStatistics {
  total_delivery_persons: number;
  total_assigned_routes: number;
  total_consumers: number;
  unassigned_persons: number;
  workload_distribution: Array<{
    delivery_person_id: number;
    delivery_person_name: string;
    route_count: number;
    consumer_count: number;
  }>;
}
