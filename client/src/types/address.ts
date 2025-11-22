// Address and Contact related TypeScript types

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
  content_type: number;
  object_id: number;
  content_type_name?: string;
}

export interface AddressListItem {
  id: number;
  house_no?: string;
  street_road_name?: string;
  city_town_village?: string;
  district?: string;
  pin_code?: string;
  address_text?: string;
  content_type_name?: string;
}

export interface AddressFormData {
  house_no?: string;
  house_name_flat_number?: string;
  housing_complex_building?: string;
  street_road_name?: string;
  land_mark?: string;
  city_town_village?: string;
  district?: string;
  pin_code?: string;
  address_text?: string;
  content_type: number;
  object_id: number;
}

export interface Contact {
  id: number;
  email?: string;
  phone_number?: string;
  mobile_number?: string;
  content_type: number;
  object_id: number;
  content_type_name?: string;
}

export interface ContactListItem {
  id: number;
  email?: string;
  mobile_number?: string;
  phone_number?: string;
  content_type_name?: string;
}

export interface ContactFormData {
  email?: string;
  phone_number?: string;
  mobile_number?: string;
  content_type: number;
  object_id: number;
}

export interface AddressStatistics {
  total_addresses: number;
  by_city: Array<{ city_town_village: string; count: number }>;
  by_district: Array<{ district: string; count: number }>;
  by_pincode: Array<{ pin_code: string; count: number }>;
}

export interface ContactStatistics {
  total_contacts: number;
  with_email: number;
  with_mobile: number;
  with_phone: number;
  by_content_type: Array<{ content_type__model: string; count: number }>;
}

export interface PaginatedAddressResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AddressListItem[];
}

export interface PaginatedContactResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ContactListItem[];
}
