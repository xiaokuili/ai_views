"use client";
import { useState, useEffect } from "react";
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
import { Settings2, Eye, Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CardLayout } from "./Layout";
import { createOrUpdateReportTemplate, deleteReportTemplate } from "@/lib/api";
import { useTestReportContext } from "@/context/ReportContext";
import { FileText, AlignLeft } from "lucide-react";
import { ActionButtons } from "../ActionButton";
import { Template } from "@/types/base";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
});

export function TemplateConfig({ template }: { template: Template }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [CardTitle, setCardTitle] = useState(template?.title);
  const { setTestReportState } = useTestReportContext();
  const { toast } = useToast();
  console.log("template", template);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: template?.title,
      description: template?.description,
    },
  });
  // 监听表单 title 字段的变化
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "title") {
        setCardTitle(value.title || "");
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const updatedTemplate: Template = {
        ...template,
        ...values,
      };
      await createOrUpdateReportTemplate(updatedTemplate);
      toast({
        title: "Success",
        description: `Template ${template.id} updated successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to save template ${template.id}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function onPreview() {
    setTestReportState({ id: template.id, type: "template" });

    console.log("Preview:");
  }

  async function onDelete() {
    if (!template.id) {
      toast({
        title: "Error",
        description: "Cannot delete a template without an ID",
        variant: "destructive",
      });
      return;
    }

    setIsDeleting(true);
    try {
      await deleteReportTemplate(template.id);
      toast({
        title: "Success",
        description: `Template ${template.id} deleted successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to delete template ${template.id}`,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  }

  const Header = (CardTitle: string) => (
    <div className='flex items-center space-x-2'>
      <Settings2 className='h-4 w-4' />
      <span>{CardTitle}</span>
    </div>
  );

  const content = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        <FormField
          control={form.control}
          name='title'
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className='relative'>
                  <FileText className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
                  <Input
                    placeholder='输入模版标题'
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
          name='description'
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className='relative'>
                  <AlignLeft className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
                  <Textarea
                    placeholder='输入模版描述'
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
            onSubmit={onSubmit}
            isDeleting={isDeleting}
            isSubmitting={isSubmitting}
          />
        </div>
      </form>
    </Form>
  );

  return (
    <CardLayout
      header={Header(CardTitle || "基础信息")}
      content={content}
      onTest={onPreview}
    />
  );
}
