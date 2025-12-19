export interface Address {
  id?: number;
  house_no: string;
  house_name_flat_number: string;
  housing_complex_building: string;
  street_road_name: string;
  land_mark: string;
  city_town_village: string;
  district: string;
  pin_code: string;
  address_text: string;
}

export interface Contact {
  id?: number;
  email: string;
  mobile_number: string;
  phone_number: string;
}

export interface Identification {
  id?: number;
  ration_card_num: string;
  aadhar_num: string;
  pan_num: string;
}

export interface Connection {
  id: number;
  sv_number: string;
  sv_date: string;
  connection_type: number;
  connection_type_name?: string;
  product: number;
  product_code?: string | null;
  product_name?: string;
  product_size: string;
  num_of_regulators: number;
  hist_code_description: string;
}

export interface Person {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  dob: string | null;
  identification: Identification | null;
  addresses: Address[];
  contacts: Contact[];
}

export interface ConsumerDetail {
  id: number;
  consumer_number: string;
  blue_book: number;
  lpg_id: number | null;
  is_kyc_done: boolean;
  opting_status: string;
  status: string;
  category: string;
  consumer_type: string;
  dct_type: string;
  person: Person;
  connections: Connection[];
  route_info: RouteInfo | null;
}

export interface RouteInfo {
  route_id: number;
  area_code: string;
  area_code_description: string;
  delivery_person_name: string | null;
  delivery_person_mobile: string | null;
}

export type TabValue = 0 | 1 | 2 | 3 | 4 | 5 | 6;
