import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { User } from '../../../core/models/user.model';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-alumni-verification',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './alumni-verification.component.html',
  styleUrls: ['./alumni-verification.component.scss']
})
export class AlumniVerificationComponent implements OnInit {
  private adminService = inject(AdminService);
  
  pendingAlumni: User[] = [];
  isLoading = true;
  errorMessage = '';
  successMessage = '';
  
  rejectingId: string | null = null;
  rejectReason = '';
  isProcessing = false;

  ngOnInit() {
    this.loadPending();
  }

  loadPending() {
    this.isLoading = true;
    this.adminService.getPendingAlumni().subscribe({
      next: (res) => {
        if (res.success) {
          this.pendingAlumni = (res.data as any).alumni || res.data || [];
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load pending alumni requests.';
        this.isLoading = false;
      }
    });
  }

  approve(id: string) {
    if (confirm('Are you sure you want to approve this alumni?')) {
      this.isProcessing = true;
      this.adminService.updateAlumniStatus(id, 'verified').subscribe({
        next: () => {
          this.successMessage = 'Alumni approved successfully.';
          this.isProcessing = false;
          this.loadPending();
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: () => {
          this.errorMessage = 'Failed to approve alumni.';
          this.isProcessing = false;
        }
      });
    }
  }

  startReject(id: string) {
    this.rejectingId = id;
    this.rejectReason = '';
  }

  cancelReject() {
    this.rejectingId = null;
    this.rejectReason = '';
  }

  confirmReject(id: string) {
    if (!this.rejectReason.trim()) {
      alert('Please provide a reason for rejection.');
      return;
    }
    
    this.isProcessing = true;
    this.adminService.updateAlumniStatus(id, 'rejected', this.rejectReason).subscribe({
      next: () => {
        this.successMessage = 'Alumni request rejected.';
        this.isProcessing = false;
        this.rejectingId = null;
        this.loadPending();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: () => {
        this.errorMessage = 'Failed to reject alumni.';
        this.isProcessing = false;
      }
    });
  }
}



