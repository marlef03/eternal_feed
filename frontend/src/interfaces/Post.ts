import type { CommentsResponse, CommentsData } from './Comment';
import type { AuthorResponse, AuthorData } from './User';

export interface PostResponse {
  id: number;
  title: string;
  content: string;
  created_at: string;
  author: AuthorResponse;
  comments: CommentsResponse;
}

export interface PostCreateResponse {
  id: number;
  title: string;
  content: string;
  created_at: string;
}

export interface PostCreate {
  title: string;
  content: string;
}

export interface PostData {
  id: number;
  title: string;
  content: string;
  createdAt: Date;
  author: AuthorData;
  comments: CommentsData;
}

export function postResponseToData(response: PostResponse): PostData {
  return {
    id: response.id,
    title: response.title,
    content: response.content,
    createdAt: new Date(response.created_at),
    author: {
      id: response.author.id,
      displayName: response.author.display_name,
      username: response.author.username,
      createdAt: new Date(response.author.created_at),
    },
    comments: {
      items: response.comments.items.map((comment) => ({
        id: comment.id,
        content: comment.content,
        createdAt: new Date(comment.created_at),
        author: {
          id: comment.author.id,
          displayName: comment.author.display_name,
          username: comment.author.username,
          createdAt: new Date(comment.author.created_at),
        },
      })),
      hasMore: response.comments.has_more,
    }
  }
}

export function postCreateResponseToData(response: PostCreateResponse, author: AuthorData): PostData {
  return {
    id: response.id,
    title: response.title,
    content: response.content,
    createdAt: new Date(response.created_at),
    author,
    comments: {
      items: [],
      hasMore: false,
    }
  }
}
