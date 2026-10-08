import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Mentorship, MentorshipRequest, Milestone } from '../models/mentorship.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MentorshipService {
  private apiUrl = environment.apiUrl + '/mentorship';

  constructor(private http: HttpClient) {}

  getRequests(): Observable<{success: boolean, data: MentorshipRequest[]}> {
    return this.http.get<{success: boolean, data: MentorshipRequest[]}>(`${this.apiUrl}/requests`);
  }

  requestMentorship(mentorId: string, message: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/request`, { mentorId, message });
  }

  updateRequestStatus(requestId: string, status: 'accepted' | 'declined'): Observable<any> {
    return this.http.patch(`${this.apiUrl}/request/${requestId}/status`, { status });
  }

  getActiveMentorships(): Observable<{success: boolean, data: Mentorship[]}> {
    return this.http.get<{success: boolean, data: Mentorship[]}>(`${this.apiUrl}/my`);
  }

  getMentorship(id: string): Observable<{success: boolean, data: Mentorship}> {
    return this.http.get<{success: boolean, data: Mentorship}>(`${this.apiUrl}/${id}`);
  }

  getMilestones(id: string): Observable<any> { 
    return this.http.get<any>(`${this.apiUrl}/${id}/milestones`); 
  }

  updateGoals(mentorshipId: string, goals: string[]): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${mentorshipId}/goals`, { goals });
  }

  updateMilestones(mentorshipId: string, milestone: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${mentorshipId}/milestones`, milestone);
  }
}
