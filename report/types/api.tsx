import { Section, Query, DataSource } from "./base";

export interface SectionResponse extends Section {
  template_id: string;
}

export interface QueryResponse extends Query {
  section_id: string;
}

export interface SQLPredictRequest {
  original_sql: string;
  description: string;
  old_title: string;
  new_title: string;
}

export interface SQLPredictResponse {
  predicted_sql: string;
}
