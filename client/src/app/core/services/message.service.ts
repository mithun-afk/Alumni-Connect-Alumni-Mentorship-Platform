import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
@Injectable({ providedIn: 'root' })
export class MessageService {
  private apiUrl = environment.apiUrl + '/messages';
  constructor(private http: HttpClient) {}
  getMessages(mentorshipId: string): Observable<any> { return this.http.get<any>(`${this.apiUrl}/${mentorshipId}`); }
  sendMessage(mentorshipId: string, content: string): Observable<any> { return this.http.post<any>(`${this.apiUrl}/${mentorshipId}`, { content }); }
}
