export interface User {
  id: string;
  email: string;
  password: string; // Will be hashed
  name: string;
  createdAt: string;
}

export interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}