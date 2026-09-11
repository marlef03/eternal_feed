export interface CommentProps {
  id: number;
  content: string;
  postId: number;
  authorId: number;
  createdAt: Date;
}