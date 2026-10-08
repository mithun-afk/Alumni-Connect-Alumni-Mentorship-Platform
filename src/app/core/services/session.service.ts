import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface OfficeHourSlot {
  id: string;
  mentorId: string;
  date: string;
  startTime: string;
  endTime: string;
  topic: string;
  isBooked: boolean;
}

export interface Session {
  id: string;
  mentorshipId: string;
  slotId: string;
  date: string;
  notes: string;
  status: 'upcoming' | 'completed' | 'cancelled';
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private http = inject(HttpClient);
  
  getOfficeHours(mentorId?: string): Observable<OfficeHourSlot[]> {
    const params: any = {};
    if (mentorId) params.mentorId = mentorId;
    return this.http.get<ApiResponse<OfficeHourSlot[]>>('/api/office-hours', { params }).pipe(
      map(response => response.data)
    );
  }

  addOfficeHourSlot(slot: Partial<OfficeHourSlot>): Observable<OfficeHourSlot> {
    return this.http.post<ApiResponse<OfficeHourSlot>>('/api/office-hours', slot).pipe(
      map(response => response.data)
    );
  }

  getSessions(mentorshipId: string): Observable<Session[]> {
    return this.http.get<ApiResponse<Session[]>>('/api/sessions', { params: { mentorshipId } }).pipe(
      map(response => response.data)
    );
  }

  bookSession(mentorshipId: string, slotId: string): Observable<Session> {
    return this.http.post<ApiResponse<Session>>('/api/sessions', { mentorshipId, slotId }).pipe(
      map(response => response.data)
    );
  }

  updateSessionNotes(sessionId: string, notes: string): Observable<Session> {
    return this.http.patch<ApiResponse<Session>>(`/api/sessions/${sessionId}`, { notes }).pipe(
      map(response => response.data)
    );
  }
}
