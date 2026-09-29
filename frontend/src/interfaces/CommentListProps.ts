import type { CommentsData } from "./Comment";

export interface CommentListProps {
  postId: number;
  preloadedComments: CommentsData;
}
