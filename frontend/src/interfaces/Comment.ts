export interface CommentResponse {
  items: {
    id: number;
    content: string;
    post_id: number;
    author_id: number;
    created_at: string;
  }[];
  has_more: boolean;
}

export interface CommentData {
  items: {
    id: number;
    content: string;
    postId: number;
    authorId: number;
    createdAt: Date;
  }[];
  hasMore: boolean;
}