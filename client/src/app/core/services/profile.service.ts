import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Profile } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private http = inject(HttpClient);

  getMyProfile(): Observable<{success: boolean, data: Profile}> {
    return this.http.get<{success: boolean, data: Profile}>(`${environment.apiUrl}/profile`);
  }

  updateProfile(data: Partial<Profile>): Observable<{success: boolean, data: Profile}> {
    return this.http.put<{success: boolean, data: Profile}>(`${environment.apiUrl}/profile`, data);
  }

  getPublicProfile(userId: string): Observable<{success: boolean, data: Profile}> {
    return this.http.get<{success: boolean, data: Profile}>(`${environment.apiUrl}/profile/${userId}`);
  }
}
