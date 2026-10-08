import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OpportunityService } from '../../../core/services/opportunity.service';
import { Opportunity } from '../../../core/models/phase3.models';

@Component({
  selector: 'app-opportunities-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="opportunities-container">
      <header class="header">
        <h1>Opportunities</h1>
        <button class="btn-primary" (click)="showPostModal = true">Post Opportunity</button>
      </header>
      
      <div class="opportunity-board">
        @for(opp of opportunities; track opp.id) {
          <div class="card">
            <h3>{{opp.title}}</h3>
            <div class="details">
              <span>{{opp.company}}</span>
              <span>{{opp.location}}</span>
              <span class="badge">{{opp.type}}</span>
            </div>
            <p>{{opp.description}}</p>
            <button class="btn-outline">Apply</button>
          </div>
        } @empty {
          <p>No opportunities available.</p>
        }
      </div>
    </div>
  `,
  styles: [`
    .opportunities-container {
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
    .btn-outline {
      background-color: transparent;
      color: var(--navy, #000080);
      border: 1px solid var(--navy, #000080);
      padding: 6px 12px;
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
    .details {
      display: flex;
      gap: 16px;
      margin: 8px 0;
      color: var(--text-muted, #666);
    }
    .badge {
      background-color: var(--surface-alt, #f0f0f0);
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 12px;
    }
  `]
})
export class OpportunitiesListComponent implements OnInit {
  opportunities: Opportunity[] = [];
  showPostModal = false;

  constructor(private opportunityService: OpportunityService) {}

  ngOnInit() {
    this.opportunityService.getOpportunities().subscribe(res => {
      if (res.success) {
        this.opportunities = res.data.items;
      }
    });
  }
}
