import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MentorshipService, Mentorship, Milestone } from '../../../../core/services/mentorship.service';
import { SessionService, Session, OfficeHourSlot } from '../../../../core/services/session.service';
import { LucideAngularModule, Calendar, CheckSquare, Target, BookOpen, Edit2, X } from 'lucide-angular';

@Component({
  selector: 'app-journey',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="journey-container" *ngIf="mentorship; else loadingState">
      <header class="journey-header">
        <div class="header-content">
          <h1>Mentorship Journey</h1>
          <p class="subtitle">Mentorship with {{ mentorship.mentorId }}</p>
        </div>
        <button class="btn-primary" (click)="openBookingModal()">
          <lucide-icon name="calendar" size="16"></lucide-icon>
          Book Session
        </button>
      </header>

      <div class="grid-layout">
        <!-- Main Column -->
        <div class="main-column">
          <!-- Milestones Section -->
          <section class="card">
            <div class="section-header">
              <lucide-icon name="check-square" class="icon-accent"></lucide-icon>
              <h2>Milestones</h2>
            </div>
            
            <div class="progress-container">
              <div class="progress-bar-bg">
                <div class="progress-bar-fill" [style.width.%]="progressPercentage"></div>
              </div>
              <p class="progress-text">{{ progressPercentage | number:'1.0-0' }}% Completed</p>
            </div>

            <div class="milestones-list">
              <div class="milestone-item" *ngFor="let m of milestones">
                <label class="checkbox-container">
                  <input type="checkbox" [checked]="m.completed" (change)="toggleMilestone(m)" />
                  <span class="checkmark"></span>
                  <span class="milestone-title" [class.completed]="m.completed">{{ m.title }}</span>
                </label>
              </div>
            </div>
          </section>

          <!-- Session Log -->
          <section class="card">
            <div class="section-header">
              <lucide-icon name="book-open" class="icon-accent"></lucide-icon>
              <h2>Session Log</h2>
            </div>
            
            <div class="sessions-list">
              <div class="session-item" *ngFor="let session of sessions">
                <div class="session-date">
                  <strong>{{ session.date | date:'mediumDate' }}</strong>
                  <span class="status-badge" [ngClass]="session.status">{{ session.status }}</span>
                </div>
                <div class="session-notes">
                  <p *ngIf="!editingSession || editingSession.id !== session.id">{{ session.notes || 'No notes added.' }}</p>
                  
                  <div class="edit-notes-form" *ngIf="editingSession && editingSession.id === session.id">
                    <textarea [(ngModel)]="editingNotes"></textarea>
                    <div class="form-actions">
                      <button class="btn-small btn-secondary" (click)="cancelEditNotes()">Cancel</button>
                      <button class="btn-small btn-primary" (click)="saveNotes()">Save</button>
                    </div>
                  </div>

                  <button class="btn-icon" *ngIf="!editingSession || editingSession.id !== session.id" (click)="startEditNotes(session)">
                    <lucide-icon name="edit-2" size="14"></lucide-icon> Edit Notes
                  </button>
                </div>
              </div>
              <p *ngIf="sessions.length === 0" class="text-muted">No sessions recorded yet.</p>
            </div>
          </section>
        </div>

        <!-- Sidebar Column -->
        <div class="sidebar-column">
          <!-- Goals -->
          <section class="card">
            <div class="section-header">
              <lucide-icon name="target" class="icon-accent"></lucide-icon>
              <h2>Goals</h2>
            </div>
            <ul class="goals-list">
              <li *ngFor="let goal of mentorship.goals">{{ goal }}</li>
            </ul>
            <p *ngIf="!mentorship.goals || mentorship.goals.length === 0" class="text-muted">No goals set.</p>
          </section>
        </div>
      </div>
      
      <!-- Booking Modal -->
      <div class="modal-overlay" *ngIf="showBookingModal">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Book a Session</h2>
            <button class="btn-icon-only" (click)="closeBookingModal()"><lucide-icon name="x"></lucide-icon></button>
          </div>
          
          <div class="slots-list" *ngIf="availableSlots.length > 0">
            <div class="slot-item" *ngFor="let slot of availableSlots" 
                 [class.selected]="selectedSlot?.id === slot.id"
                 (click)="selectedSlot = slot">
              <div class="slot-datetime">
                <strong>{{ slot.date | date }}</strong>
                <span>{{ slot.startTime }} - {{ slot.endTime }}</span>
              </div>
              <div class="slot-topic">{{ slot.topic }}</div>
            </div>
          </div>
          
          <p *ngIf="availableSlots.length === 0" class="text-muted">No available slots at the moment.</p>
          
          <div class="modal-actions" *ngIf="availableSlots.length > 0">
            <button class="btn-primary" [disabled]="!selectedSlot || isBooking" (click)="bookSession()">
              {{ isBooking ? 'Booking...' : 'Confirm Booking' }}
            </button>
          </div>
        </div>
      </div>

    </div>
    
    <ng-template #loadingState>
      <div class="loading-state">
        <p>Loading journey details...</p>
      </div>
    </ng-template>
  `,
  styles: [\`
    :host { display: block; font-family: 'Inter', sans-serif; background: #f8fafc; min-height: 100vh; padding: 24px; color: #1e293b; }
    .journey-container { max-width: 1200px; margin: 0 auto; }
    .journey-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .journey-header h1 { margin: 0; color: #0f172a; }
    .subtitle { color: #64748b; margin: 4px 0 0 0; }
    
    .grid-layout { display: grid; grid-template-columns: 2fr 1fr; gap: 24px; }
    @media (max-width: 768px) { .grid-layout { grid-template-columns: 1fr; } }
    
    .card { background: white; border-radius: 6px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 24px; }
    .section-header { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; }
    .section-header h2 { margin: 0; font-size: 18px; color: #0f172a; }
    .icon-accent { color: #0d9488; }
    
    /* Progress */
    .progress-container { margin-bottom: 20px; }
    .progress-bar-bg { background: #e2e8f0; height: 8px; border-radius: 4px; overflow: hidden; margin-bottom: 8px; }
    .progress-bar-fill { background: #0d9488; height: 100%; transition: width 0.3s ease; }
    .progress-text { margin: 0; font-size: 14px; color: #64748b; font-weight: 500; text-align: right; }
    
    /* Checkboxes */
    .milestones-list { display: flex; flex-direction: column; gap: 12px; }
    .checkbox-container { display: flex; align-items: center; cursor: pointer; position: relative; padding-left: 28px; user-select: none; }
    .checkbox-container input { position: absolute; opacity: 0; cursor: pointer; height: 0; width: 0; }
    .checkmark { position: absolute; top: 0; left: 0; height: 18px; width: 18px; background-color: white; border: 1px solid #cbd5e1; border-radius: 4px; }
    .checkbox-container:hover input ~ .checkmark { background-color: #f1f5f9; }
    .checkbox-container input:checked ~ .checkmark { background-color: #0d9488; border-color: #0d9488; }
    .checkmark:after { content: ""; position: absolute; display: none; }
    .checkbox-container input:checked ~ .checkmark:after { display: block; }
    .checkbox-container .checkmark:after { left: 6px; top: 2px; width: 4px; height: 10px; border: solid white; border-width: 0 2px 2px 0; transform: rotate(45deg); }
    .milestone-title.completed { text-decoration: line-through; color: #94a3b8; }
    
    /* Sessions */
    .sessions-list { display: flex; flex-direction: column; gap: 16px; }
    .session-item { border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; }
    .session-date { display: flex; justify-content: space-between; margin-bottom: 8px; }
    .status-badge { padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 600; }
    .status-badge.upcoming { background: #e0f2fe; color: #0369a1; }
    .status-badge.completed { background: #dcfce7; color: #166534; }
    .session-notes p { color: #475569; font-size: 14px; margin-bottom: 8px; white-space: pre-line; }
    .edit-notes-form textarea { width: 100%; height: 80px; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px; resize: vertical; margin-bottom: 8px; font-family: inherit; }
    .form-actions { display: flex; gap: 8px; justify-content: flex-end; }
    
    /* Buttons */
    .btn-primary { background: #0d9488; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-weight: 500; }
    .btn-primary:hover { background: #0f766e; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-secondary { background: white; color: #475569; border: 1px solid #cbd5e1; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 500; }
    .btn-small { padding: 4px 12px; font-size: 12px; }
    .btn-icon { background: none; border: none; color: #0d9488; cursor: pointer; display: flex; align-items: center; gap: 4px; font-size: 14px; padding: 0; }
    .btn-icon-only { background: none; border: none; cursor: pointer; color: #64748b; padding: 4px; }
    
    /* Lists */
    .goals-list { padding-left: 20px; color: #475569; margin: 0; }
    .goals-list li { margin-bottom: 8px; }
    .text-muted { color: #94a3b8; font-style: italic; }
    
    /* Modal */
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 100; }
    .modal-content { background: white; padding: 24px; border-radius: 6px; width: 450px; max-width: 90vw; max-height: 80vh; overflow-y: auto; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .modal-header h2 { margin: 0; }
    .slots-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; }
    .slot-item { border: 1px solid #e2e8f0; padding: 12px; border-radius: 6px; cursor: pointer; transition: all 0.2s; }
    .slot-item:hover { border-color: #0d9488; }
    .slot-item.selected { border-color: #0d9488; background: #f0fdfa; }
    .slot-datetime { display: flex; justify-content: space-between; margin-bottom: 4px; }
    .slot-topic { color: #64748b; font-size: 14px; }
    .modal-actions { display: flex; justify-content: flex-end; }
    
    .loading-state { text-align: center; padding: 48px; color: #64748b; }
  \`]
})
export class JourneyComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private mentorshipService = inject(MentorshipService);
  private sessionService = inject(SessionService);

  mentorshipId!: string;
  mentorship!: Mentorship;
  milestones: Milestone[] = [];
  sessions: Session[] = [];
  
  // Modals and Edit States
  showBookingModal = false;
  availableSlots: OfficeHourSlot[] = [];
  selectedSlot: OfficeHourSlot | null = null;
  isBooking = false;

  editingSession: Session | null = null;
  editingNotes = '';

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.mentorshipId = id;
      this.loadData();
    }
  }

  loadData() {
    this.mentorshipService.getMentorship(this.mentorshipId).subscribe(m => this.mentorship = m);
    this.mentorshipService.getMilestones(this.mentorshipId).subscribe(ms => this.milestones = ms);
    this.loadSessions();
  }

  loadSessions() {
    this.sessionService.getSessions(this.mentorshipId).subscribe(s => this.sessions = s);
  }

  get progressPercentage(): number {
    if (!this.milestones.length) return 0;
    const completed = this.milestones.filter(m => m.completed).length;
    return (completed / this.milestones.length) * 100;
  }

  toggleMilestone(m: Milestone) {
    const newVal = !m.completed;
    m.completed = newVal;
    this.mentorshipService.updateMilestone(this.mentorshipId, m.id, newVal).subscribe();
  }

  startEditNotes(session: Session) {
    this.editingSession = session;
    this.editingNotes = session.notes || '';
  }

  cancelEditNotes() {
    this.editingSession = null;
  }

  saveNotes() {
    if (this.editingSession) {
      this.sessionService.updateSessionNotes(this.editingSession.id, this.editingNotes).subscribe(() => {
        this.loadSessions();
        this.editingSession = null;
      });
    }
  }

  openBookingModal() {
    this.showBookingModal = true;
    this.selectedSlot = null;
    this.sessionService.getOfficeHours(this.mentorship.mentorId).subscribe(slots => {
      this.availableSlots = slots.filter(s => !s.isBooked);
    });
  }

  closeBookingModal() {
    this.showBookingModal = false;
  }

  bookSession() {
    if (this.selectedSlot) {
      this.isBooking = true;
      this.sessionService.bookSession(this.mentorshipId, this.selectedSlot.id).subscribe(() => {
        this.isBooking = false;
        this.closeBookingModal();
        this.loadSessions();
      });
    }
  }
}
