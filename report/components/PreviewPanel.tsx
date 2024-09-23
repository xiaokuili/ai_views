"use client";
import React, { useState, useEffect } from "react";

import { useTestReportContext } from "@/context/ReportContext";
import { getQuery, predictSQL, searchSQL } from "@/lib/api";

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
  const [cleanOLDSQL, setCleanOLDSQL] = useState<string>("");

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
        const cleanSQL = sql.trim().replace(/\s+/g, " ");
        setCleanOLDSQL(fetchedQuery.sql.trim().replace(/\s+/g, " "));
        setPredictedSQL(cleanSQL);
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
    <div className='space-y-6'>
      <div className='space-y-2'>
        <h3 className='text-lg font-semibold'>SQL Comparison</h3>
        <div className='p-3 bg-gray-100 rounded-md overflow-x-auto'>
          <div className='space-y-4'>
            <div>
              <h4 className='text-sm font-medium mb-1'>Predicted SQL:</h4>
              <pre className='bg-white p-2 rounded'>
                <code>{predictedSQL}</code>
              </pre>
            </div>
            <div>
              <h4 className='text-sm font-medium mb-1'>Original SQL:</h4>
              <pre className='bg-white p-2 rounded'>
                <code>{cleanOLDSQL}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
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
