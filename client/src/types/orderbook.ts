// OrderBook types

export interface RefillType {
  id: number;
  name: string;
}

export interface DeliveryFlag {
  id: number;
  name: string;
}

export interface PaymentOption {
  id: number;
  name: string;
}

export interface PaymentInfo {
  id: number;
  order: number;
  payment_option: number;
  payment_option_name: string;
  cash_memo_no: string;
  payment_date: string | null;
  amount: string | null;
  payment_status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  transaction_id: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface OrderBookListItem {
  id: number;
  consumer: number;
  consumer_number: string;
  consumer_name: string;
  mobile_number: string;
  order_no: string;
  book_date: string;
  product: string;
  refill_type: number;
  refill_type_name: string;
  delivery_flag: number;
  delivery_flag_name: string;
  delivery_date: string | null;
  last_delivery_date: string | null;
  delivery_person: number | null;
  delivery_person_name: string | null;
  source_file: string;
  payment_info: PaymentInfo | null;
  updated_by: number | null;
  updated_by_username: string | null;
  updated_type: 'BULK' | 'MANUAL';
  is_pending: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrderBookDetail extends OrderBookListItem {
  refill_type: RefillType;
  delivery_flag: DeliveryFlag;
  payment_option: PaymentOption;
}

export interface OrderBookWrite {
  consumer: number;
  order_no: string;
  book_date: string;
  product?: string;
  refill_type: number;
  delivery_flag: number;
  delivery_date?: string | null;
  last_delivery_date?: string | null;
  delivery_person?: number | null;
  source_file?: string;
  updated_by?: number | null;
  updated_type?: 'BULK' | 'MANUAL';
}

export interface MarkDeliveredRequest {
  delivery_date?: string;
}

export interface BulkUploadResponse {
  success: boolean;
  message: string;
  success_count: number;
  error_count: number;
  errors: Array<{
    row: number;
    data: Record<string, string>;
    errors: string[];
  }>;
}

// Field Definition types
export interface BackendFieldDefinition {
  field_name: string;        // e.g., "consumer"
  label: string;             // e.g., "Consumer"
  required: boolean;         // true/false
  field_type: string;        // e.g., "ForeignKey", "CharField", "DateField"
  max_length: number | null;
  help_text: string;
}

export interface FieldDefinitionsResponse {
  fields: BackendFieldDefinition[];
  default_mapping: Record<string, string>;
  success: boolean;
}

// Column Mapping types
export interface ColumnMappingPair {
  backendField: string;           // field_name from backend
  backendFieldLabel: string;      // display label
  csvColumn: string | null;       // selected CSV column
  isRequired: boolean;
  fieldType: string;
  helpText: string;
}

export interface ColumnMappingData {
  id?: number;
  name: string;
  upload_type: string;
  file_format?: string;
  description?: string;
  mappings: Record<string, string>;
  is_active: boolean;
  created_by?: number;
  created_at?: string;
  updated_at?: string;
}

// CSV Comparison types
export interface MismatchResult {
  has_changes: boolean;
  missing_columns: string[];
  new_columns: string[];
  message: string;
}

// Column extraction result
export interface ExtractedColumnsResult {
  columns: string[];
  success: boolean;
  error?: string;
}

// Bulk Upload History types
export interface BulkUploadHistory {
  id: number;
  file_name: string;
  file_type: 'CSV' | 'XLSX';
  file_size: number;
  file_size_mb: number;
  upload_type: 'PENDING' | 'DELIVERY';
  row_count: number;
  success_count: number;
  error_count: number;
  skipped_count?: number;
  status: 'SUCCESS' | 'PARTIAL' | 'FAILED';
  uploaded_by: number;
  uploaded_by_name: string;
  uploaded_at: string;
  error_summary?: string;
  upload_type_display: string;
  status_display: string;
}
