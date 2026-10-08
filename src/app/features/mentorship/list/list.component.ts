import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MentorshipService, Mentorship } from '../../../../core/services/mentorship.service';
import { LucideAngularModule, ChevronRight, Activity } from 'lucide-angular';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="list-container">
      <header class="page-header">
        <h1>My Mentorships</h1>
        <p>Your active and completed mentorship programs</p>
      </header>

      <div class="loading-state" *ngIf="loading">
        <p>Loading mentorships...</p>
      </div>

      <div class="mentorships-grid" *ngIf="!loading && mentorships.length > 0">
        <div class="mentorship-card" *ngFor="let m of mentorships" (click)="viewJourney(m.id)">
          <div class="card-content">
            <div class="header-row">
              <h3>Mentorship with {{ m.mentorId }}</h3>
              <span class="status-badge" [class.active]="m.status === 'active'">{{ m.status | titlecase }}</span>
            </div>
            <div class="goals-preview" *ngIf="m.goals && m.goals.length">
              <p><strong>Goal:</strong> {{ m.goals[0] }}</p>
            </div>
          </div>
          <div class="card-footer">
            <span>View Journey</span>
            <lucide-icon name="chevron-right" size="16"></lucide-icon>
          </div>
        </div>
      </div>

      <div class="empty-state" *ngIf="!loading && mentorships.length === 0">
        <p>You don't have any active mentorships yet.</p>
      </div>
    </div>
  `,
  styles: [\`
    :host { display: block; font-family: 'Inter', sans-serif; background: #f8fafc; min-height: 100vh; padding: 24px; }
    .list-container { max-width: 1000px; margin: 0 auto; }
    h1 { color: #0f172a; margin-bottom: 8px; }
    .mentorships-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px; margin-top: 24px; }
    .mentorship-card { background: white; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; display: flex; flex-direction: column; }
    .mentorship-card:hover { transform: translateY(-2px); box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .card-content { padding: 24px; flex: 1; }
    .header-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
    .header-row h3 { margin: 0; font-size: 18px; color: #1e293b; }
    .status-badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; background: #e2e8f0; color: #475569; }
    .status-badge.active { background: #ccfbf1; color: #115e59; }
    .goals-preview { color: #64748b; font-size: 14px; }
    .card-footer { padding: 12px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; color: #0d9488; font-weight: 500; font-size: 14px; border-radius: 0 0 6px 6px; }
    .empty-state, .loading-state { text-align: center; padding: 48px; color: #64748b; }
  \`]
})
export class MentorshipListComponent implements OnInit {
  private mentorshipService = inject(MentorshipService);
  private router = inject(Router);

  mentorships: Mentorship[] = [];
  loading = true;

  ngOnInit() {
    this.mentorshipService.getActiveMentorships().subscribe({
      next: (data) => {
        this.mentorships = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  viewJourney(id: string) {
    this.router.navigate(['/mentorship/journey', id]);
  }
}
