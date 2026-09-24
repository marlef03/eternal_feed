import { type AuthorResponse, type AuthorData, authorResponseToData } from './User';

export interface CommentResponse {
  id: number;
  content: string;
  created_at: string;
  author: AuthorResponse;
}

export interface CommentCreateResponse {
  id: number;
  content: string;
  created_at: string;
}

export interface CommentsResponse {
  items: CommentResponse[];
  has_more: boolean;
}

export interface CommentCreate {
  content: string;
}

export interface CommentData {
  id: number;
  content: string;
  createdAt: Date;
  author: AuthorData;
}

export interface CommentsData {
  items: CommentData[];
  hasMore: boolean;
}

export function commentsResponseToData(response: CommentsResponse): CommentsData {
  return {
    items: response.items.map(
      (item) => ({
        id: item.id,
        content: item.content,
        createdAt: new Date(item.created_at),
        author: authorResponseToData(item.author),
      })
    ),
    hasMore: response.has_more,
  };
}

export function commentCreateResponseToData(response: CommentResponse, author: AuthorData): CommentData {
  return {
    id: response.id,
    content: response.content,
    createdAt: new Date(response.created_at),
    author,
  };
}
