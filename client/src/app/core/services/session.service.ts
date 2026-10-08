import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OfficeHourSlot, Session } from '../models/mentorship.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private officeHoursUrl = environment.apiUrl + '/office-hours';
  private sessionsUrl = environment.apiUrl + '/sessions';

  constructor(private http: HttpClient) {}

  getOfficeHours(mentorId: string): Observable<{success: boolean, data: OfficeHourSlot[]}> {
    return this.http.get<{success: boolean, data: OfficeHourSlot[]}>(`${this.officeHoursUrl}/${mentorId}`);
  }

  addOfficeHour(slot: Partial<OfficeHourSlot>): Observable<any> {
    return this.http.post(`${this.officeHoursUrl}`, slot);
  }

  bookSession(mentorshipId: string, slotId: string): Observable<any> {
    return this.http.post(`${this.officeHoursUrl}/${slotId}/book`, { mentorshipId });
  }

  getSessions(mentorshipId: string): Observable<{success: boolean, data: Session[]}> {
    return this.http.get<{success: boolean, data: Session[]}>(`${this.sessionsUrl}/${mentorshipId}`);
  }
  
  updateSession(sessionId: string, data: any): Observable<any> {
    return this.http.patch(`${this.sessionsUrl}/${sessionId}`, data);
  }
}
