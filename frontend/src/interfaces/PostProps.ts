import type { CommentData } from './Comment';

export interface PostProps {
  id: number;
  title: string;
  content: string;
  authorId: number;
  createdAt: Date;
  authorDisplayName: string;
  authorUsername: string;
  authorCreatedAt: Date;
  comments: CommentData;
}