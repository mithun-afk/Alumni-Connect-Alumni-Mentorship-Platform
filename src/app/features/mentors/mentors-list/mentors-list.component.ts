import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MentorService, Mentor } from '../../../../core/services/mentor.service';
import { MentorshipService } from '../../../../core/services/mentorship.service';
import { LucideAngularModule, Search, Filter, UserPlus, CheckCircle, ChevronDown, User, Briefcase, GraduationCap } from 'lucide-angular';

@Component({
  selector: 'app-mentors-list',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="mentors-container">
      <header class="page-header">
        <h1>Mentors Directory</h1>
        <p>Find and connect with alumni mentors</p>
      </header>

      <div class="filters-bar">
        <div class="search-box">
          <lucide-icon name="search"></lucide-icon>
          <input type="text" [(ngModel)]="searchTerm" (input)="loadMentors()" placeholder="Search mentors..." />
        </div>
        
        <div class="filter-dropdowns">
          <select [(ngModel)]="filters.department" (change)="loadMentors()">
            <option value="">All Departments</option>
            <option value="CS">Computer Science</option>
            <option value="IT">Information Technology</option>
            <option value="ECE">Electronics</option>
          </select>

          <select [(ngModel)]="filters.domain" (change)="loadMentors()">
            <option value="">All Domains</option>
            <option value="Frontend">Frontend</option>
            <option value="Backend">Backend</option>
            <option value="Data Science">Data Science</option>
          </select>
        </div>
      </div>

      <div class="mentors-grid" *ngIf="!loading && mentors.length > 0">
        <div class="mentor-card" *ngFor="let mentor of mentors">
          <div class="card-header">
            <div class="avatar">
              <lucide-icon name="user" size="32"></lucide-icon>
            </div>
            <div class="info">
              <h3>{{ mentor.name }}</h3>
              <p class="role"><lucide-icon name="briefcase" size="14"></lucide-icon> {{ mentor.company }}</p>
              <p class="batch"><lucide-icon name="graduation-cap" size="14"></lucide-icon> {{ mentor.department }} '{{ mentor.batch }}</p>
            </div>
          </div>
          
          <div class="match-score" *ngIf="mentor.smartMatchScore" 
               [class.high]="mentor.smartMatchScore >= 80"
               [class.medium]="mentor.smartMatchScore >= 50 && mentor.smartMatchScore < 80"
               [class.low]="mentor.smartMatchScore < 50">
            <span class="score-badge">{{ mentor.smartMatchScore }}% Match</span>
            <div class="breakdown-tooltip">
              <p>Domain: Match</p>
              <p>Department: Match</p>
            </div>
          </div>

          <div class="card-actions">
            <button class="btn-primary" (click)="openRequestModal(mentor)">
              <lucide-icon name="user-plus" size="16"></lucide-icon>
              Request Mentorship
            </button>
          </div>
        </div>
      </div>

      <div class="empty-state" *ngIf="!loading && mentors.length === 0">
        <p>No mentors found matching your criteria.</p>
      </div>
      
      <div class="loading-state" *ngIf="loading">
        <p>Loading mentors...</p>
      </div>

      <!-- Request Modal -->
      <div class="modal-overlay" *ngIf="selectedMentor">
        <div class="modal-content">
          <h2>Request Mentorship from {{ selectedMentor.name }}</h2>
          <textarea [(ngModel)]="requestMessage" placeholder="Why do you want this mentorship?"></textarea>
          <div class="modal-actions">
            <button class="btn-secondary" (click)="closeRequestModal()">Cancel</button>
            <button class="btn-primary" (click)="submitRequest()" [disabled]="isSubmitting">
              {{ isSubmitting ? 'Sending...' : 'Send Request' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [\`
    :host {
      display: block;
      font-family: 'Inter', sans-serif;
      color: #1a1a1a;
      background: #f8fafc;
      min-height: 100vh;
      padding: 24px;
    }
    .mentors-container { max-width: 1200px; margin: 0 auto; }
    h1 { color: #0f172a; margin-bottom: 8px; }
    .filters-bar { display: flex; gap: 16px; margin-bottom: 24px; }
    .search-box { display: flex; align-items: center; background: white; padding: 8px 12px; border-radius: 6px; border: 1px solid #e2e8f0; flex: 1; }
    .search-box input { border: none; outline: none; margin-left: 8px; width: 100%; }
    .filter-dropdowns select { padding: 8px 12px; border-radius: 6px; border: 1px solid #e2e8f0; margin-left: 8px; }
    .mentors-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px; }
    .mentor-card { background: white; border-radius: 6px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); display: flex; flex-direction: column; position: relative; }
    .card-header { display: flex; gap: 16px; margin-bottom: 16px; }
    .avatar { width: 64px; height: 64px; background: #e2e8f0; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
    .info h3 { margin: 0 0 4px 0; }
    .info p { margin: 0; color: #64748b; font-size: 14px; display: flex; align-items: center; gap: 4px; }
    .match-score { position: absolute; top: 24px; right: 24px; cursor: pointer; }
    .score-badge { padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 600; }
    .high .score-badge { background: #dcfce7; color: #166534; }
    .medium .score-badge { background: #fef08a; color: #854d0e; }
    .low .score-badge { background: #fee2e2; color: #991b1b; }
    .breakdown-tooltip { display: none; position: absolute; top: 100%; right: 0; background: #1e293b; color: white; padding: 8px; border-radius: 6px; width: 150px; z-index: 10; font-size: 12px; margin-top: 8px; }
    .match-score:hover .breakdown-tooltip { display: block; }
    .card-actions { margin-top: auto; padding-top: 16px; border-top: 1px solid #e2e8f0; }
    .btn-primary { background: #0d9488; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 8px; width: 100%; justify-content: center; font-weight: 500; }
    .btn-primary:hover { background: #0f766e; }
    .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
    .btn-secondary { background: white; color: #475569; border: 1px solid #cbd5e1; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 500; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 100; }
    .modal-content { background: white; padding: 24px; border-radius: 6px; width: 400px; max-width: 90vw; }
    textarea { width: 100%; height: 100px; padding: 8px; margin: 16px 0; border: 1px solid #e2e8f0; border-radius: 6px; resize: vertical; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 12px; }
    .loading-state, .empty-state { text-align: center; padding: 48px; color: #64748b; }
  \`]
})
export class MentorsListComponent implements OnInit {
  private mentorService = inject(MentorService);
  private mentorshipService = inject(MentorshipService);

  mentors: Mentor[] = [];
  loading = true;
  searchTerm = '';
  filters = { department: '', domain: '' };
  
  selectedMentor: Mentor | null = null;
  requestMessage = '';
  isSubmitting = false;

  ngOnInit() {
    this.loadMentors();
  }

  loadMentors() {
    this.loading = true;
    const currentFilters = { ...this.filters, search: this.searchTerm };
    this.mentorService.getMentors(currentFilters).subscribe({
      next: (data) => {
        this.mentors = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  openRequestModal(mentor: Mentor) {
    this.selectedMentor = mentor;
    this.requestMessage = '';
  }

  closeRequestModal() {
    this.selectedMentor = null;
    this.requestMessage = '';
  }

  submitRequest() {
    if (!this.selectedMentor || !this.requestMessage.trim()) return;
    this.isSubmitting = true;
    this.mentorshipService.requestMentorship(this.selectedMentor.id, this.requestMessage).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.closeRequestModal();
        alert('Mentorship request sent successfully!');
      },
      error: () => {
        this.isSubmitting = false;
        alert('Failed to send request. Please try again.');
      }
    });
  }
}
