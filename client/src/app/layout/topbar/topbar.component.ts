import { Component, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { LucideAngularModule } from 'lucide-angular';
import { Notification } from '../../core/models/user.model';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss']
})
export class TopbarComponent implements OnInit {
  @Output() toggleSidebar = new EventEmitter<void>();

  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  currentUser$ = this.authService.currentUser$;
  unreadCount$ = this.notificationService.unreadCount$;
  
  isProfileMenuOpen = false;
  isNotificationMenuOpen = false;
  notifications: Notification[] = [];

  ngOnInit() {
    this.currentUser$.subscribe(user => {
      if (user) {
        this.loadNotifications();
      }
    });
  }

  loadNotifications() {
    this.notificationService.getNotifications(1).subscribe(res => {
      if (res.success) {
        const list = res.data?.notifications || res.data || [];
        this.notifications = (list || []).slice(0, 5); // Just show top 5 in dropdown
      }
    });
  }

  toggleProfileMenu() {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
    if (this.isProfileMenuOpen) this.isNotificationMenuOpen = false;
  }

  toggleNotificationMenu() {
    this.isNotificationMenuOpen = !this.isNotificationMenuOpen;
    if (this.isNotificationMenuOpen) {
      this.isProfileMenuOpen = false;
      this.loadNotifications();
    }
  }

  markAllRead() {
    this.notificationService.markAllAsRead().subscribe(() => {
      this.notifications.forEach(n => n.isRead = true);
      this.isNotificationMenuOpen = false;
    });
  }

  logout() {
    this.authService.logout();
  }
}

