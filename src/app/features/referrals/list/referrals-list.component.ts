import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReferralService } from '../../../core/services/referral.service';
import { Referral } from '../../../core/models/phase3.models';

@Component({
  selector: 'app-referrals-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="referrals-container">
      <header class="header">
        <h1>Referral Tracker</h1>
        <button class="btn-primary" (click)="showRequestModal = true">Request Referral</button>
      </header>

      <div class="referral-list">
        @for(ref of referrals; track ref.id) {
          <div class="card">
            <div class="status-tracker">
              <div class="step" [class.active]="true">Requested</div>
              <div class="step" [class.active]="ref.status === 'Reviewed' || ref.status === 'Referred' || ref.status === 'Outcome'">Reviewed</div>
              <div class="step" [class.active]="ref.status === 'Referred' || ref.status === 'Outcome'">Referred</div>
              <div class="step" [class.active]="ref.status === 'Outcome'">Outcome</div>
            </div>
            <p>Notes: {{ref.notes}}</p>
          </div>
        } @empty {
          <p>No referrals found.</p>
        }
      </div>
    </div>
  `,
  styles: [`
    .referrals-container {
      padding: 16px;
      font-family: 'Inter', sans-serif;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    .btn-primary {
      background-color: var(--teal, #008080);
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
    }
    .card {
      background-color: var(--surface, #ffffff);
      padding: 16px;
      border-radius: 6px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      margin-bottom: 16px;
    }
    .status-tracker {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
    }
    .step {
      flex: 1;
      text-align: center;
      padding: 8px;
      background-color: #eee;
      border-radius: 6px;
      font-size: 14px;
    }
    .step.active {
      background-color: var(--teal, #008080);
      color: white;
    }
  `]
})
export class ReferralsListComponent implements OnInit {
  referrals: Referral[] = [];
  showRequestModal = false;

  constructor(private referralService: ReferralService) {}

  ngOnInit() {
    this.referralService.getReferrals().subscribe(res => {
      if (res.success) {
        this.referrals = res.data.items;
      }
    });
  }
}
