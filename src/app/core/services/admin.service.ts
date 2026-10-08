import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common';
import { Observable } from 'rxjs';
import { ApiResponse } from './dashboard.service';

export interface ModerationItem {
  id: string;
  type: 'mentorship' | 'opportunity' | 'event';
  title: string;
  status: 'pending' | 'approved' | 'suspended' | 'deleted';
  submittedBy: string;
  date: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = '/api/admin/moderation';

  constructor(private http: HttpClient) {}

  getPendingItems(): Observable<ApiResponse<ModerationItem[]>> {
    return this.http.get<ApiResponse<ModerationItem[]>>(this.apiUrl);
  }

  moderateItem(id: string, action: 'approve' | 'suspend' | 'delete'): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/${id}/${action}`, {});
  }
}
