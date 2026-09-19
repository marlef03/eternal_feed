export interface UsernameLoginData {
  username: string;
  password: string;
}

export interface EmailLoginData {
  email: string;
  password: string;
}

export type LoginType = 'username' | 'email';

export interface LoginParams {
  loginData: UsernameLoginData | EmailLoginData; 
  type: LoginType;
}

export interface TokenData {
	access_token: string;
  token_type: string;
}
