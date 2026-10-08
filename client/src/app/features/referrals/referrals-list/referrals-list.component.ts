import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { ReferralService } from '../../../core/services/referral.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-referrals-list',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="page">
      <h1 class="page-title">Referral Tracker</h1>
      <div class="loading-state" *ngIf="loading"><div class="spinner"></div><p>Loading...</p></div>
      <div class="error-state" *ngIf="err"><p>{{err}}</p></div>
      <div class="empty-state" *ngIf="!loading&&!err&&refs.length===0"><p>No referral requests yet.</p></div>
      <div style="display:flex;flex-direction:column;gap:16px" *ngIf="!loading">
        <div class="card" *ngFor="let r of refs">
          <div style="display:flex;justify-content:space-between;margin-bottom:12px">
            <div><h3>{{r.company}} — {{r.role}}</h3><p style="font-size:.85rem;color:#5B6475;margin-top:4px">{{isAlumni?getStudentName(r):getAlumniName(r)}}</p></div>
          </div>
          <div style="display:flex;margin:16px 0">
            <div *ngFor="let s of steps;let i=index" style="flex:1;display:flex;flex-direction:column;align-items:center;position:relative">
              <div *ngIf="i<steps.length-1" style="position:absolute;top:8px;left:50%;width:100%;height:2px" [style.background]="isStepDone(r.status,s.key)?'#2F7F79':'#E2E4E8'"></div>
              <div style="width:18px;height:18px;border-radius:50%;border:2px solid;z-index:1" [style.border-color]="isActive(r.status,s.key)||isStepDone(r.status,s.key)?'#2F7F79':'#E2E4E8'" [style.background]="isActive(r.status,s.key)||isStepDone(r.status,s.key)?'#2F7F79':'#fff'"></div>
              <div style="font-size:.65rem;margin-top:6px;text-align:center" [style.color]="isActive(r.status,s.key)?'#2F7F79':'#5B6475'"><strong *ngIf="isActive(r.status,s.key)">{{s.label}}</strong><span *ngIf="!isActive(r.status,s.key)">{{s.label}}</span></div>
            </div>
          </div>
          <p style="color:#5B6475;font-size:.875rem;font-style:italic">"{{r.message}}"</p>
          <div style="display:flex;gap:8px;margin-top:12px" *ngIf="isAlumni&&r.status==='requested'">
            <button class="btn btn-primary" (click)="update(r._id,'reviewed')">Mark Reviewed</button>
            <button class="btn btn-secondary" (click)="update(r._id,'referred')">Mark Referred</button>
          </div>
          <div style="display:flex;gap:8px;margin-top:12px" *ngIf="isAlumni&&r.status==='referred'">
            <button class="btn btn-primary" (click)="update(r._id,'interview')">Interview</button>
            <button class="btn btn-primary" (click)="update(r._id,'selected')">Selected</button>
            <button class="btn btn-secondary" (click)="update(r._id,'rejected')">Rejected</button>
          </div>
        </div>
      </div>
    </div>`,
  styles: [`.page{padding:24px}`]
})
export class ReferralsListComponent implements OnInit {
  private svc = inject(ReferralService);
  private auth = inject(AuthService);
  refs: any[] = []; loading = true; err = '';
  isAlumni = this.auth.currentUserValue?.role === 'alumni';
  steps = [{key:'requested',label:'Requested'},{key:'reviewed',label:'Reviewed'},{key:'referred',label:'Referred'},{key:'outcome',label:'Outcome'}];
  ngOnInit() { this.load(); }
  load() { this.loading=true; this.err=''; this.svc.getReferrals().subscribe({next:(r:any)=>{this.refs=r.data||[];this.loading=false;},error:()=>{this.err='Failed to load.';this.loading=false;}}); }
  update(id:string,status:string) { this.svc.updateStatus(id,status).subscribe({next:()=>this.load()}); }
  isStepDone(status:string,key:string):boolean{
    const out=['interview','selected','rejected','withdrawn'];
    const cur=out.includes(status)?'outcome':status;
    return this.steps.findIndex(s=>s.key===key)<this.steps.findIndex(s=>s.key===cur);
  }
  isActive(status:string,key:string):boolean{
    const out=['interview','selected','rejected','withdrawn'];
    const cur=out.includes(status)?'outcome':status;
    return cur===key;
  }
  getStudentName(r:any):string{return r.student?`${r.student.firstName||''} ${r.student.lastName||''}`.trim():'Student';}
  getAlumniName(r:any):string{return r.alumni?`${r.alumni.firstName||''} ${r.alumni.lastName||''}`.trim():'Alumni';}
}
