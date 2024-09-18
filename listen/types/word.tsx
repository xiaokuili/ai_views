export interface Word {
  word: string;
  count: number;
  updatedAt: Date;
}

export interface Content{
  type: string;
  title: string;
  content: string;
  createdAt: Date;
  publishURL: string;
}
