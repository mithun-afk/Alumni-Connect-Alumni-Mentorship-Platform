import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  @Input() isOpen = false;
  @Output() closeSidebar = new EventEmitter<void>();

  private authService = inject(AuthService);
  currentUser$ = this.authService.currentUser$;

  getMenuItems(role: string | undefined) {
    if (this._menuItemsRole === role) return this._menuItems;
    this._menuItemsRole = role;
    this._menuItems = this._generateMenuItems(role);
    return this._menuItems;
  }
  
  private _menuItemsRole?: string;
  private _menuItems: any[] = [];
  
  private _generateMenuItems(role: string | undefined) {
    if (role === 'admin') {
      return [
        { path: '/dashboard', icon: 'home', label: 'Dashboard' },
        { path: '/admin/users', icon: 'users', label: 'User Management' },
        { path: '/admin/alumni-verification', icon: 'shield', label: 'Alumni Requests' },
        { path: '/admin/moderation', icon: 'check-circle', label: 'Moderation' },
        { path: '/admin/audit-logs', icon: 'clock', label: 'Audit Logs' }
      ];
    } else if (role === 'alumni') {
      return [
        { path: '/dashboard', icon: 'home', label: 'Dashboard' },
        { path: '/mentorship/requests', icon: 'users', label: 'Mentorship Requests' },
          { path: '/students', icon: 'search', label: 'Find Students' },
        { path: '/mentorship/mentees', icon: 'book-open', label: 'My Mentees' },
        { path: '/career-path', icon: 'trending-up', label: 'Career Paths' },
        { path: '/opportunities', icon: 'award', label: 'Opportunities' },
        { path: '/events', icon: 'calendar', label: 'Events' },
        { path: '/messages', icon: 'message-square', label: 'Messages' },
        { path: '/referrals', icon: 'briefcase', label: 'Referrals' }
      ];
    } else {
      // student default
      return [
        { path: '/dashboard', icon: 'home', label: 'Dashboard' },
        { path: '/mentors', icon: 'search', label: 'Find Mentors' },
        { path: '/mentorship/my-mentorships', icon: 'book-open', label: 'My Mentorships' },
        { path: '/career-path', icon: 'trending-up', label: 'Career Paths' },
        { path: '/opportunities', icon: 'award', label: 'Opportunities' },
        { path: '/events', icon: 'calendar', label: 'Events' },
        { path: '/messages', icon: 'message-square', label: 'Messages' },
        { path: '/referrals', icon: 'briefcase', label: 'Referrals' }
      ];
    }
  }
}



