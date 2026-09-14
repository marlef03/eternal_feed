import type { CommentResponse, CommentData } from './Comment';
import type { AuthorResponse, AuthorData } from './User';

export interface PostResponse {
  id: number;
  title: string;
  content: string;
  created_at: string;
  author: AuthorResponse;
  comments: CommentResponse;
}

export interface PostData {
  id: number;
  title: string;
  content: string;
  createdAt: Date;
  author: AuthorData;
  comments: CommentData;
}