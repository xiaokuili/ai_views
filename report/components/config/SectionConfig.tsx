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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Settings2, Plus, AlignLeft,FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { CardLayout } from "./Layout";
import { upsertSection, deleteSection } from "@/lib/api";
import { ActionButtons } from "../ActionButton";
import { QueryConfig } from "./QueryConfig";
import { Section, Query, ProcessingStep } from "@/types/base";
import { v4 as uuid } from 'uuid';

const sectionSchema = z.object({
  section_template: z
    .string()
    .min(3, "Section template must be at least 3 characters."),
  section_template_description: z.string(),
  example: z.string(),
});



export function SectionConfig({ templateId, templateTitle, section }: {
  templateId: string;
  templateTitle: string;
  section: Section;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [sectionTemplate, setSectionTemplate] = useState(
    section?.section_template
  );

  const { setTestReportState } = useTestReportContext();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof sectionSchema>>({
    resolver: zodResolver(sectionSchema),
    defaultValues: {
      section_template: section?  .section_template,
      section_template_description: section?.section_template_description,
      example: section?.example,
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

  const handleAddProcessingStep = () => {
    const newStep: ProcessingStep = {
      id: uuid(),
      step_type: '',
      order: processingSteps.length,
      function_name: '',
      parameters: {},
      output_key: '',
      description: '',
    };
    setProcessingSteps([...processingSteps, newStep]);
  };

  const handleDeleteProcessingStep = (id: string) => {
    setProcessingSteps(processingSteps.filter(step => step.id !== id));
  };
  // init query
  const [query, setQuery] = useState<Query>({sql: "", description: "", data_source_id: "", id: String(uuid())});
  // init processingStep
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([]);

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
    try {
      const updatedSection: Section = {
        ...section,
        ...values,
      };
      await upsertSection(templateId, updatedSection);
      toast({
        title: "Success",
        description: `Section ${section.id} updated successfully`,
      });
    } catch (error) {
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
          name='section_template_description'
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className='relative'>
                <FileText className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
                <Textarea
                    placeholder='输入段落模版描述'
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
        <QueryConfig
          templateId={templateId}
          templateTitle={templateTitle}
          sectionId={section.id}
          query={query}
        />
      </Card>
    </div>

    <div className='mt-6'>
        <h3 className='text-lg font-semibold mb-2'>Processing Steps</h3>
        <Card className='p-4'>
          {processingSteps.map((step, index) => (
            <div key={step.id} className='mb-4 p-3 border rounded-md relative'>
              process step
            </div>
          ))}
          <Button onClick={handleAddProcessingStep} className='w-full mt-2'>
            <Plus className='mr-2 h-4 w-4' /> Add Processing Step
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
