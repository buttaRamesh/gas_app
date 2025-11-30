// Consumer-related TypeScript types

export type OptingStatus = 'OPT_IN' | 'OPT_OUT' | 'PENDING';

export interface Address {
  id: number;
  house_no?: string;
  house_name_flat_number?: string;
  housing_complex_building?: string;
  street_road_name?: string;
  land_mark?: string;
  city_town_village?: string;
  district?: string;
  pin_code?: string;
  address_text?: string;
}

export interface Contact {
  id: number;
  email?: string;
  mobile_number?: string;
  phone_number?: string;
}

export interface Identification {
  id: number;
  ration_card_num?: string;
  aadhar_num?: string;
  pan_num?: string;
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
  status?: string;
  status_display?: string;
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
  dob?: string;
  blue_book?: number;
  lpg_id?: number;
  is_kyc_done: boolean;
  category?: number;
  category_name?: string;
  consumer_type?: number;
  type_name?: string;
  bpl_type?: number;
  bpl_type_name?: string;
  dct_type?: number;
  dct_type_name?: string;
  opting_status: OptingStatus;
  opting_status_display?: string;
  status?: string;
  status_display?: string;
  scheme?: number;
  scheme_name?: string;
  addresses: Address[];
  contacts: Contact[];
  identification?: Identification | null;
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

// Connection types
export interface ConnectionDetails {
  id: number;
  sv_number: string;
  sv_date: string;
  hist_code_description?: string;
  consumer: number;
  consumer_name: string;
  consumer_number: string;
  connection_type: number;
  connection_type_name: string;
  product: number;
  product_code: string;
  product_category_name: string;
  product_variant_name: string;
  product_quantity?: number;
  product_unit?: string;
  num_of_regulators: number;
}
