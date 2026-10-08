import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MentorshipService } from '../../../core/services/mentorship.service';
import { Mentorship } from '../../../core/models/mentorship.model';

@Component({
  selector: 'app-mentorship-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './mentorship-list.component.html',
  styleUrls: ['./mentorship-list.component.scss']
})
export class MentorshipListComponent implements OnInit {
  mentorships: Mentorship[] = [];
  loading = true;
  error = false;

  constructor(private mentorshipService: MentorshipService) {}

  ngOnInit() {
    this.mentorshipService.getActiveMentorships().subscribe({
      next: (res: any) => {
        this.mentorships = res.data || [];
        this.loading = false;
      },
      error: () => {
        this.error = true;
        this.loading = false;
      }
    });
  }
}
