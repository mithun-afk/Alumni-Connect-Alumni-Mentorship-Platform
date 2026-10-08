import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CareerNode {
  id: string;
  name: string;
  department: string;
  graduationYear: number;
  domain: string;
  company: string;
  role: string;
  year: number;
}

export interface CareerPathFilters {
  department?: string;
  graduationYear?: number;
  domain?: string;
  company?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CareerPathService {
  private http = inject(HttpClient);

  getPaths(filters: CareerPathFilters): Observable<{success: boolean, data: CareerNode[]}> {
    let params = new HttpParams();
    if (filters.department) params = params.set('department', filters.department);
    if (filters.graduationYear) params = params.set('graduationYear', filters.graduationYear.toString());
    if (filters.domain) params = params.set('domain', filters.domain);
    if (filters.company) params = params.set('company', filters.company);

    return this.http.get<{success: boolean, data: CareerNode[]}>(`${environment.apiUrl}/career-path`, { params });
  }
}
