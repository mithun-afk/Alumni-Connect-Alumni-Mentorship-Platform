export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'alumni' | 'admin';
  alumniStatus?: 'pending' | 'verified' | 'rejected' | 'suspended';
  department?: string;
  batch?: string;
  rollNo?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Profile {
  _id: string;
  user: User | string;
  headline?: string;
  bio?: string;
  currentCompany?: string;
  currentRole?: string;
  location?: string;
  skills: string[];
  domains: string[];
  experience?: number;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  phone?: string;
  profileVisibility: 'public' | 'students-only' | 'private';
  careerGoals: string[];
  interests: string[];
  achievements: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  data: { user: User; token: string; };
}

export interface Notification {
  _id: string;
  user: string;
  type: string;
  title: string;
  message: string;
  relatedId?: string;
  isRead: boolean;
  createdAt: string;
}
