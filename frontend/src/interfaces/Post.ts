export interface PostResponse {
  id: number;
  title: string;
  content: string;
  author_id: number;
  created_at: string;
}

export interface PostData {
  id: number;
  title: string;
  content: string;
  authorId: number;
  createdAt: Date;
}