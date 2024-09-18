import { Word } from "@/types/word";
const API_BASE_URL = "http://67.207.82.160:8000";

export async function getUserWords({
  API_KEY,
}: {
  API_KEY: string;
}): Promise<Word[]> {
  const response = await fetch(`${API_BASE_URL}/user/words`, {
    headers: {
      accept: "application/json",
      "X-API-Key": API_KEY,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data.words.map((word: any) => ({
    id: word.id,
    word: word.word,
    count: word.count,
    updatedAt: new Date(word.last_seen),
  }));
}

export async function generateListeningPractice(
  words: string[]
): Promise<{ blob: Blob; filename: string }> {
  const response = await fetch(`${API_BASE_URL}/generate_listening_practice`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify(words),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const contentDisposition = response.headers.get("Content-Disposition");
  const filenameMatch =
    contentDisposition && contentDisposition.match(/filename="?(.+)"?/i);
  const filename = filenameMatch ? filenameMatch[1] : "listening_practice.mp3";

  const blob = await response.blob();

  return { blob, filename };
}
