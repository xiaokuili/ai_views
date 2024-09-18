"use client";
import React, { useState, useEffect } from "react";

import { useTestReportContext } from "@/context/ReportContext";
import { getQuery, predictSQL } from "@/lib/api";

const TemplatePreview = () => {
  return <div>Template Preview</div>;
};

const SectionPreview = ({
  id,
  testTitle,
}: {
  id: string;
  testTitle: string;
}) => {
  return <div>que</div>;
};

const QueryPreview = ({
  id,
  testTitle,
  templateId,
  templateTitle,
}: {
  id: string;
  testTitle: string;
  templateId: string;
  templateTitle: string;
}) => {
  const [query, setQuery] = useState<any>(null);
  const [predictedSQL, setPredictedSQL] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const fetchedQuery = await getQuery(id);
        setQuery(fetchedQuery);

        const sql = await predictSQL({
          original_sql: fetchedQuery.sql,
          description: fetchedQuery.description,
          old_title: templateTitle,
          new_title: testTitle,
        });
        setPredictedSQL(sql);
      } catch (err) {
        setError("Failed to fetch data");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, testTitle, templateTitle]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!query) return <div>No query data available</div>;

  return (
    <div>
      <p>SQL: {predictedSQL}</p>
      <p>OLD SQL: {query.sql}</p>
    </div>
  );
};

const ReportPreview = () => {
  return <div>Report Preview</div>;
};

export function PreviewPanel() {
  const { testTitle, id, type, templateId, templateTitle } =
    useTestReportContext();

  let content;

  switch (type) {
    case "template":
      content = <TemplatePreview />;
      break;
    case "section":
      content = <SectionPreview />;
      break;
    case "query":
      content = (
        <QueryPreview
          id={id}
          testTitle={testTitle}
          templateId={templateId}
          templateTitle={templateTitle}
        />
      );
      break;
    case "report":
      content = <ReportPreview />;
      break;
    default:
      content = <div>Select an item to preview</div>;
  }

  return (
    <div className='preview-panel'>
      <h2>{testTitle || "Preview"}</h2>
      <p>Template ID: {templateId}</p>
      <p>Template Title: {templateTitle}</p>
      {content}
      {id && <p>ID: {id}</p>}
    </div>
  );
}
