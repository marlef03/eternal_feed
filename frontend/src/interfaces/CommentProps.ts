export interface CommentProps {
  id: number;
  content: string;
  createdAt: Date;
  authorId: number;
  authorDisplayName: string;
  authorUsername: string;
  authorCreatedAt: Date;
}
