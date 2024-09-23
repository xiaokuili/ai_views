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
        const templateId = "2864467e-292d-4762-b4cb-dbec9d4e857c";
        const fetchedTemplate = await getReportTemplate(templateId);
        setTemplate(fetchedTemplate);

        const fetchedSections = await listSections(templateId);
        setSections(fetchedSections);
      } catch (err) {
        setError("Failed to fetch data. Please try again later.");
        toast({
          title: "Error",
          description: "Failed to fetch data. Please try again later.",
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
