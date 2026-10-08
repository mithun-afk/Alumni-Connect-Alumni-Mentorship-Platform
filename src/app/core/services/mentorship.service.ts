import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface MentorshipRequest {
  id: string;
  mentorId: string;
  studentId: string;
  message: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

export interface Mentorship {
  id: string;
  mentorId: string;
  studentId: string;
  status: 'active' | 'completed';
  goals: string[];
}

export interface Milestone {
  id: string;
  mentorshipId: string;
  title: string;
  completed: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class MentorshipService {
  private http = inject(HttpClient);
  private apiUrl = '/api/mentorship';

  getRequests(type: 'sent' | 'received'): Observable<MentorshipRequest[]> {
    return this.http.get<ApiResponse<MentorshipRequest[]>>(`${this.apiUrl}/requests`, { params: { type } }).pipe(
      map(response => response.data)
    );
  }

  requestMentorship(mentorId: string, message: string): Observable<MentorshipRequest> {
    return this.http.post<ApiResponse<MentorshipRequest>>(`${this.apiUrl}/requests`, { mentorId, message }).pipe(
      map(response => response.data)
    );
  }

  updateRequestStatus(requestId: string, status: 'accepted' | 'declined'): Observable<MentorshipRequest> {
    return this.http.patch<ApiResponse<MentorshipRequest>>(`${this.apiUrl}/requests/${requestId}`, { status }).pipe(
      map(response => response.data)
    );
  }

  getActiveMentorships(): Observable<Mentorship[]> {
    return this.http.get<ApiResponse<Mentorship[]>>(`${this.apiUrl}/active`).pipe(
      map(response => response.data)
    );
  }
  
  getMentorship(id: string): Observable<Mentorship> {
    return this.http.get<ApiResponse<Mentorship>>(`${this.apiUrl}/${id}`).pipe(
      map(response => response.data)
    );
  }

  getMilestones(mentorshipId: string): Observable<Milestone[]> {
    return this.http.get<ApiResponse<Milestone[]>>(`${this.apiUrl}/${mentorshipId}/milestones`).pipe(
      map(response => response.data)
    );
  }

  updateMilestone(mentorshipId: string, milestoneId: string, completed: boolean): Observable<Milestone> {
    return this.http.patch<ApiResponse<Milestone>>(`${this.apiUrl}/${mentorshipId}/milestones/${milestoneId}`, { completed }).pipe(
      map(response => response.data)
    );
  }
}
