// Person and Family related TypeScript types

import type { Address, Contact } from './address';

export interface Family {
  id: number;
  family_id: string;
  family_head_name: string;
  total_members?: number;
  created_at?: string;
  updated_at?: string;
}

export interface IdentificationDetails {
  id: number;
  aadhaar_number?: string;
  ration_card_number?: string;
  voter_id?: string;
  pan_number?: string;
  driving_license?: string;
  other_id?: string;
  content_type?: number;
  object_id?: number;
}

export interface Person {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  dob: string | null;
  identification_id: number | null;
  identification_details: IdentificationDetails | null;
  family_details_id: number | null;
  family: Family | null;
  addresses: Address[];
  contacts: Contact[];
  created_at?: string;
  updated_at?: string;
}

export interface PersonFormData {
  first_name: string;
  last_name: string;
  full_name?: string;
  dob?: string | null;
  identification_details?: Partial<IdentificationDetails>;
  family_details_id?: number | null;
  addresses?: Partial<Address>[];
  contacts?: Partial<Contact>[];
}
