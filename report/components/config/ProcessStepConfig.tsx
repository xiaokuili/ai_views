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
import { Settings2, Code, Hash, AlignLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CardLayout } from "./Layout";
import { createOrUpdateProcessStep, deleteProcessStep } from "@/lib/api";
import { ActionButtons } from "../ActionButton";
import { ProcessStep } from "@/types/base";

const formSchema = z.object({
  function_name: z.string().min(1, {
    message: "Function name is required.",
  }),
  parameters: z.string().min(2, {
    message: "Parameters must be valid JSON.",
  }),
  outputs: z.string().min(1, {
    message: "Output key is required.",
  }),
  description: z.string().min(5, {
    message: "Description must be at least 5 characters.",
  }),
});

export function ProcessStepConfig({
  step,
  sectionId,
}: {
  step: ProcessStep;
  sectionId: string;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [cardTitle, setCardTitle] = useState(
    step?.description || "Processing Step"
  );
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      function_name: step?.function_name,
      parameters: JSON.stringify(step?.parameters, null, 2),
      outputs: step?.outputs.join(", "), // 将数组转换为逗号分隔的字符串
      description: step?.description,
    },
  });

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "description") {
        setCardTitle(value.description || "Processing Step");
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const updatedStep: ProcessStep = {
        ...step,
        ...values,
        parameters: JSON.parse(values.parameters),
        outputs: values.outputs.split(",").map((output) => output.trim()), // 将字符串转换为数组
      };
      await createOrUpdateProcessStep(sectionId, updatedStep);
      toast({
        title: "Success",
        description: `Processing step ${step.id} updated successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to save processing step ${step.id}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onDelete() {
    if (!step.id) {
      toast({
        title: "Error",
        description: "Cannot delete a processing step without an ID",
        variant: "destructive",
      });
      return;
    }

    setIsDeleting(true);
    try {
      await deleteProcessStep(sectionId, step.id);
      toast({
        title: "Success",
        description: `Processing step ${step.id} deleted successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to delete processing step ${step.id}`,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  }

  const Header = (title: string) => (
    <div className='flex items-center space-x-2'>
      <Settings2 className='h-4 w-4' />
      <span>{title}</span>
    </div>
  );

  const content = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        <FormField
          control={form.control}
          name='function_name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Function Name</FormLabel>
              <FormControl>
                <div className='relative'>
                  <Hash className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
                  <Input
                    placeholder='Enter function name'
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
          name='parameters'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parameters (JSON)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder='Enter parameters as JSON'
                  className='min-h-[100px] font-mono'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='outputs'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Outputs</FormLabel>
              <FormControl>
                <Input
                  placeholder='Enter output keys, separated by commas'
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
              <FormLabel>Description</FormLabel>
              <FormControl>
                <div className='relative'>
                  <AlignLeft className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
                  <Textarea
                    placeholder='Enter step description'
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
  );

  return <CardLayout header={Header(cardTitle)} content={content} />;
}
