"use client";
import { useEffect, useState } from "react";
import { SplitLayout } from "@/components/SplitLayout";
import { ConfigPanel } from "@/components/ConfigPanel";
import { PreviewPanel } from "@/components/PreviewPanel";
import { ReportProvider } from "@/context/ReportContext";
import { v4 as uuid } from "uuid";
import { ConfigPanelProps, Template, Section } from "@/types/base";
import { getReportTemplate, listSections } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [template, setTemplate] = useState<Template | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        //简报生成
        // const templateId = "1f7dd63b-5b86-49f0-8b39-9ac5266a1464";

        // 外迁报告
        const templateId = "e03dc441-668c-43d5-88a7-0003d8dc0c2c";

        const fetchedTemplate = await getReportTemplate(templateId);
        setTemplate(fetchedTemplate);

        const fetchedSections = await listSections(templateId);
        setSections(fetchedSections);
      } catch (err) {
        setTemplate({
          id: String(uuid()),
          title: "",
          description: "",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <ReportProvider>
      <SplitLayout
        configPanel={
          template && (
            <ConfigPanel
              initialTemplate={template}
              initialSections={sections}
            />
          )
        }
        previewPanel={<PreviewPanel />}
      />
    </ReportProvider>
  );
}
