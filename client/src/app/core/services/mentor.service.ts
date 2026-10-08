import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Mentor } from '../models/mentorship.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MentorService {
  private apiUrl = environment.apiUrl + '/mentors';

  constructor(private http: HttpClient) {}

  getMentors(filters: any): Observable<{success: boolean, data: Mentor[]}> {
    let params = new HttpParams();
    if (filters.department) params = params.set('department', filters.department);
    if (filters.domain) params = params.set('domain', filters.domain);
    if (filters.batch) params = params.set('batch', filters.batch);
    if (filters.company) params = params.set('company', filters.company);
    return this.http.get<{success: boolean, data: Mentor[]}>(this.apiUrl, { params });
  }
}
