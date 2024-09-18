import React, { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Database,
  FileText,
  AlignLeft,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CardLayout } from "./Layout";
import { createOrUpdateQuery, deleteQuery, fetchDataSources } from "@/lib/api";
import { ActionButtons } from "../ActionButton";
import { useTestReportContext } from "@/context/ReportContext";
import { Query } from "@/types/base";
const formSchema = z.object({
  sql: z.string().min(1, { message: "SQL query is required." }),
  description: z.string().optional(),
  data_source_id: z.string().min(1, { message: "Data source is required." }),
});

export function QueryConfig({
  templateId,
  templateTitle,
  sectionId,
  query,
}: {
  templateId: string;
  templateTitle: string;
  sectionId: string;
  query: Query;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [dataSources, setDataSources] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const { setTestReportState } = useTestReportContext();
  const { toast } = useToast();

  const fetchDataSourcesMemoized = useMemo(() => fetchDataSources, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sql: query.sql,
      description: query.description,
      data_source_id: query.data_source_id,
    },
  });

  useEffect(() => {
    fetchDataSourcesMemoized()
      .then((response: DataSourceResponse[]) => {
        setDataSources(response);
      })
      .catch((error) => {
        console.error("Error fetching data sources:", error);
        toast({
          title: "Error",
          description: "Failed to fetch data sources. Please try again later.",
          variant: "destructive",
        });
      });
  }, [toast]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const updateQuery = {
        ...query,
        ...values,
        section_id: sectionId,
      };
      await createOrUpdateQuery(sectionId, updateQuery);
      toast({
        title: "Success",
        description: `Query ${query.id} updated successfully`,
      });
    } catch (error) {
      console.error("Error saving query:", error);
      toast({
        title: "Error",
        description: `Failed to save query ${query.id}: ${
          error instanceof Error ? error.message : String(error)
        }`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  async function onPreview() {
    setTestReportState({
      id: query.id,
      type: "query",
      templateId,
      templateTitle,
    });
  }
  async function onDelete() {
    if (!id) {
      toast({
        title: "Error",
        description: "Cannot delete a query without an ID",
        variant: "destructive",
      });
      return;
    }

    setIsDeleting(true);
    try {
      await deleteQuery(query.id);
      toast({
        title: "Success",
        description: `Query ${query.id} deleted successfully`,
      });
      // 可能需要在这里添加一些导航逻辑，比如返回到section页面
    } catch (error) {
      console.error("Error deleting query:", error);
      toast({
        title: "Error",
        description: `Failed to delete query ${query.id}: ${
          error instanceof Error ? error.message : String(error)
        }`,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  }

  const Header = () => (
    <div className='flex items-center justify-between w-full'>
      <div className='flex items-center space-x-2'>
        <Database className='h-4 w-4' />
        <span>查询配置</span>
      </div>
    </div>
  );

  const content = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        <FormField
          control={form.control}
          name='sql'
          render={({ field }) => (
            <FormItem>
              <FormLabel>SQL 查询</FormLabel>
              <FormControl>
                <Textarea
                  placeholder='输入 SQL 查询'
                  className='min-h-[100px]'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='description'
          render={({ field }) => (
            <FormItem>
              <FormLabel>描述</FormLabel>
              <FormControl>
                <Input placeholder='输入查询描述' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='data_source_id'
          render={({ field }) => (
            <FormItem>
              <FormLabel>数据源</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='选择数据源' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {dataSources.map((ds) => (
                    <SelectItem key={ds.id} value={ds.id}>
                      {ds.name}
                    </SelectItem>
                  ))}
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
  );

  return (
    <CardLayout
      header={<Header />}
      content={content}
      defaultIsExpanded={false}
      onTest={onPreview}
    />
  );
}
