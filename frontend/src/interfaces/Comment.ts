import type { AuthorResponse, AuthorData } from './User';

export interface CommentResponse {
  items: {
    id: number;
    content: string;
    created_at: string;
    author: AuthorResponse;
  }[];
  has_more: boolean;
}

export interface CommentCreate {
  content: string;
}

export interface CommentData {
  items: {
    id: number;
    content: string;
    createdAt: Date;
    author: AuthorData;
  }[];
  hasMore: boolean;
}