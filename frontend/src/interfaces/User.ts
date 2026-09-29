import type { TokenData } from "./Auth";

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

export interface NewUserResponse {
  user_data: UserResponse;
  token: TokenData;
}

export function userResponseToData(response: UserResponse): UserData {
  return {
    id: response.id,
    displayName: response.display_name,
    username: response.username,
    email: response.email,
    createdAt: new Date(response.created_at),
  };
}

export function authorResponseToData(response: AuthorResponse): AuthorData {
  return {
    id: response.id,
    displayName: response.display_name,
    username: response.username,
    createdAt: new Date(response.created_at),
  };
}
