export interface ApiResponse<T> {
  success: boolean;
  data: {
    items: T[];
    [key: string]: any;
  };
}

export interface Opportunity {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  description: string;
  postedBy: string;
  createdAt: string;
}

export interface Referral {
  id: string;
  opportunityId: string;
  studentId: string;
  alumniId: string;
  status: 'Requested' | 'Reviewed' | 'Referred' | 'Outcome';
  notes?: string;
  createdAt: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  organizer: string;
  isRsvpd: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
}
