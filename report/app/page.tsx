"use client";
import { SplitLayout } from "@/components/SplitLayout";
import { ConfigPanel } from "@/components/ConfigPanel";
import { PreviewPanel } from "@/components/PreviewPanel";
import { ReportProvider } from "@/context/ReportContext";
import { v4 as uuid } from "uuid";
import { ConfigPanelProps, Template, Section } from "@/types/base";

export default function Home() {
  const templateId = String(uuid()); // 为模板生成一个 ID
  const sectionId = String(uuid()); // 为 section 生成一个 ID

  // 创建初始 sections 列表
  const initialSections: Section[] = [
    {
      id: String(uuid()),
      section_template: "test11",
      section_template_description: "test111",
      example: "test111",
    },
    // 可以根据需要添加更多初始 section
  ];
  const initialTemplate: Template = {
    id: templateId,
    title: "test123",
    description: "test123",
  };

  return (
    <ReportProvider>
      <SplitLayout
        configPanel={
          <ConfigPanel
            initialTemplate={initialTemplate}
            initialSections={initialSections}
          />
        }
        previewPanel={<PreviewPanel />}
      />
    </ReportProvider>
  );
}
