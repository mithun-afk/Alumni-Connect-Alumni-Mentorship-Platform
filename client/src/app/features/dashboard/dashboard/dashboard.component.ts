import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { LucideAngularModule, Award, Users, Calendar, Briefcase, TrendingUp } from 'lucide-angular';
import { AuthService } from '../../../core/services/auth.service';

interface ChartDataItem {
  label: string;
  value: number;
}

interface DashboardStats {
  totalAlumni: number;
  activeMentorships: number;
  upcomingEvents: number;
  openOpportunities: number;
  alumniImpactScore?: number;
  chartData?: { data: ChartDataItem[] };
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  loading = true;
  lucideIcons = { Award, Users, Calendar, Briefcase, TrendingUp };
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  user$ = this.authService.currentUser$;

  chartData: ChartDataItem[] = [];

  ngOnInit(): void {
    const role = this.authService.currentUserValue?.role || 'alumni';
    this.http.get<{success: boolean, data: DashboardStats}>(`${environment.apiUrl}/dashboard/stats?role=${role}`)
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.stats = res.data;
            this.chartData = res.data.chartData?.data || [];
          }
          this.loading = false;
        },
        error: () => {
          this.stats = null;
          this.loading = false;
        }
      });
  }

  get isContributor(): boolean {
    return this.stats?.alumniImpactScore ? this.stats.alumniImpactScore > 10 : false;
  }
}
