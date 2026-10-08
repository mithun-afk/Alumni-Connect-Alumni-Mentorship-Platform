import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
@Injectable({ providedIn: 'root' })
export class OpportunityService {
  private apiUrl = environment.apiUrl + '/opportunities';
  constructor(private http: HttpClient) {}
  getOpportunities(params?: any): Observable<any> { return this.http.get<any>(this.apiUrl, { params }); }
  postOpportunity(data: any): Observable<any> { return this.http.post<any>(this.apiUrl, data); }
  applyOpportunity(id: string): Observable<any> { return this.http.post<any>(`${this.apiUrl}/${id}/apply`, {}); }
}
