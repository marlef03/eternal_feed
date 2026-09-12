export interface PostResponse {
  post: {
    id: number;
    title: string;
    content: string;
    created_at: string;
  };
  author: {
    id: number;
    display_name: string;
    username: string;
    created_at: string;
  }
}

export interface PostData {
  id: number;
  title: string;
  content: string;
  createdAt: Date;
  author: {
    id: number;
    displayName: string;
    username: string;
    createdAt: Date;
  };
}