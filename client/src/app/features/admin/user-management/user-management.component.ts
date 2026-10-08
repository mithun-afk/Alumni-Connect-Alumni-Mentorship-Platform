import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { User } from '../../../core/models/user.model';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {
  private adminService = inject(AdminService);
  
  users: User[] = [];
  total = 0;
  isLoading = true;
  
  filters = {
    role: '',
    search: '',
    page: 1,
    limit: 10
  };

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.isLoading = true;
    this.adminService.getAllUsers(this.filters).subscribe({
      next: (res) => {
        if (res.success) {
          this.users = res.data;
          this.total = res.total || res.data.length; // fallback
        }
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  onFilterChange() {
    this.filters.page = 1;
    this.loadUsers();
  }

  toggleStatus(user: User) {
    if (confirm(`Are you sure you want to ${user.isActive ? 'suspend' : 'activate'} this user?`)) {
      // In a real app, you'd call a dedicated endpoint like PATCH /admin/users/:id/status
      // Here we mock the local state change for UI presentation since we don't have the explicit endpoint for general user suspension in the prompt, only alumni
      user.isActive = !user.isActive;
    }
  }

  getRoleBadgeClass(role: string) {
    switch(role) {
      case 'admin': return 'badge-error';
      case 'alumni': return 'badge-info';
      default: return 'badge-success';
    }
  }
}

