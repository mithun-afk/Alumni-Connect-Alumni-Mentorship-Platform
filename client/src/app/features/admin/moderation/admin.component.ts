import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { LucideAngularModule, CheckCircle, XCircle, Trash2 } from 'lucide-angular';

export interface ModerationItem {
  id: string;
  type: 'mentorship' | 'opportunity' | 'event';
  title: string;
  status: 'pending' | 'approved' | 'suspended' | 'deleted';
  submittedBy: string;
  date: string;
}

@Component({
  selector: 'app-moderation',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class ModerationComponent implements OnInit {
  pendingItems: ModerationItem[] = [];
  lucideIcons = { CheckCircle, XCircle, Trash2 };
  private adminService = inject(AdminService);

  ngOnInit(): void {
    this.fetchItems();
  }

  fetchItems(): void {
    this.adminService.getPendingModerationItems().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.pendingItems = res.data;
        }
      },
      error: () => {
        this.pendingItems = [
          { id: '1', type: 'mentorship', title: 'Data Science Mentoring', status: 'pending', submittedBy: 'Alice', date: '2023-10-05' },
          { id: '2', type: 'event', title: 'Tech Talk', status: 'pending', submittedBy: 'Bob', date: '2023-10-06' }
        ];
      }
    });
  }

  onModerate(item: ModerationItem, action: 'approve' | 'suspend' | 'delete'): void {
    this.adminService.moderateItem(item.id, action, item.type).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.fetchItems();
        }
      },
      error: () => {
        // Optimistic UI update for demo
        this.pendingItems = this.pendingItems.filter(i => i.id !== item.id);
      }
    });
  }
}

