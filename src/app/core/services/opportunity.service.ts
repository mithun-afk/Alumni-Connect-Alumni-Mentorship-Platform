import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, Opportunity } from '../models/phase3.models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OpportunityService {
  private apiUrl = `${environment.apiUrl}/opportunities`;

  constructor(private http: HttpClient) {}

  getOpportunities(): Observable<ApiResponse<Opportunity>> {
    return this.http.get<ApiResponse<Opportunity>>(this.apiUrl);
  }

  postOpportunity(opportunity: Partial<Opportunity>): Observable<ApiResponse<Opportunity>> {
    return this.http.post<ApiResponse<Opportunity>>(this.apiUrl, opportunity);
  }
}
