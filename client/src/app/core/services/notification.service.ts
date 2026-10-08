import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, interval, Subscription } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { Notification } from '../models/user.model';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  private pollingSubscription?: Subscription;

  constructor() {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.getUnreadCount().subscribe();
        this.startPolling();
      } else {
        this.stopPolling();
        this.unreadCountSubject.next(0);
      }
    });
  }

  getNotifications(page: number = 1): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/notifications?page=${page}`);
  }

  getNotificationList(page: number = 1): Observable<Notification[]> {
    return new Observable(observer => {
      this.getNotifications(page).subscribe({
        next: (res) => {
          observer.next(res.data?.notifications || []);
          observer.complete();
        },
        error: (err) => observer.error(err)
      });
    });
  }

  markAsRead(id: string): Observable<any> {
    return this.http.patch(`${environment.apiUrl}/notifications/${id}/read`, {}).pipe(
      tap(() => this.getUnreadCount().subscribe())
    );
  }

  markAllAsRead(): Observable<any> {
    return this.http.patch(`${environment.apiUrl}/notifications/read-all`, {}).pipe(
      tap(() => this.getUnreadCount().subscribe())
    );
  }

  getUnreadCount(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/notifications/unread-count`).pipe(
      tap(res => {
        if (res.success) {
          this.unreadCountSubject.next(res.data?.count ?? res.count ?? 0);
        }
      })
    );
  }

  startPolling(): void {
    if (!this.pollingSubscription || this.pollingSubscription.closed) {
      this.pollingSubscription = interval(30000).pipe(
        switchMap(() => this.getUnreadCount())
      ).subscribe();
    }
  }

  stopPolling(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }
}
