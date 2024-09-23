import {
  Template,
  Section,
  Query,
  DataSource,
  ProcessingStep,
} from "../types/base";
import {
  SectionResponse,
  QueryResponse,
  SQLPredictRequest,
  SQLPredictResponse,
} from "../types/api";
const API_BASE_URL = "http://localhost:8000/report"; // 根据你的API路由进行调整

// 定义可能的错误类型
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

export async function createOrUpdateReportTemplate(
  template: Template
): Promise<Template> {
  const response = await fetch(`${API_BASE_URL}/templates`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(template),
  });

  if (!response.ok) {
    throw new Error("Failed to create or update template");
  }

  return response.json();
}

export async function getReportTemplate(templateId: string): Promise<Template> {
  const response = await fetch(`${API_BASE_URL}/templates/${templateId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch template");
  }

  return response.json();
}

export async function listReportTemplates(
  skip: number = 0,
  limit: number = 100
): Promise<Template[]> {
  const response = await fetch(
    `${API_BASE_URL}/templates?skip=${skip}&limit=${limit}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch templates");
  }

  return response.json();
}

export async function deleteReportTemplate(templateId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/templates/${templateId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete template");
  }
}

// Upsert (Create or Update) Section
export async function upsertSection(
  templateId: string,
  section: Section
): Promise<SectionResponse> {
  const response = await fetch(
    `${API_BASE_URL}/templates/${templateId}/sections`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(section),
    }
  );

  if (!response.ok) {
    let errorMessage: string;
    let errorStatus: number = response.status;

    switch (response.status) {
      case 404:
        errorMessage = `Template with id ${templateId} not found`;
        break;
      default:
        errorMessage = "Failed to create or update section";
    }

    const errorData = await response.json().catch(() => ({}));
    if (errorData && errorData.detail) {
      errorMessage = errorData.detail;
    }

    throw new ApiError(errorMessage, errorStatus);
  }

  return response.json();
}

// Get all Sections for a template
export async function listSections(
  templateId: string,
  skip: number = 0,
  limit: number = 100
): Promise<SectionResponse[]> {
  const response = await fetch(
    `${API_BASE_URL}/templates/${templateId}/sections?skip=${skip}&limit=${limit}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch sections");
  }

  return response.json();
}

// Get one Section
export async function getSection(
  templateId: string,
  sectionId: string
): Promise<SectionResponse> {
  const response = await fetch(
    `${API_BASE_URL}/templates/${templateId}/sections/${sectionId}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch section");
  }

  return response.json();
}

// Delete Section
export async function deleteSection(
  templateId: string,
  sectionId: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/templates/${templateId}/sections/${sectionId}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete section");
  }
}

export async function fetchDataSources(
  skip: number = 0,
  limit: number = 100
): Promise<DataSource[]> {
  const response = await fetch(
    `${API_BASE_URL}/datasources?skip=${skip}&limit=${limit}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Failed to fetch data sources: ${errorData.detail || response.statusText}`
    );
  }

  return response.json();
}

// 删除查询
export async function deleteQuery(queryId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/queries/${queryId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    let errorMessage: string;
    let errorStatus: number = response.status;

    switch (response.status) {
      case 404:
        errorMessage = `Query with id ${queryId} not found`;
        break;
      case 400:
        const errorData = await response.json().catch(() => ({}));
        errorMessage = errorData.detail || "Unable to delete query";
        break;
      default:
        errorMessage = "Failed to delete query";
    }

    throw new ApiError(errorMessage, errorStatus);
  }

  // 如果删除成功，API 返回 204 No Content，不需要进行任何处理
}

// 创建或更新查询
export async function createOrUpdateQuery(
  sectionId: string,
  query: Omit<QueryResponse, "id" | "section_id">
): Promise<QueryResponse> {
  const response = await fetch(`${API_BASE_URL}/sections/${sectionId}/query`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(query),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      errorData.detail || "Failed to create or update query",
      response.status
    );
  }

  return response.json();
}

export async function getQueryBySection(sectionId: string): Promise<Query> {
  const response = await fetch(`${API_BASE_URL}/sections/${sectionId}/query`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new ApiError("Query not found", 404);
    }
    throw new ApiError(
      `Failed to fetch query: ${response.statusText}`,
      response.status
    );
  }

  const data = await response.json();
  return data as Query;
}

export async function getQuery(queryId: string): Promise<Query> {
  const response = await fetch(`${API_BASE_URL}/queries/${queryId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    let errorMessage: string;
    let errorStatus: number = response.status;

    switch (response.status) {
      case 404:
        errorMessage = `Query with id ${queryId} not found`;
        break;
      default:
        errorMessage = "Failed to fetch query";
    }

    throw new ApiError(errorMessage, errorStatus);
  }

  const data = await response.json();
  return data as Query;
}
// AI

// 预测 SQL 的函数
export async function predictSQL(request: SQLPredictRequest): Promise<string> {
  try {
    const response = await fetch(`${API_BASE_URL}/predict_sql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `AI error: ${
          errorData.detail || response.statusText || "Unknown error"
        }`
      );
    }

    const data: SQLPredictResponse = await response.json();
    return data.predicted_sql;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error("Failed to predict SQL");
    }
  }
}

export interface SQLSearchRequest {
  sql: string;
  data_source_id: string;
}

export interface SQLSearchResponse {
  result: Array<Record<string, any>>;
}
export async function searchSQL(
  request: SQLSearchRequest
): Promise<SQLSearchResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/search_sql_by_datasource`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        `AI error: ${
          errorData.detail || response.statusText || "Unknown error"
        }`,
        response.status
      );
    }

    const data: SQLSearchResponse = await response.json();
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    } else if (error instanceof Error) {
      throw new ApiError(`Failed to search SQL: ${error.message}`, 500);
    } else {
      throw new ApiError("An unknown error occurred while searching SQL", 500);
    }
  }
}
interface GenerateStepsRequest {
  section: Section;
  data_source_example?: Record<string, any>;
}

export async function predictSectionProcessingSteps(
  sectionId: string,
  request: GenerateStepsRequest
): Promise<ProcessingStep[]> {
  const response = await fetch(
    `${API_BASE_URL}/sections/${sectionId}/generate_steps`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    }
  );

  if (!response.ok) {
    if (response.status === 500) {
      const errorData = await response.json();
      throw new ApiError(
        errorData.detail || "Failed to generate processing steps",
        500
      );
    }
    throw new ApiError("Failed to generate processing steps", response.status);
  }

  return response.json();
}

// process step endpoint
export async function createOrUpdateProcessStep(
  sectionId: string,
  processingStep: ProcessingStep
): Promise<MetricProcessingResponse> {
  const response = await fetch(
    `${API_BASE_URL}/processing_steps?section_id=${sectionId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...processingStep, section_id: sectionId }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      `Failed to create or update processing step: ${
        errorData.detail || response.statusText || "Unknown error"
      }`,
      response.status
    );
  }

  return response.json();
}

// 删除处理步骤
export async function deleteProcessStep(
  processingStepId: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/processing_steps/${processingStepId}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      `Failed to delete processing step: ${
        errorData.detail || response.statusText || "Unknown error"
      }`,
      response.status
    );
  }
}

// 获取处理步骤
export async function getProcessingStepById(
  processingStepId: string
): Promise<MetricProcessingResponse> {
  const response = await fetch(
    `${API_BASE_URL}/processing_steps/${processingStepId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      `Failed to fetch processing step: ${
        errorData.detail || response.statusText || "Unknown error"
      }`,
      response.status
    );
  }

  return response.json();
}

// 获取某个 section 的所有处理步骤
export async function getProcessingStepsBySection(
  sectionId: string
): Promise<MetricProcessingResponse[]> {
  const response = await fetch(
    `${API_BASE_URL}/sections/${sectionId}/processing_steps`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      `Failed to fetch processing steps: ${
        errorData.detail || response.statusText || "Unknown error"
      }`,
      response.status
    );
  }

  return response.json();
}
