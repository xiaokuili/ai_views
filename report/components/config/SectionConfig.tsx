import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTestReportContext } from "@/context/ReportContext";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api";
import {
  Settings2,
  Plus,
  AlignLeft,
  FileText,
  BarChart,
  Table,
  Loader2,
  LineChart,
  PieChart,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { CardLayout } from "./Layout";
import { upsertSection, deleteSection, getQueryBySection } from "@/lib/api";
import { ActionButtons } from "../ActionButton";
import { QueryConfig } from "./QueryConfig";
import { Section, Query, ProcessingStep } from "@/types/base";
import { v4 as uuid } from "uuid";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SQLSearchRequest,
  SQLSearchResponse,
  searchSQL,
  predictSectionProcessingSteps,
  getProcessingStepsBySection,
} from "@/lib/api";
import { ProcessStepConfig } from "./ProcessStepConfig";
import { describe } from "node:test";

// 定义 SectionType 枚举
enum SectionType {
  LLM = "llm",
  TEXT = "text",
  TABLE = "table",
  BAR = "bar",
  LINE = "line",
  PIE = "pie",
}

const sectionSchema = z.object({
  section_template: z
    .string()
    .min(3, "Section template must be at least 3 characters."),
  example: z.string(),
  section_type: z.nativeEnum(SectionType),
});

export function SectionConfig({
  templateId,
  templateTitle,
  section: initialSection,
}: {
  templateId: string;
  templateTitle: string;
  section: Section;
}) {
  const [section, setSection] = useState<Section>({
    ...initialSection,
    id: initialSection.id || String(uuid()), // 初始化时生成 ID
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [sectionTemplate, setSectionTemplate] = useState(
    section?.section_template
  );
  const [isLoadingQuery, setIsLoadingQuery] = useState(false);
  const [query, setQuery] = useState<Query | null>(null);
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([]);
  const [isLoadingSteps, setIsLoadingSteps] = useState(false);
  const [isLoadingInitialSteps, setIsLoadingInitialSteps] = useState(false);

  const { setTestReportState } = useTestReportContext();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof sectionSchema>>({
    resolver: zodResolver(sectionSchema),
    defaultValues: {
      section_template: section?.section_template,
      example: section?.example,
      section_type: section?.section_type || SectionType.LLM,
    },
  });

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "section_template") {
        setSectionTemplate(value.section_template || "");
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingQuery(true);
      setIsLoadingInitialSteps(true);
      try {
        // 获取 query
        const fetchedQuery = await getQueryBySection(section.id);
        setQuery(fetchedQuery);

        // 获取 processing steps
        const fetchedSteps = await getProcessingStepsBySection(section.id);
        setProcessingSteps(fetchedSteps);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        if (error instanceof ApiError && error.status === 404) {
          // 如果是 404 错误，静默地创建空数据
          createQuery();
          setProcessingSteps([]);
        } else {
          // 对于其他错误，显示错误消息
          toast({
            title: "Error",
            description: "Failed to load data. Using default values.",
            variant: "destructive",
          });
          createQuery();
          setProcessingSteps([]);
        }
      } finally {
        setIsLoadingQuery(false);
        setIsLoadingInitialSteps(false);
      }
    };

    const createQuery = () => {
      setQuery({
        id: String(uuid()),
        sql: "",
        description: "",
        data_source_id: "",
        // 添加其他必要的 Query 字段，设置为默认值
      });
    };

    fetchData();
  }, [section.id, toast]);

  const handleAddProcessingStep = async () => {
    if (!templateId || !query || !query.sql || !query.data_source_id) {
      toast({
        title: "Error",
        description:
          "Please ensure all section and query information is complete.",
        variant: "destructive",
      });
      return;
    }
    setIsLoadingSteps(true);
    if (processingSteps.length > 0) {
      setProcessingSteps([
        ...processingSteps,
        {
          id: String(uuid()),
          describe: "",
          function_name: "",
          order: processingSteps.length + 1,
          parameters: processingSteps[0].parameters,
          outputs: processingSteps[0].outputs,
        },
      ]);

      setIsLoadingSteps(false);
      return;
    }

    try {
      // 1. 请求数据
      const dataSourceExample = await fetchDataSourceExample(
        query.sql,
        query.data_source_id
      );

      // 2. 调用 generate_steps 接口
      const generatedSteps = await predictSectionProcessingSteps(section.id, {
        section: section,
        data_source_example: dataSourceExample,
      });
      generatedSteps.forEach((step) => {
        step.section_id = section.id;
      });
      console.log("generatedSteps", generatedSteps);
      // 4. 更新处理步骤
      setProcessingSteps(generatedSteps);

      toast({
        title: "Success",
        description: "Processing steps generated successfully.",
      });
    } catch (error) {
      console.error("Failed to generate processing steps:", error);
      toast({
        title: "Error",
        description:
          error instanceof ApiError
            ? error.message
            : "Failed to generate processing steps.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingSteps(false);
    }
  };

  const fetchDataSourceExample = async (
    sql: string,
    dataSourceId: string
  ): Promise<Record<string, any>> => {
    const request: SQLSearchRequest = {
      sql: sql,
      data_source_id: dataSourceId,
    };

    try {
      const response: SQLSearchResponse = await searchSQL(request);
      // 假设 response.result 是一个数组，我们取第一个元素作为示例
      return response.result || [];
    } catch (error) {
      console.error("Failed to fetch data source example:", error);
      throw error;
    }
  };

  const handleQueryUpdate = (updatedQuery: Query) => {
    setQuery(updatedQuery);
  };
  const handleDeleteProcessingStep = (id: string) => {
    setProcessingSteps(processingSteps.filter((step) => step.id !== id));
  };

  async function onSubmit(values: z.infer<typeof sectionSchema>) {
    if (!templateId) {
      toast({
        title: "Error",
        description: `Template ID is required`,
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    const previousSection = { ...section };
    const updatedSection: Section = {
      ...section,
      ...values,
      id: section.id, // 使用已生成的 ID
    };
    setSection(updatedSection);
    try {
      await upsertSection(templateId, updatedSection);
      toast({
        title: "Success",
        description: `Section ${section.id} updated successfully`,
      });
    } catch (error) {
      setSection(previousSection);
      toast({
        title: "Error",
        description: `Failed to save section ${section.id}: ${
          error instanceof Error ? error.message : String(error)
        }`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onDelete() {
    if (!section.id || !templateId) return;
    setIsDeleting(true);
    try {
      await deleteSection(templateId, section.id);
      toast({
        title: "Success",
        description: `Section ${section.id} deleted successfully`,
      });
      // 可能需要在这里添加一些导航逻辑，比如返回到模板页面
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to delete section ${section.id}`,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  }

  function onPreview() {
    setTestReportState({ id: section.id, type: "section" });
    console.log("Preview:", form.getValues());
  }

  const Header = (sectionTemplate: string) => (
    <div className='flex items-center space-x-2'>
      <Settings2 className='h-4 w-4' />
      <span>{sectionTemplate || "段落配置"}</span>
    </div>
  );

  const content = (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
          <FormField
            control={form.control}
            name='section_template'
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className='relative'>
                    <AlignLeft className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
                    <Input
                      placeholder='输入段落模版'
                      className='pl-8'
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='example'
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className='relative'>
                    <Settings2 className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
                    <Textarea
                      placeholder='输入样例'
                      className='pl-8 min-h-[100px]'
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='section_type'
            render={({ field }) => (
              <FormItem>
                <FormLabel>段落类型</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select a section type' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={SectionType.LLM}>
                      <div className='flex items-center'>
                        <Settings2 className='mr-2 h-4 w-4' />
                        LLM
                      </div>
                    </SelectItem>
                    <SelectItem value={SectionType.TEXT}>
                      <div className='flex items-center'>
                        <AlignLeft className='mr-2 h-4 w-4' />
                        Text
                      </div>
                    </SelectItem>
                    <SelectItem value={SectionType.TABLE}>
                      <div className='flex items-center'>
                        <Table className='mr-2 h-4 w-4' />
                        Table
                      </div>
                    </SelectItem>
                    <SelectItem value={SectionType.BAR}>
                      <div className='flex items-center'>
                        <BarChart className='mr-2 h-4 w-4' />
                        Bar
                      </div>
                    </SelectItem>
                    <SelectItem value={SectionType.LINE}>
                      <div className='flex items-center'>
                        <LineChart className='mr-2 h-4 w-4' />
                        Line
                      </div>
                    </SelectItem>
                    <SelectItem value={SectionType.PIE}>
                      <div className='flex items-center'>
                        <PieChart className='mr-2 h-4 w-4' />
                        Pie
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className='flex justify-between mt-6'>
            <ActionButtons
              onDelete={onDelete}
              onSubmit={form.handleSubmit(onSubmit)}
              isDeleting={isDeleting}
              isSubmitting={isSubmitting}
            />
          </div>
        </form>
      </Form>

      <div className='mt-6'>
        <h3 className='text-lg font-semibold mb-2'>数据配置</h3>
        <Card className='p-4'>
          {isLoadingQuery ? (
            <div>Loading...</div>
          ) : query ? (
            <QueryConfig
              templateId={templateId}
              templateTitle={templateTitle}
              sectionId={section.id} // 使用已生成的 ID
              query={query}
              onQueryUpdate={handleQueryUpdate}
            />
          ) : (
            <div>Error loading query data.</div>
          )}
        </Card>
      </div>

      <div className='mt-6'>
        <h3 className='text-lg font-semibold mb-2'>Processing Steps</h3>
        <Card className='p-4'>
          {isLoadingInitialSteps ? (
            <div className='flex justify-center items-center h-20'>
              <Loader2 className='w-6 h-6 animate-spin' />
            </div>
          ) : processingSteps.length > 0 ? (
            processingSteps.map((step) => (
              <div
                key={step.id}
                className='mb-4 p-3 border rounded-md relative'
              >
                <ProcessStepConfig
                  step={step}
                  sectionId={section.id}
                  templateId={templateId}
                  templateTitle={templateTitle}
                />
              </div>
            ))
          ) : (
            <p className='text-gray-500'>No processing steps found.</p>
          )}
          <Button
            onClick={handleAddProcessingStep}
            className='w-full mt-2'
            disabled={isLoadingSteps} // 禁用按钮在加载时
          >
            {isLoadingSteps ? (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' /> // 显示加载图标
            ) : (
              <Plus className='mr-2 h-4 w-4' />
            )}
            {isLoadingSteps ? "Generating..." : "Add Processing Step"}
          </Button>
        </Card>
      </div>
    </>
  );

  return (
    <CardLayout
      header={Header(sectionTemplate)}
      content={content}
      onTest={onPreview}
    />
  );
}
