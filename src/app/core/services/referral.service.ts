import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, Referral } from '../models/phase3.models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReferralService {
  private apiUrl = `${environment.apiUrl}/referrals`;

  constructor(private http: HttpClient) {}

  getReferrals(): Observable<ApiResponse<Referral>> {
    return this.http.get<ApiResponse<Referral>>(this.apiUrl);
  }

  requestReferral(referral: Partial<Referral>): Observable<ApiResponse<Referral>> {
    return this.http.post<ApiResponse<Referral>>(this.apiUrl, referral);
  }
}
