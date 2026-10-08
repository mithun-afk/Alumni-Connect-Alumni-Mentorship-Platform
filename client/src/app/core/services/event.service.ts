import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
@Injectable({ providedIn: 'root' })
export class EventService {
  private apiUrl = environment.apiUrl + '/events';
  constructor(private http: HttpClient) {}
  getEvents(): Observable<any> { return this.http.get<any>(this.apiUrl); }
  createEvent(data: any): Observable<any> { return this.http.post<any>(this.apiUrl, data); }
  rsvp(id: string, status: string): Observable<any> { return this.http.post<any>(`${this.apiUrl}/${id}/rsvp`, { status }); }
}
