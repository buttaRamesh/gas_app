export interface DeliveryPerson {
  id: number;
  person: {
    id: number;
    full_name: string;
    first_name: string;
    last_name: string;
    contacts: Array<{
      mobile_number: string;
      email?: string;
    }>;
  };
  assigned_routes_count: number;
  total_consumers: number;
}

export interface DeliveryPersonStats {
  total_delivery_persons: number;
  assigned_delivery_persons: number;
  unassigned_delivery_persons: number;
  total_routes: number;
}

export type SortField = "person_name" | "assigned_routes_count" | "total_consumers";
export type SortDirection = "asc" | "desc" | null;
export type AssignmentFilter = "all" | "assigned" | "unassigned";
