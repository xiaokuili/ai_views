"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { TemplateConfig } from "./config/TemplateConfig";
import { SectionConfig } from "./config/SectionConfig";
import { v4 as uuid } from "uuid";
import { Template, Section } from "@/types/base";

export function ConfigPanel({
  initialTemplate,
  initialSections,
}: {
  initialTemplate: Template;
  initialSections: Section[];
}) {
  const [sections, setSections] = useState<Section[]>(initialSections);

  const addSection = () => {
    const newSection: Section = {
      id: "",
      section_template: "",
      section_template_description: "",
      example: "",
    };
    setSections([...sections, newSection]);
  };

  return (
    <div className='space-y-4'>
      <TemplateConfig template={initialTemplate} />

      {sections.map((section) => (
        <SectionConfig
          key={section.id}
          templateId={initialTemplate.id}
          templateTitle={initialTemplate.title}
          section={section}
        />
      ))}
      <Button onClick={addSection} className='w-full'>
        <PlusCircle className='mr-2 h-4 w-4' /> 添加段落
      </Button>
    </div>
  );
}
