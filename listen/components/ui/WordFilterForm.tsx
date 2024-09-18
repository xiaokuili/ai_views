"use client";
import React, { useState, useMemo } from "react";
import { Word } from "@/types/word";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react"; // 导入加载图标
import { useToast } from "@/hooks/use-toast";
import { generateListeningPractice } from "@/lib/api";

interface FilterFormData {
  word: string;
  minCount: number;
  maxCount: number;
}

export function WordFilterTable({ words }: { words: Word[] }) {
  const [filters, setFilters] = useState<FilterFormData>({
    word: "",
    minCount: 0,
    maxCount: Infinity,
  });
  const [selectedWords, setSelectedWords] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const filteredWords = useMemo(() => {
    return words.filter((word) => {
      const matchesWord = word.word
        .toLowerCase()
        .includes(filters.word.toLowerCase());
      const matchesCount =
        word.count >= filters.minCount && word.count <= filters.maxCount;
      return matchesWord && matchesCount;
    });
  }, [words, filters]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: name === "word" ? value : Number(value) || 0,
    }));
  };

  const handleCheckboxChange = (word: string) => {
    setSelectedWords((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(word)) {
        newSet.delete(word);
      } else {
        newSet.add(word);
      }
      return newSet;
    });
  };

  const handleSubmit = async () => {
    if (selectedWords.size === 0) {
      toast({
        title: "No words selected",
        description: "Please select at least one word to submit.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedWordsArray = Array.from(selectedWords);
      console.log("Selected words:", selectedWordsArray);

      const { blob, filename } = await generateListeningPractice(
        selectedWordsArray
      );

      // 创建一个临时 URL 并触发下载
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Download started",
        description: `Your file "${filename}" is being downloaded.`,
      });
    } catch (error) {
      console.error("Error generating listening practice:", error);
      toast({
        title: "Generation failed",
        description:
          "There was an error generating the listening practice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className='space-y-4'>
      <div className='flex space-x-4 mb-4'>
        <Input
          name='word'
          placeholder='Filter by word'
          value={filters.word}
          onChange={handleFilterChange}
        />
        <Input
          name='minCount'
          type='number'
          placeholder='Min count'
          value={filters.minCount}
          onChange={handleFilterChange}
        />
        <Input
          name='maxCount'
          type='number'
          placeholder='Max count'
          value={filters.maxCount === Infinity ? "" : filters.maxCount}
          onChange={handleFilterChange}
        />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='w-[50px]'>Select</TableHead>
            <TableHead>Word</TableHead>
            <TableHead>Count</TableHead>
            <TableHead>Last Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredWords.map((word) => (
            <TableRow key={word.word}>
              <TableCell>
                <Checkbox
                  checked={selectedWords.has(word.word)}
                  onCheckedChange={() => handleCheckboxChange(word.word)}
                />
              </TableCell>
              <TableCell>{word.word}</TableCell>
              <TableCell>{word.count}</TableCell>
              <TableCell>{word.updatedAt.toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className='flex justify-between items-center'>
        <div>Total words: {filteredWords.length}</div>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Submitting...
            </>
          ) : (
            "Submit Selected Words"
          )}
        </Button>
      </div>
    </div>
  );
}
