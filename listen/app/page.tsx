"use client";

import { WordFilterTable } from "@/components/ui/WordFilterForm";
import { useState, useEffect } from "react";
import { Word } from "@/types/word";
import { getUserWords } from "@/lib/api";

const api_key =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Im1heWJlX3h1ZSIsImV4cCI6MTcyODU2MDE0OSwidG9rZW5fbGltaXQiOjEwMDB9.iGdcpQvXS9RPh0wXKvMG5TWpR5QwZbFrL7fEGwDVX8o";

export default function Home() {
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserWords({ API_KEY: api_key }).then((ws) => {
      setWords(ws);
      setLoading(false);
    });
  }, []);

  return (
    <main className='container mx-auto p-4'>
      <h1 className='text-2xl font-bold mb-4'>Word Filter</h1>
      {loading ? <p>Loading...</p> : <WordFilterTable words={words} />}
    </main>
  );
}
