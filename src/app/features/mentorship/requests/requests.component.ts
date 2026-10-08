import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MentorshipService, MentorshipRequest } from '../../../../core/services/mentorship.service';
import { LucideAngularModule, Check, X, Clock } from 'lucide-angular';

@Component({
  selector: 'app-requests',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="requests-container">
      <header class="page-header">
        <h1>Mentorship Requests</h1>
      </header>

      <div class="tabs">
        <button [class.active]="activeTab === 'received'" (click)="setTab('received')">Received</button>
        <button [class.active]="activeTab === 'sent'" (click)="setTab('sent')">Sent</button>
      </div>

      <div class="loading-state" *ngIf="loading">
        <p>Loading requests...</p>
      </div>

      <div class="requests-list" *ngIf="!loading && requests.length > 0">
        <div class="request-card" *ngFor="let req of requests">
          <div class="req-header">
            <h3>{{ activeTab === 'received' ? 'From: Student ' + req.studentId : 'To: Mentor ' + req.mentorId }}</h3>
            <span class="status-badge" [ngClass]="req.status">{{ req.status | titlecase }}</span>
          </div>
          <p class="message">"{{ req.message }}"</p>
          <div class="date">{{ req.createdAt | date }}</div>
          
          <div class="actions" *ngIf="activeTab === 'received' && req.status === 'pending'">
            <button class="btn-approve" (click)="updateStatus(req.id, 'accepted')">
              <lucide-icon name="check" size="16"></lucide-icon> Accept
            </button>
            <button class="btn-decline" (click)="updateStatus(req.id, 'declined')">
              <lucide-icon name="x" size="16"></lucide-icon> Decline
            </button>
          </div>
        </div>
      </div>

      <div class="empty-state" *ngIf="!loading && requests.length === 0">
        <p>No {{ activeTab }} requests found.</p>
      </div>
    </div>
  `,
  styles: [\`
    :host { display: block; font-family: 'Inter', sans-serif; background: #f8fafc; min-height: 100vh; padding: 24px; }
    .requests-container { max-width: 800px; margin: 0 auto; }
    h1 { color: #0f172a; }
    .tabs { display: flex; gap: 8px; margin-bottom: 24px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; }
    .tabs button { background: none; border: none; padding: 8px 16px; font-weight: 500; color: #64748b; cursor: pointer; }
    .tabs button.active { color: #0d9488; border-bottom: 2px solid #0d9488; }
    .requests-list { display: flex; flex-direction: column; gap: 16px; }
    .request-card { background: white; padding: 20px; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .req-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .req-header h3 { margin: 0; font-size: 16px; color: #1e293b; }
    .status-badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; }
    .status-badge.pending { background: #fef08a; color: #854d0e; }
    .status-badge.accepted { background: #dcfce7; color: #166534; }
    .status-badge.declined { background: #fee2e2; color: #991b1b; }
    .message { color: #475569; font-style: italic; margin-bottom: 12px; }
    .date { font-size: 12px; color: #94a3b8; margin-bottom: 16px; }
    .actions { display: flex; gap: 12px; border-top: 1px solid #e2e8f0; padding-top: 16px; }
    .btn-approve { background: #0d9488; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; display: flex; align-items: center; gap: 4px; }
    .btn-decline { background: #ef4444; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; display: flex; align-items: center; gap: 4px; }
    .empty-state, .loading-state { text-align: center; padding: 48px; color: #64748b; }
  \`]
})
export class RequestsComponent implements OnInit {
  private mentorshipService = inject(MentorshipService);
  
  activeTab: 'received' | 'sent' = 'received';
  requests: MentorshipRequest[] = [];
  loading = true;

  ngOnInit() {
    this.loadRequests();
  }

  setTab(tab: 'received' | 'sent') {
    this.activeTab = tab;
    this.loadRequests();
  }

  loadRequests() {
    this.loading = true;
    this.mentorshipService.getRequests(this.activeTab).subscribe({
      next: (data) => {
        this.requests = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  updateStatus(id: string, status: 'accepted' | 'declined') {
    this.mentorshipService.updateRequestStatus(id, status).subscribe({
      next: () => {
        this.loadRequests();
      }
    });
  }
}
