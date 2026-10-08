import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class StudentService {
  private apiUrl = `${environment.apiUrl}/students`;
  constructor(private http: HttpClient) {}
  getStudents(params?: any): Observable<any> {
    return this.http.get<any>(this.apiUrl, { params });
  }
}
