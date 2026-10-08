import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);

  getPendingAlumni(): Observable<{success: boolean, data: User[]}> {
    return this.http.get<{success: boolean, data: User[]}>(`${environment.apiUrl}/admin/pending-alumni`);
  }

  getAllUsers(params?: any): Observable<{success: boolean, data: User[], total: number}> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key]) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return this.http.get<{success: boolean, data: User[], total: number}>(`${environment.apiUrl}/admin/users`, { params: httpParams });
  }

  updateAlumniStatus(id: string, status: string, reason?: string): Observable<any> {
    const body = { status, ...(reason && { reason }) };
    return this.http.patch(`${environment.apiUrl}/admin/alumni/${id}/status`, body);
  }

  getDashboardStats(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/admin/stats`);
  }

  getAuditLogs(params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key]) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return this.http.get(`${environment.apiUrl}/admin/audit-logs`, { params: httpParams });
  }

  getPendingModerationItems(): Observable<{success: boolean, data: any[]}> {
    return this.http.get<{success: boolean, data: any[]}>(`${environment.apiUrl}/admin/moderation`);
  }

  moderateItem(id: string, action: 'approve' | 'suspend' | 'delete', type: 'mentorship' | 'opportunity' | 'event'): Observable<{success: boolean}> {
    return this.http.post<{success: boolean}>(`${environment.apiUrl}/admin/moderation/${id}/${action}`, { type });
  }
}
