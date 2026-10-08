import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { User } from '../models/user.model';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    const token = this.getToken();
    if (token) {
      this.getMe().pipe(catchError(() => { this.clearSession(); return of(null); })).subscribe();
    }
  }

  get currentUserValue(): User | null { return this.currentUserSubject.value; }

  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/auth/login`, credentials).pipe(
      tap(response => {
        if (response.success && response.data) {
          localStorage.setItem('token', response.data.token);
          this.currentUserSubject.next(response.data.user);
        }
      })
    );
  }

  register(data: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/auth/register`, data).pipe(
      tap(response => {
        if (response.success && response.data) {
          localStorage.setItem('token', response.data.token);
          this.currentUserSubject.next(response.data.user);
        }
      })
    );
  }

  logout(): void { this.clearSession(); this.router.navigate(['/auth/login']); }

  private clearSession(): void {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
  }

  getMe(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/auth/me`).pipe(
      tap(response => {
        if (response.success && response.data) {
          // backend returns { user, profile } inside data
          const user = response.data.user || response.data;
          this.currentUserSubject.next(user);
        }
      })
    );
  }

  getToken(): string | null { return localStorage.getItem('token'); }
  // Check token only — avoids race condition on hard refresh before getMe resolves
  isLoggedIn(): boolean { return !!this.getToken(); }
  isAlumniVerified(): boolean {
    const user = this.currentUserSubject.value;
    return user?.role === 'alumni' && user?.alumniStatus === 'verified';
  }
}
