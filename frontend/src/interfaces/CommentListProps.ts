import type { CommentData } from './Comment';

export interface CommentListProps {
  postId: number;
  preloadedComments: CommentData;
}