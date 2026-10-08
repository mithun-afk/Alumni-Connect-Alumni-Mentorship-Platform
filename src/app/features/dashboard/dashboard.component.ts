import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService, DashboardStats } from '../../core/services/dashboard.service';
import { LucideAngularModule, Award, Users, Calendar, Briefcase, TrendingUp } from 'lucide-angular';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  role: string = 'alumni'; // Mocked role for demo, normally from auth service
  lucideIcons = { Award, Users, Calendar, Briefcase, TrendingUp };

  // For plain CSS chart
  chartData = [
    { label: 'Jan', value: 30 },
    { label: 'Feb', value: 50 },
    { label: 'Mar', value: 40 },
    { label: 'Apr', value: 70 },
    { label: 'May', value: 60 },
    { label: 'Jun', value: 90 }
  ];

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.dashboardService.getStats(this.role).subscribe(res => {
      if (res.success) {
        this.stats = res.data;
      }
    });
  }

  get isContributor(): boolean {
    return this.stats?.alumniImpactScore ? this.stats.alumniImpactScore > 10 : false;
  }
}
