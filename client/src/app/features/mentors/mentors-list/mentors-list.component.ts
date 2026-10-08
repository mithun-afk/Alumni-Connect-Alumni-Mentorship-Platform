import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { MentorService } from '../../../core/services/mentor.service';
import { MentorshipService } from '../../../core/services/mentorship.service';
import { Mentor } from '../../../core/models/mentorship.model';

@Component({
  selector: 'app-mentors-list',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './mentors-list.component.html',
  styleUrls: ['./mentors-list.component.scss']
})
export class MentorsListComponent implements OnInit {
  mentors: Mentor[] = [];
  filteredMentors: Mentor[] = [];
  filters = { department: '', domain: '', batch: '', company: '' };
  showModal = false;
  selectedMentor: Mentor | null = null;
  requestMessage = '';
  loading = true;
  submitting = false;
  submitError = '';
  submitSuccess = '';
  loadError = '';

  constructor(private mentorService: MentorService, private mentorshipService: MentorshipService) {}

  ngOnInit() { this.loadMentors(); }

  loadMentors() {
    this.loading = true; this.loadError = '';
    this.mentorService.getMentors(this.filters).subscribe({
      next: (res: any) => { this.mentors = res.data || []; this.applyFilters(); this.loading = false; },
      error: () => { this.loadError = 'Failed to load mentors.'; this.loading = false; }
    });
  }

  applyFilters() {
    this.filteredMentors = this.mentors.filter(m =>
      (!this.filters.department || m.department.toLowerCase().includes(this.filters.department.toLowerCase())) &&
      (!this.filters.batch || m.batch?.includes(this.filters.batch)) &&
      (!this.filters.company || m.company.toLowerCase().includes(this.filters.company.toLowerCase()))
    );
  }

  openRequestModal(mentor: Mentor) {
    this.selectedMentor = mentor; this.requestMessage = '';
    this.submitError = ''; this.submitSuccess = ''; this.showModal = true;
  }

  closeModal() { this.showModal = false; this.selectedMentor = null; }

  submitRequest() {
    if (!this.selectedMentor || !this.requestMessage.trim()) return;
    this.submitting = true; this.submitError = '';
    // CRITICAL: use userId (User _id), NOT id (Profile _id)
    this.mentorshipService.requestMentorship(this.selectedMentor.userId, this.requestMessage).subscribe({
      next: () => { this.submitSuccess = 'Request sent successfully!'; this.submitting = false; setTimeout(() => this.closeModal(), 1500); },
      error: (err) => { this.submitError = err.message || 'Failed to send request.'; this.submitting = false; }
    });
  }

  getScoreColor(score: number): string {
    if (score >= 80) return 'score-high';
    if (score >= 50) return 'score-mid';
    return 'score-low';
  }
}


