import { json } from "stream/consumers";
import { boolean, string } from "zod";

export interface ConfigPanelProps {
  template: Template;
  initialSections: Section[];
}

export interface Template {
  id: string;
  title: string;
  description: string;
}

export interface Section {
  id: string;
  section_template: string;
  example: string;
  section_type: string;
}

export interface Query {
  id: string;
  sql: string;
  description: string;
  data_source_id: string;
  section_id: string;
}

export interface DataSource {
  id: string;
  name: string;
  description?: string;
  connection_string: string;
}

export interface ProcessStep {
  id: string;
  description: string;
  function_name: string;
  order: number;
  parameters: json;
  outputs: string[];
}
