export interface Mentor {
  id: string;
  userId: string;
  name: string;
  avatarUrl?: string;
  department: string;
  domain: string;
  batch: string;
  company: string;
  jobTitle: string;
  bio: string;
  skills?: string[];
  domains?: string[];
  matchScore?: number;
  matchBreakdown?: any;
}

export interface MentorshipRequest {
  _id: string;
  id: string;
  mentor: { _id: string; firstName: string; lastName: string; email: string; department?: string; batch?: string; };
  student: { _id: string; firstName: string; lastName: string; email: string; department?: string; batch?: string; };
  message: string;
  status: 'pending' | 'accepted' | 'declined';
  matchScore?: number;
  matchBreakdown?: any;
  createdAt: string;
  type: 'sent' | 'received';
}

export interface Mentorship {
  _id: string;
  id: string;
  mentor: { _id: string; firstName: string; lastName: string; email: string; department?: string; };
  student: { _id: string; firstName: string; lastName: string; email: string; department?: string; };
  request?: string;
  status: 'active' | 'completed' | 'paused';
  startDate?: string;
  goals: string[];
  milestones: Milestone[];
  createdAt: string;
}

export interface Milestone {
  _id?: string;
  id?: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  completedAt?: string;
}

export interface OfficeHourSlot {
  _id: string;
  id: string;
  mentor: string;
  date: string;
  startTime: string;
  endTime: string;
  topic?: string;
  isBooked: boolean;
  bookedBy?: string;
}

export interface Session {
  _id: string;
  id: string;
  mentorship: string;
  mentor: string;
  student: string;
  officeHourSlot?: string;
  scheduledAt: string;
  duration?: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  studentNotes?: string;
  rating?: number;
}
