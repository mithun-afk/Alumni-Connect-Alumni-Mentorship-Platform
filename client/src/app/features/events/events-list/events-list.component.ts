import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { EventService } from '../../../core/services/event.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-events-list',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="page">
      <div class="page-header"><h1 class="page-title">Events</h1>
        <button class="btn btn-primary" *ngIf="isAlumni" (click)="showForm=!showForm"><lucide-icon name="plus" size="16"></lucide-icon> Create Event</button>
      </div>
      <div class="card" style="margin-bottom:16px;padding:16px" *ngIf="showForm">
        <h3 style="margin-bottom:12px">Create Event</h3>
        <div class="form-group"><label>Title</label><input [(ngModel)]="form.title"></div>
        <div class="form-group"><label>Description</label><textarea [(ngModel)]="form.description" rows="3"></textarea></div>
        <div class="form-group"><label>Type</label><select [(ngModel)]="form.type"><option value="webinar">Webinar</option><option value="workshop">Workshop</option><option value="meetup">Meetup</option><option value="ama">AMA</option></select></div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px">
          <div class="form-group"><label>Date</label><input type="date" [(ngModel)]="form.date"></div>
          <div class="form-group"><label>Start</label><input type="time" [(ngModel)]="form.startTime"></div>
          <div class="form-group"><label>End</label><input type="time" [(ngModel)]="form.endTime"></div>
        </div>
        <div class="form-group"><label>Location / Link</label><input [(ngModel)]="form.location"></div>
        <div style="display:flex;gap:8px">
          <button class="btn btn-primary" (click)="createEvent()" [disabled]="creating">{{creating?'Creating...':'Create'}}</button>
          <button class="btn btn-secondary" (click)="showForm=false">Cancel</button>
        </div>
      </div>
      <div class="loading-state" *ngIf="loading"><div class="spinner"></div><p>Loading events...</p></div>
      <div class="error-state" *ngIf="err"><p>{{err}}</p></div>
      <div class="empty-state" *ngIf="!loading&&!err&&events.length===0"><p>No upcoming events.</p></div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px" *ngIf="!loading">
        <div class="card" *ngFor="let ev of events">
          <div style="display:flex;justify-content:space-between;margin-bottom:8px">
            <span class="badge badge-info">{{ev.type|titlecase}}</span>
            <span style="font-size:.85rem;color:#5B6475">{{ev.date|date:'mediumDate'}}</span>
          </div>
          <h3 style="margin-bottom:8px">{{ev.title}}</h3>
          <p style="color:#5B6475;font-size:.875rem;margin-bottom:8px">{{ev.description}}</p>
          <p style="color:#5B6475;font-size:.8rem;margin-bottom:12px">🕐 {{ev.startTime}} – {{ev.endTime}}<span *ngIf="ev.location"> &nbsp;📍 {{ev.location}}</span></p>
          <div style="display:flex;gap:8px">
            <button class="btn btn-primary" (click)="rsvp(ev._id,'going')">Going</button>
            <button class="btn btn-secondary" (click)="rsvp(ev._id,'maybe')">Maybe</button>
          </div>
        </div>
      </div>
    </div>`,
  styles: [`.page{padding:24px}.page-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:24px}`]
})
export class EventsListComponent implements OnInit {
  private svc = inject(EventService);
  private auth = inject(AuthService);
  events: any[] = []; loading = true; err = '';
  isAlumni = false; showForm = false; creating = false;
  form = { title:'', description:'', type:'webinar', date:'', startTime:'', endTime:'', location:'', isVirtual: true };
  ngOnInit() { this.isAlumni = this.auth.currentUserValue?.role==='alumni'; this.load(); }
  load() { this.loading=true; this.err=''; this.svc.getEvents().subscribe({ next:(r:any)=>{this.events=r.data||[];this.loading=false;}, error:()=>{this.err='Failed to load events.';this.loading=false;} }); }
  createEvent() { this.creating=true; this.svc.createEvent(this.form).subscribe({ next:()=>{this.creating=false;this.showForm=false;this.load();}, error:(err: any)=>{this.err = err.error?.errors?.[0]?.msg || err.error?.message || err.message || "Failed to create event";this.creating=false;} }); }
  rsvp(id:string,status:string) { this.svc.rsvp(id,status).subscribe({next:()=>this.load()}); }
}

