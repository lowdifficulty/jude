export type KnowledgeChunk = {
  id: string;
  title: string;
  slug: string;
  text: string;
  meta?: {
    meta_description?: string;
    primary_keyword?: string;
  } | null;
  embedding?: number[];
};

export type KnowledgeIndex = {
  version: number;
  builtAt: string;
  embedded: boolean;
  chunkCount: number;
  chunks: KnowledgeChunk[];
};

export type KnowledgeSearchResult = {
  id: string;
  title: string;
  slug: string;
  text: string;
  score: number;
};
