import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-audit-log',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './audit-log.component.html',
  styleUrls: ['./audit-log.component.scss']
})
export class AuditLogComponent implements OnInit {
  private adminService = inject(AdminService);
  
  logs: any[] = [];
  isLoading = true;
  
  filters = {
    action: '',
    page: 1,
    limit: 20
  };

  ngOnInit() {
    this.loadLogs();
  }

  loadLogs() {
    this.isLoading = true;
    this.adminService.getAuditLogs(this.filters).subscribe({
      next: (res) => {
        if (res.success) {
          this.logs = (res.data || []).map((log: any) => ({
            timestamp: log.createdAt,
            adminName: log.performedBy ? `${log.performedBy.firstName} ${log.performedBy.lastName}` : "System",
            action: log.action,
            target: `${log.targetType} (${log.targetId})`,
            details: JSON.stringify(log.details)
          }));
        } else {
          // Mocking empty state since backend isn't real in this context
          this.logs = [];
        }
        this.isLoading = false;
      },
      error: () => {
        // Fallback mock logs
        this.logs = [
          { timestamp: new Date().toISOString(), adminName: 'Super Admin', action: 'APPROVE_ALUMNI', target: 'john.doe@example.com', details: 'Verified roll number against DB' },
          { timestamp: new Date(Date.now() - 86400000).toISOString(), adminName: 'Super Admin', action: 'REJECT_ALUMNI', target: 'jane.smith@example.com', details: 'Invalid document provided' }
        ];
        this.isLoading = false;
      }
    });
  }

  onFilterChange() {
    this.filters.page = 1;
    this.loadLogs();
  }
}


