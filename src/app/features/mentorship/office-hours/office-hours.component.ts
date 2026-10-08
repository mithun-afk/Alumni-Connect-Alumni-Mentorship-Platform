import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SessionService, OfficeHourSlot } from '../../../../core/services/session.service';
import { LucideAngularModule, Clock, Plus, Trash2 } from 'lucide-angular';

@Component({
  selector: 'app-office-hours',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="office-hours-container">
      <header class="page-header">
        <h1>Office Hours</h1>
        <p>Manage your availability for mentoring sessions</p>
      </header>

      <div class="content-grid">
        <!-- Add Slot Form -->
        <div class="card add-form">
          <h2>Add New Availability</h2>
          
          <div class="form-group">
            <label>Date</label>
            <input type="date" [(ngModel)]="newSlot.date" />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Start Time</label>
              <input type="time" [(ngModel)]="newSlot.startTime" />
            </div>
            <div class="form-group">
              <label>End Time</label>
              <input type="time" [(ngModel)]="newSlot.endTime" />
            </div>
          </div>

          <div class="form-group">
            <label>Topic / Focus Area</label>
            <input type="text" [(ngModel)]="newSlot.topic" placeholder="e.g., Resume Review, Mock Interview" />
          </div>

          <button class="btn-primary" (click)="addSlot()" [disabled]="isSubmitting || !isFormValid()">
            <lucide-icon name="plus" size="16"></lucide-icon>
            {{ isSubmitting ? 'Adding...' : 'Add Slot' }}
          </button>
        </div>

        <!-- Listed Slots -->
        <div class="card slots-list">
          <h2>Your Upcoming Slots</h2>
          
          <div class="loading-state" *ngIf="loading">
            <p>Loading slots...</p>
          </div>

          <div class="slot-items" *ngIf="!loading && slots.length > 0">
            <div class="slot-item" *ngFor="let slot of slots">
              <div class="slot-info">
                <div class="slot-datetime">
                  <lucide-icon name="clock" size="14" class="text-muted"></lucide-icon>
                  <strong>{{ slot.date | date }}</strong>
                  <span>{{ slot.startTime }} - {{ slot.endTime }}</span>
                </div>
                <div class="slot-topic">{{ slot.topic }}</div>
              </div>
              <div class="slot-status">
                <span class="badge" [class.booked]="slot.isBooked">{{ slot.isBooked ? 'Booked' : 'Available' }}</span>
              </div>
            </div>
          </div>

          <div class="empty-state" *ngIf="!loading && slots.length === 0">
            <p>You haven't set up any office hour slots yet.</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [\`
    :host { display: block; font-family: 'Inter', sans-serif; background: #f8fafc; min-height: 100vh; padding: 24px; color: #1e293b; }
    .office-hours-container { max-width: 1000px; margin: 0 auto; }
    h1 { color: #0f172a; margin-bottom: 8px; }
    p { color: #64748b; margin-top: 0; }
    
    .content-grid { display: grid; grid-template-columns: 1fr 2fr; gap: 24px; margin-top: 24px; }
    @media (max-width: 768px) { .content-grid { grid-template-columns: 1fr; } }
    
    .card { background: white; border-radius: 6px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .card h2 { margin-top: 0; margin-bottom: 20px; font-size: 18px; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; }
    
    /* Form */
    .form-group { margin-bottom: 16px; }
    .form-row { display: flex; gap: 16px; }
    .form-row .form-group { flex: 1; }
    label { display: block; font-size: 14px; font-weight: 500; color: #475569; margin-bottom: 6px; }
    input { width: 100%; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; outline: none; font-family: inherit; box-sizing: border-box; }
    input:focus { border-color: #0d9488; }
    
    .btn-primary { background: #0d9488; color: white; border: none; padding: 10px 16px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; font-weight: 500; width: 100%; margin-top: 24px; }
    .btn-primary:hover { background: #0f766e; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    
    /* Slots */
    .slot-items { display: flex; flex-direction: column; gap: 12px; }
    .slot-item { border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; display: flex; justify-content: space-between; align-items: center; }
    .slot-datetime { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
    .text-muted { color: #94a3b8; }
    .slot-topic { color: #64748b; font-size: 14px; }
    
    .badge { padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 600; background: #e2e8f0; color: #475569; }
    .badge.booked { background: #ccfbf1; color: #115e59; }
    
    .loading-state, .empty-state { text-align: center; padding: 48px; color: #64748b; font-style: italic; }
  \`]
})
export class OfficeHoursComponent implements OnInit {
  private sessionService = inject(SessionService);

  slots: OfficeHourSlot[] = [];
  loading = true;
  isSubmitting = false;

  newSlot: Partial<OfficeHourSlot> = {
    date: '',
    startTime: '',
    endTime: '',
    topic: ''
  };

  ngOnInit() {
    this.loadSlots();
  }

  loadSlots() {
    this.loading = true;
    this.sessionService.getOfficeHours().subscribe({
      next: (data) => {
        this.slots = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  isFormValid(): boolean {
    return !!(this.newSlot.date && this.newSlot.startTime && this.newSlot.endTime && this.newSlot.topic);
  }

  addSlot() {
    if (this.isFormValid()) {
      this.isSubmitting = true;
      this.sessionService.addOfficeHourSlot(this.newSlot).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.newSlot = { date: '', startTime: '', endTime: '', topic: '' };
          this.loadSlots();
        },
        error: () => {
          this.isSubmitting = false;
          alert('Failed to add slot');
        }
      });
    }
  }
}
