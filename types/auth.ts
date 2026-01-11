export interface ProviderContact {
  email: string;
  phone: string;
}

export interface Provider {
  _id: string;
  name: string;
  contact: ProviderContact;
  description: string;
  address: string;
  members: string[];
}

export interface User {
  username: string;
  fullName: string;
  phone: string;
  email: string;  
  roleType: "admin" | "provider" | "user";
  role?: "admin" | "staff"; // Optional, only for admin or provider
  provider?: Provider;
  pp?: string; // Profile picture
}

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}
