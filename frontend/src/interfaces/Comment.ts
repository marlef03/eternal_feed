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

export function commentResponseToData(response: CommentResponse): CommentData {
  return {
    items: response.items.map(
      (item) => ({
        id: item.id,
        content: item.content,
        createdAt: new Date(item.created_at),
        author: {
          id: item.author.id,
          displayName: item.author.display_name,
          username: item.author.username,
          createdAt: new Date(item.author.created_at),
        }
      })
    ),
    hasMore: response.has_more,
  };
}
