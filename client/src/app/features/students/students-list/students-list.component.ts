import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { StudentService } from '../../../core/services/student.service';

@Component({
  selector: 'app-students-list',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1 class="page-title">Find Students</h1>
        <p class="page-subtitle">Connect with current students in the network.</p>
      </div>

      <div class="filters-card card">
        <div class="filter-group">
          <lucide-icon name="search" size="18" class="icon-muted"></lucide-icon>
          <input type="text" placeholder="Search by department..." [(ngModel)]="filters.department" (input)="applyFilters()" />
        </div>
        <div class="filter-group">
          <lucide-icon name="filter" size="18" class="icon-muted"></lucide-icon>
          <select [(ngModel)]="filters.batch" (change)="applyFilters()">
            <option value="">All Batches</option>
            <option value="2024">2024</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
            <option value="2027">2027</option>
          </select>
        </div>
      </div>

      <div class="loading-state" *ngIf="loading">
        <div class="spinner"></div>
        <p>Loading students...</p>
      </div>

      <div class="error-state" *ngIf="loadError && !loading">
        <p>{{ loadError }}</p>
      </div>

      <div class="empty-state" *ngIf="!loading && !loadError && filteredStudents.length === 0">
        <p>No students found matching your criteria.</p>
      </div>

      <div class="mentors-grid" *ngIf="!loading && filteredStudents.length > 0">
        <div class="mentor-card card" *ngFor="let student of filteredStudents">
          <div class="mentor-header">
            <div class="avatar">{{ student.name.charAt(0).toUpperCase() }}</div>
            <div class="mentor-info">
              <h3>{{ student.name }}</h3>
              <p class="role">{{ student.department }} {{ student.batch ? '&apos;' + student.batch.slice(-2) : '' }}</p>
            </div>
          </div>
          <p class="bio">{{ student.bio || 'No bio provided.' }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    $navy: #1F2A44; $accent: #2F7F79; $text: #5B6475; $border: #E2E4E8; $bg: #F8F9FA;
    .page { padding: 24px; max-width: 1200px; margin: 0 auto; }
    .page-header { margin-bottom: 24px; }
    .page-title { font-size: 1.75rem; color: $navy; margin-bottom: 8px; font-weight: 700; }
    .page-subtitle { color: $text; }
    .filters-card { display: flex; gap: 16px; padding: 16px; margin-bottom: 24px; flex-wrap: wrap; }
    .filter-group { display: flex; align-items: center; gap: 8px; flex: 1; min-width: 200px; border: 1px solid $border; border-radius: 6px; padding: 0 12px; background: #fff; }
    .filter-group input, .filter-group select { border: none; padding: 10px 0; width: 100%; outline: none; background: transparent; color: $navy; }
    .icon-muted { color: #9CA3AF; }
    .mentors-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }
    .mentor-card { padding: 20px; display: flex; flex-direction: column; height: 100%; }
    .mentor-header { display: flex; gap: 16px; align-items: flex-start; margin-bottom: 16px; }
    .avatar { width: 56px; height: 56px; border-radius: 50%; background-color: $accent; color: white; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 600; flex-shrink: 0; }
    .mentor-info h3 { margin: 0 0 4px 0; color: $navy; font-size: 1.1rem; }
    .role { margin: 0; color: $text; font-size: 0.9rem; }
    .bio { margin: 0 0 20px 0; color: $text; font-size: 0.9rem; line-height: 1.5; flex-grow: 1; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
  `]
})
export class StudentsListComponent implements OnInit {
  students: any[] = [];
  filteredStudents: any[] = [];
  filters = { department: '', batch: '' };
  loading = true;
  loadError = '';

  constructor(private studentService: StudentService) {}

  ngOnInit() { this.loadStudents(); }

  loadStudents() {
    this.loading = true; this.loadError = '';
    this.studentService.getStudents(this.filters).subscribe({
      next: (res: any) => { this.students = res.data || []; this.applyFilters(); this.loading = false; },
      error: () => { this.loadError = 'Failed to load students.'; this.loading = false; }
    });
  }

  applyFilters() {
    this.filteredStudents = this.students.filter(s =>
      (!this.filters.department || s.department.toLowerCase().includes(this.filters.department.toLowerCase())) &&
      (!this.filters.batch || s.batch?.includes(this.filters.batch))
    );
  }
}
