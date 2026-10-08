import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common';
import { Observable } from 'rxjs';

export interface DashboardStats {
  totalAlumni: number;
  activeMentorships: number;
  upcomingEvents: number;
  openOpportunities: number;
  alumniImpactScore?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = '/api/dashboard';

  constructor(private http: HttpClient) {}

  getStats(role: string): Observable<ApiResponse<DashboardStats>> {
    return this.http.get<ApiResponse<DashboardStats>>(`${this.apiUrl}/stats?role=${role}`);
  }
}
