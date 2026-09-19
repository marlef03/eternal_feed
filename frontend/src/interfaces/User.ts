export interface AuthorResponse {
  id: number;
  display_name: string;
  username: string;
  created_at: string;
}

export interface AuthorData {
  id: number;
  displayName: string;
  username: string;
  createdAt: Date;
}

export interface UserResponse {
  id: number;
  display_name: string;
  username: string;
  email: string;
  created_at: string;
}

export interface UserData {
  id: number;
  displayName: string;
  username: string;
  email: string;
  createdAt: Date;
}