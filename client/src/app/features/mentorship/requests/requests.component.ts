import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { MentorshipService } from '../../../core/services/mentorship.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-requests',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './requests.component.html',
  styleUrls: ['./requests.component.scss']
})
export class RequestsComponent implements OnInit {
  requests: any[] = [];
  loading = true;
  error = '';
  userRole = '';

  constructor(private mentorshipService: MentorshipService, private authService: AuthService) {}

  ngOnInit() {
    this.userRole = this.authService.currentUserValue?.role || '';
    this.loadRequests();
  }

  loadRequests() {
    this.loading = true; this.error = '';
    this.mentorshipService.getRequests().subscribe({
      next: (res: any) => { this.requests = res.data || []; this.loading = false; },
      error: () => { this.error = 'Failed to load requests.'; this.loading = false; }
    });
  }

  accept(id: string) {
    this.mentorshipService.updateRequestStatus(id, 'accepted').subscribe({
      next: () => this.loadRequests(),
      error: (err: any) => { this.error = err.message || 'Failed to accept'; }
    });
  }

  decline(id: string) {
    this.mentorshipService.updateRequestStatus(id, 'declined').subscribe({
      next: () => this.loadRequests(),
      error: (err: any) => { this.error = err.message || 'Failed to decline'; }
    });
  }

  getPersonName(req: any): string {
    if (this.userRole === 'alumni') {
      return req.student ? `${req.student.firstName || ''} ${req.student.lastName || ''}`.trim() : 'Student';
    }
    return req.mentor ? `${req.mentor.firstName || ''} ${req.mentor.lastName || ''}`.trim() : 'Mentor';
  }

  getPersonDept(req: any): string {
    if (this.userRole === 'alumni') return req.student?.department || '';
    return req.mentor?.department || '';
  }
}
