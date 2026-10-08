import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common';
import { Observable } from 'rxjs';
import { ApiResponse } from './dashboard.service';

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
  private apiUrl = '/api/career-path';

  constructor(private http: HttpClient) {}

  getPaths(filters: CareerPathFilters): Observable<ApiResponse<CareerNode[]>> {
    let params = new HttpParams();
    if (filters.department) params = params.set('department', filters.department);
    if (filters.graduationYear) params = params.set('graduationYear', filters.graduationYear.toString());
    if (filters.domain) params = params.set('domain', filters.domain);
    if (filters.company) params = params.set('company', filters.company);

    return this.http.get<ApiResponse<CareerNode[]>>(this.apiUrl, { params });
  }
}
