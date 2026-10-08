import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MentorshipService } from '../../../core/services/mentorship.service';
import { SessionService } from '../../../core/services/session.service';
import { Mentorship, Milestone, Session, OfficeHourSlot } from '../../../core/models/mentorship.model';

@Component({
  selector: 'app-journey',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './journey.component.html',
  styleUrls: ['./journey.component.scss']
})
export class JourneyComponent implements OnInit {
  mentorshipId!: string;
  mentorship!: Mentorship;
  milestones: Milestone[] = [];
  sessions: any[] = [];
  availableSlots: any[] = [];

  loading = true;
  showBookingModal = false;
  selectedSlotId = '';

  constructor(
    private route: ActivatedRoute,
    private mentorshipService: MentorshipService,
    private sessionService: SessionService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.mentorshipId = params.get('id') || '';
      if (this.mentorshipId) this.loadData();
    });
  }

  loadData() {
    this.loading = true;
    this.mentorshipService.getMentorship(this.mentorshipId).subscribe({
      next: (m: any) => {
        this.mentorship = m.data;
        this.milestones = this.mentorship.milestones || [];
        this.sessionService.getSessions(this.mentorshipId).subscribe({
          next: (s: any) => { this.sessions = s.data || []; this.loading = false; },
          error: () => { this.loading = false; }
        });
      },
      error: () => { this.loading = false; }
    });
  }

  get progress(): number {
    if (!this.milestones.length) return 0;
    const completed = this.milestones.filter(m => m.isCompleted).length;
    return Math.round((completed / this.milestones.length) * 100);
  }

  toggleMilestone(milestone: Milestone) {
    milestone.isCompleted = !milestone.isCompleted;
    this.mentorshipService.updateMilestones(this.mentorshipId, {
      milestoneId: milestone._id,
      isCompleted: milestone.isCompleted
    }).subscribe(() => this.loadData());
  }

  updateNotes(session: any, notes: string) {
    this.sessionService.updateSession(session._id || session.id, { notes }).subscribe();
  }

  openBookingModal() {
    const mentorId = this.mentorship?.mentor?._id;
    if (!mentorId) return;
    this.sessionService.getOfficeHours(mentorId).subscribe({
      next: (slots: any) => {
        this.availableSlots = (slots.data || []).filter((s: any) => !s.isBooked);
        this.showBookingModal = true;
      }
    });
  }

  closeBookingModal() {
    this.showBookingModal = false;
    this.selectedSlotId = '';
  }

  bookSession() {
    if (!this.selectedSlotId) return;
    this.sessionService.bookSession(this.mentorshipId, this.selectedSlotId).subscribe({
      next: () => { this.closeBookingModal(); this.loadData(); },
      error: (err: any) => { alert(err.message || 'Booking failed'); }
    });
  }
}
