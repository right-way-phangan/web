/**
 * amoCRM types — catalog 9077 (RW objects) + leads.
 * Field codes mirror the actual catalog schema captured 2026-06-01.
 */

export type FieldType =
  | "text"
  | "textarea"
  | "numeric"
  | "select"
  | "multiselect"
  | "checkbox"
  | "date"
  | "url"
  | "price";

export interface AmoEnumValue {
  id: number;
  value: string;
  sort?: number;
}

export interface AmoCustomFieldValue {
  field_id: number;
  field_code?: string;
  field_name?: string;
  field_type?: FieldType;
  values: Array<{
    value: string | number | boolean;
    enum_id?: number;
    enum_code?: string;
  }>;
}

export interface AmoCatalogElement {
  id: number;
  name: string;
  created_at?: number;
  updated_at?: number;
  custom_fields_values: AmoCustomFieldValue[] | null;
  _embedded?: {
    tags?: Array<{ id: number; name: string }>;
  };
}

export interface AmoCatalogListResponse {
  _page: number;
  _embedded: { elements: AmoCatalogElement[] };
  _links?: { next?: { href: string } };
}

// Custom-field schema (GET /catalogs/{id}/custom_fields)
export interface AmoCatalogCustomField {
  id: number;
  code?: string;
  name: string;
  type: FieldType;
  enums?: Array<{ id: number; value: string; sort?: number }>;
}

export interface AmoCustomFieldsResponse {
  _page?: number;
  _embedded: { custom_fields: AmoCatalogCustomField[] };
}

// One custom-field value as sent on element create/patch. Either a raw
// `value` (text/numeric/checkbox) or an `enum_id` (select/multiselect).
export interface AmoCustomFieldWriteValue {
  field_id: number;
  values: Array<{ value: string | number | boolean } | { enum_id: number }>;
}

// Catalog element create payload (POST /catalogs/{id}/elements, array body)
export interface AmoCatalogElementCreateInput {
  name: string;
  custom_fields_values?: AmoCustomFieldWriteValue[];
}

// Lead create payload (simplified)
export interface AmoLeadCreateInput {
  name: string;
  price?: number;
  pipeline_id?: number;
  status_id?: number;
  _embedded?: {
    contacts?: Array<{
      first_name?: string;
      custom_fields_values?: Array<{
        field_code: "PHONE" | "EMAIL";
        values: Array<{ value: string; enum_code?: string }>;
      }>;
    }>;
    tags?: Array<{ name: string }>;
  };
  custom_fields_values?: Array<{
    field_id?: number;
    field_code?: string;
    values: Array<{ value: string | number | boolean }>;
  }>;
}
