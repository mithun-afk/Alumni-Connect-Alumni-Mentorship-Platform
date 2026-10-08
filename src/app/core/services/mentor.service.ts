import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Mentor {
  id: string;
  name: string;
  department: string;
  domain: string;
  batch: string;
  company: string;
  smartMatchScore?: number;
  about?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class MentorService {
  private http = inject(HttpClient);
  private apiUrl = '/api/mentors';

  getMentors(filters?: any): Observable<Mentor[]> {
    return this.http.get<ApiResponse<Mentor[]>>(this.apiUrl, { params: filters }).pipe(
      map(response => response.data)
    );
  }
}
