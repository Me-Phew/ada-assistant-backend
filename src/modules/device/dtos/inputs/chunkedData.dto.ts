export interface ChunkedDataDto {
  chunkIndex: number;
  totalChunks: number;
  data: string; // Base64 encoded data
  filename?: string;
  sessionId: string;
  isLastChunk?: boolean;
}
