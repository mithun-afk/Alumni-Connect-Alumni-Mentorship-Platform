import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
@Injectable({ providedIn: 'root' })
export class ReferralService {
  private apiUrl = environment.apiUrl + '/referrals';
  constructor(private http: HttpClient) {}
  getReferrals(): Observable<any> { return this.http.get<any>(this.apiUrl); }
  requestReferral(data: any): Observable<any> { return this.http.post<any>(this.apiUrl, data); }
  updateStatus(id: string, status: string, notes?: string): Observable<any> { return this.http.patch<any>(`${this.apiUrl}/${id}/status`, { status, notes }); }
}
