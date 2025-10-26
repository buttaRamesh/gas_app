// Consumer-related TypeScript types

export type OptingStatus = 'OPT_IN' | 'OPT_OUT' | 'PENDING';

export interface Address {
  id: number;
  address_text?: string;
  city?: string;
  pin_code?: string;
}

export interface Contact {
  id: number;
  email?: string;
  mobile_number?: string;
  phone_number?: string;
}

export interface ConsumerListItem {
  id: number;
  consumer_number: string;
  consumer_name: string;
  category: number;
  category_name?: string;
  consumer_type: number;
  type_name?: string;
  opting_status: OptingStatus;
  opting_status_display?: string;
  is_kyc_done: boolean;
  mobile_number?: string;
}

export interface ConsumerDetail {
  id: number;
  consumer_number: string;
  consumer_name: string;
  father_name?: string;
  mother_name?: string;
  spouse_name?: string;
  ration_card_num?: string;
  blue_book?: number;
  lpg_id?: number;
  is_kyc_done: boolean;
  category: number;
  category_name?: string;
  consumer_type: number;
  type_name?: string;
  bpl_type?: number;
  bpl_type_name?: string;
  dct_type?: number;
  dct_type_name?: string;
  opting_status: OptingStatus;
  opting_status_display?: string;
  scheme?: number;
  scheme_name?: string;
  addresses: Address[];
  contacts: Contact[];
}

export interface ConsumerCreateUpdate {
  consumer_number: string;
  consumer_name: string;
  father_name?: string;
  mother_name?: string;
  spouse_name?: string;
  ration_card_num?: string;
  blue_book?: number;
  lpg_id?: number;
  is_kyc_done: boolean;
  category: number;
  consumer_type: number;
  bpl_type?: number;
  dct_type?: number;
  opting_status: OptingStatus;
  scheme?: number;
}

export interface ConsumerRouteInfo {
  route_id: number;
  route_code: string;
  route_description: string;
}

export interface ConsumerStatistics {
  total_consumers: number;
  kyc_done: number;
  kyc_pending: number;
  by_opting_status: {
    'Opt In': number;
    'Opt Out': number;
    'Pending': number;
  };
}

// Lookup types
export interface ConsumerCategory {
  id: number;
  name: string;
  description?: string;
}

export interface ConsumerType {
  id: number;
  name: string;
  description?: string;
}

export interface BPLType {
  id: number;
  name: string;
  description?: string;
}

export interface DCTType {
  id: number;
  name: string;
  description?: string;
}

export interface Scheme {
  id: number;
  name: string;
  description?: string;
}

export interface ConsumerFilters {
  category?: number;
  consumer_type?: number;
  opting_status?: OptingStatus;
  is_kyc_done?: boolean;
  scheme?: number;
  search?: string;
  ordering?: string;
  page?: number;
}
