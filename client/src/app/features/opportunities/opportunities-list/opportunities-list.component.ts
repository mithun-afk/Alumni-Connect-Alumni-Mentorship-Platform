import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { OpportunityService } from '../../../core/services/opportunity.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-opportunities-list',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="page">
      <div class="page-header"><h1 class="page-title">Opportunities</h1>
        <button class="btn btn-primary" *ngIf="isAlumni" (click)="showForm=!showForm"><lucide-icon name="plus" size="16"></lucide-icon> Post</button>
      </div>
      <div class="card" style="margin-bottom:16px;padding:12px" *ngIf="showForm">
        <h3 style="margin-bottom:12px">Post Opportunity</h3>
        <div class="form-group"><label>Title</label><input [(ngModel)]="form.title" placeholder="Role title"></div>
        <div class="form-group"><label>Company</label><input [(ngModel)]="form.company"></div>
        <div class="form-group"><label>Type</label><select [(ngModel)]="form.type"><option value="job">Job</option><option value="internship">Internship</option><option value="project">Project</option><option value="research">Research</option></select></div>
        <div class="form-group"><label>Description</label><textarea [(ngModel)]="form.description" rows="3"></textarea></div>
        <div class="form-group"><label>Location</label><input [(ngModel)]="form.location"></div>
        <div class="form-group"><label>Application Link</label><input [(ngModel)]="form.applicationLink" placeholder="https://..."></div>
        <div style="display:flex;gap:8px">
          <button class="btn btn-primary" (click)="postOpp()" [disabled]="posting">{{posting?'Posting...':'Post'}}</button>
          <button class="btn btn-secondary" (click)="showForm=false">Cancel</button>
        </div>
        <p style="color:#2D8F5E;margin-top:8px;font-size:.875rem" *ngIf="postOk">Posted!</p>
      </div>
      <div class="card" style="margin-bottom:16px;padding:12px">
        <select [(ngModel)]="filterType" (change)="load()" style="width:auto">
          <option value="">All Types</option><option value="job">Job</option><option value="internship">Internship</option><option value="project">Project</option><option value="research">Research</option>
        </select>
      </div>
      <div class="loading-state" *ngIf="loading"><div class="spinner"></div><p>Loading...</p></div>
      <div class="error-state" *ngIf="err"><p>{{err}}</p></div>
      <div class="empty-state" *ngIf="!loading&&!err&&opps.length===0"><p>No opportunities found.</p></div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px" *ngIf="!loading">
        <div class="card" *ngFor="let o of opps">
          <div style="display:flex;justify-content:space-between;margin-bottom:8px">
            <div><h3 style="margin-bottom:4px">{{o.title}}</h3><p style="color:#5B6475;font-size:.85rem">{{o.company}}</p></div>
            <span class="badge badge-info">{{o.type|titlecase}}</span>
          </div>
          <p style="color:#5B6475;font-size:.875rem;margin-bottom:8px">{{o.description}}</p>
          <p style="color:#5B6475;font-size:.8rem;margin-bottom:12px" *ngIf="o.location">📍 {{o.location}}</p>
          <a *ngIf="o.applicationLink" [href]="o.applicationLink" target="_blank" class="btn btn-primary">Apply</a>
        </div>
      </div>
    </div>`,
  styles: [`.page{padding:24px}.page-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:24px}`]
})
export class OpportunitiesListComponent implements OnInit {
  private svc = inject(OpportunityService);
  private auth = inject(AuthService);
  opps: any[] = []; loading = true; err = ''; filterType = '';
  isAlumni = false; showForm = false; posting = false; postOk = false;
  form = { title: '', company: '', type: 'job', description: '', location: '', applicationLink: '' };
  ngOnInit() { this.isAlumni = this.auth.currentUserValue?.role === 'alumni'; this.load(); }
  load() {
    this.loading = true; this.err = '';
    const p: any = {}; if (this.filterType) p.type = this.filterType;
    this.svc.getOpportunities(p).subscribe({ next: (r: any) => { this.opps = r.data||[]; this.loading=false; }, error: () => { this.err='Failed to load.'; this.loading=false; } });
  }
  postOpp() {
    this.posting = true;
    this.svc.postOpportunity(this.form).subscribe({ next: () => { this.postOk=true; this.posting=false; this.showForm=false; this.load(); }, error: () => { this.posting=false; } });
  }
}
