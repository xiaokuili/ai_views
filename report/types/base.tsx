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
  section_template_description: string;
  example: string;
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

export interfaace ProcessingStep {
  id: string;
  step_type: string;
  order: number;
  function_name: string;
  parameters: json
  output_key: string;
  description: string;
}