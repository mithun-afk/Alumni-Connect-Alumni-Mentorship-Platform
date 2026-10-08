const fs = require('fs');
const path = require('path');

const basePath = 'e:/da/Alumini proj/client/src/app';

const dirs = [
  'core/services',
  'core/models',
  'features/opportunities/opportunities-list',
  'features/opportunities/opportunities-form',
  'features/events/events-list',
  'features/events/events-form',
  'features/referrals/referrals-list',
  'features/messages/messages-view'
];

dirs.forEach(d => fs.mkdirSync(path.join(basePath, d), { recursive: true }));

const files = {
  'core/models/index.ts': 
export interface ApiResponse<T> { success: boolean; data: { items?: T[]; [key: string]: any; } }
export interface Opportunity { _id: string; title: string; company: string; type: string; description: string; postedBy: string; }
export interface Event { _id: string; title: string; date: string; location: string; description: string; hostId: string; }
export interface Referral { _id: string; jobId: string; company: string; status: 'Requested' | 'Reviewed' | 'Referred' | 'Outcome'; requestedBy: string; referredBy?: string; }
export interface Message { _id: string; mentorshipId: string; senderId: string; content: string; createdAt: string; }
,
  'core/services/opportunity.service.ts': 
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, Opportunity } from '../models';

@Injectable({ providedIn: 'root' })
export class OpportunityService {
  private apiUrl = '/api/opportunities';
  constructor(private http: HttpClient) {}
  getOpportunities(): Observable<ApiResponse<Opportunity>> { return this.http.get<ApiResponse<Opportunity>>(this.apiUrl); }
  createOpportunity(data: Partial<Opportunity>): Observable<ApiResponse<Opportunity>> { return this.http.post<ApiResponse<Opportunity>>(this.apiUrl, data); }
}
,
  'core/services/event.service.ts': 
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, Event } from '../models';

@Injectable({ providedIn: 'root' })
export class EventService {
  private apiUrl = '/api/events';
  constructor(private http: HttpClient) {}
  getEvents(): Observable<ApiResponse<Event>> { return this.http.get<ApiResponse<Event>>(this.apiUrl); }
  createEvent(data: Partial<Event>): Observable<ApiResponse<Event>> { return this.http.post<ApiResponse<Event>>(this.apiUrl, data); }
}
,
  'core/services/referral.service.ts': 
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, Referral } from '../models';

@Injectable({ providedIn: 'root' })
export class ReferralService {
  private apiUrl = '/api/referrals';
  constructor(private http: HttpClient) {}
  getReferrals(): Observable<ApiResponse<Referral>> { return this.http.get<ApiResponse<Referral>>(this.apiUrl); }
  requestReferral(data: Partial<Referral>): Observable<ApiResponse<Referral>> { return this.http.post<ApiResponse<Referral>>(this.apiUrl, data); }
}
,
  'core/services/message.service.ts': 
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, Message } from '../models';

@Injectable({ providedIn: 'root' })
export class MessageService {
  private apiUrl = '/api/messages';
  constructor(private http: HttpClient) {}
  getMessages(mentorshipId: string): Observable<ApiResponse<Message>> { return this.http.get<ApiResponse<Message>>(\\/\\); }
  sendMessage(mentorshipId: string, content: string): Observable<ApiResponse<Message>> { return this.http.post<ApiResponse<Message>>(\\/\\, { content }); }
}
,

  'features/opportunities/opportunities-list/opportunities-list.component.ts': 
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OpportunityService } from '../../../core/services/opportunity.service';
import { Opportunity } from '../../../core/models';
import { LucideAngularModule, Briefcase, Building, MapPin } from 'lucide-angular';

@Component({
  selector: 'app-opportunities-list',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './opportunities-list.component.html',
  styleUrls: ['./opportunities-list.component.scss']
})
export class OpportunitiesListComponent implements OnInit {
  opportunities: Opportunity[] = [];
  Briefcase = Briefcase;
  Building = Building;
  MapPin = MapPin;

  constructor(private oppService: OpportunityService) {}

  ngOnInit() {
    this.oppService.getOpportunities().subscribe(res => {
      if (res.success && res.data.items) {
        this.opportunities = res.data.items;
      }
    });
  }
}
,
  'features/opportunities/opportunities-list/opportunities-list.component.html': 
<div class="opportunities-container">
  <div class="header-actions">
    <h2>Opportunities</h2>
    <a routerLink="new" class="btn btn-primary">Post Opportunity</a>
  </div>
  <div class="cards-grid">
    <div class="card" *ngFor="let opp of opportunities">
      <div class="card-header">
        <h3>{{ opp.title }}</h3>
        <span class="badge">{{ opp.type }}</span>
      </div>
      <div class="card-body">
        <p class="company"><lucide-icon [img]="Building"></lucide-icon> {{ opp.company }}</p>
        <p class="desc">{{ opp.description }}</p>
      </div>
      <div class="card-footer">
        <button class="btn btn-outline">Apply Now</button>
      </div>
    </div>
  </div>
</div>
,
  'features/opportunities/opportunities-list/opportunities-list.component.scss': 
.opportunities-container {
  padding: 24px;
}
.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}
.card {
  background: var(--surface);
  border-radius: 6px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.badge {
  background: var(--accent-teal, #008080);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}
.company {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary, #666);
  font-size: 14px;
}
.desc {
  font-size: 14px;
  color: var(--text);
}
.btn {
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
}
.btn-primary { background: var(--navy, #000080); color: white; text-decoration: none; }
.btn-outline { background: transparent; border: 1px solid var(--navy, #000080); color: var(--navy, #000080); }
,

  'features/opportunities/opportunities-form/opportunities-form.component.ts': 
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { OpportunityService } from '../../../core/services/opportunity.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-opportunities-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './opportunities-form.component.html',
  styleUrls: ['./opportunities-form.component.scss']
})
export class OpportunitiesFormComponent {
  form: FormGroup;
  constructor(private fb: FormBuilder, private oppService: OpportunityService, private router: Router) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      company: ['', Validators.required],
      type: ['Full-time', Validators.required],
      description: ['', Validators.required]
    });
  }
  submit() {
    if (this.form.valid) {
      this.oppService.createOpportunity(this.form.value).subscribe(res => {
        if (res.success) this.router.navigate(['/opportunities']);
      });
    }
  }
}
,
  'features/opportunities/opportunities-form/opportunities-form.component.html': 
<div class="form-container">
  <h2>Post Opportunity</h2>
  <form [formGroup]="form" (ngSubmit)="submit()">
    <div class="form-group">
      <label>Title</label>
      <input type="text" formControlName="title" />
    </div>
    <div class="form-group">
      <label>Company</label>
      <input type="text" formControlName="company" />
    </div>
    <div class="form-group">
      <label>Type</label>
      <select formControlName="type">
        <option value="Full-time">Full-time</option>
        <option value="Part-time">Part-time</option>
        <option value="Internship">Internship</option>
      </select>
    </div>
    <div class="form-group">
      <label>Description</label>
      <textarea formControlName="description" rows="4"></textarea>
    </div>
    <button type="submit" [disabled]="form.invalid" class="btn btn-primary">Post</button>
  </form>
</div>
,
  'features/opportunities/opportunities-form/opportunities-form.component.scss': 
.form-container { max-width: 600px; margin: 24px auto; padding: 24px; background: var(--surface); border-radius: 6px; }
.form-group { margin-bottom: 16px; }
label { display: block; margin-bottom: 8px; font-weight: 500; }
input, select, textarea { width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; font-family: 'Inter', sans-serif; }
.btn-primary { background: var(--navy, #000080); color: white; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; }
.btn-primary:disabled { opacity: 0.5; }
,

  'features/events/events-list/events-list.component.ts': 
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EventService } from '../../../core/services/event.service';
import { Event } from '../../../core/models';
import { LucideAngularModule, Calendar, MapPin } from 'lucide-angular';

@Component({
  selector: 'app-events-list',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './events-list.component.html',
  styleUrls: ['./events-list.component.scss']
})
export class EventsListComponent implements OnInit {
  events: Event[] = [];
  Calendar = Calendar;
  MapPin = MapPin;

  constructor(private eventService: EventService) {}

  ngOnInit() {
    this.eventService.getEvents().subscribe(res => {
      if (res.success && res.data.items) {
        this.events = res.data.items;
      }
    });
  }
}
,
  'features/events/events-list/events-list.component.html': 
<div class="events-container">
  <div class="header-actions">
    <h2>Events</h2>
    <a routerLink="new" class="btn btn-primary">Host Event</a>
  </div>
  <div class="cards-grid">
    <div class="card" *ngFor="let ev of events">
      <div class="card-header">
        <h3>{{ ev.title }}</h3>
      </div>
      <div class="card-body">
        <p class="detail"><lucide-icon [img]="Calendar"></lucide-icon> {{ ev.date | date }}</p>
        <p class="detail"><lucide-icon [img]="MapPin"></lucide-icon> {{ ev.location }}</p>
        <p class="desc">{{ ev.description }}</p>
      </div>
      <div class="card-footer">
        <button class="btn btn-outline">RSVP</button>
      </div>
    </div>
  </div>
</div>
,
  'features/events/events-list/events-list.component.scss': 
.events-container { padding: 24px; }
.header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
.card { background: var(--surface); border-radius: 6px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.detail { display: flex; align-items: center; gap: 8px; color: var(--text-secondary, #666); font-size: 14px; margin: 4px 0;}
.desc { margin-top: 12px; font-size: 14px; }
.card-footer { margin-top: 16px; }
.btn { padding: 8px 16px; border-radius: 6px; border: none; cursor: pointer; font-family: 'Inter', sans-serif; text-decoration: none; }
.btn-primary { background: var(--navy, #000080); color: white; }
.btn-outline { background: transparent; border: 1px solid var(--navy, #000080); color: var(--navy, #000080); }
,

  'features/events/events-form/events-form.component.ts': 
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EventService } from '../../../core/services/event.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-events-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './events-form.component.html',
  styleUrls: ['./events-form.component.scss']
})
export class EventsFormComponent {
  form: FormGroup;
  constructor(private fb: FormBuilder, private eventService: EventService, private router: Router) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      date: ['', Validators.required],
      location: ['', Validators.required],
      description: ['', Validators.required]
    });
  }
  submit() {
    if (this.form.valid) {
      this.eventService.createEvent(this.form.value).subscribe(res => {
        if (res.success) this.router.navigate(['/events']);
      });
    }
  }
}
,
  'features/events/events-form/events-form.component.html': 
<div class="form-container">
  <h2>Host Event</h2>
  <form [formGroup]="form" (ngSubmit)="submit()">
    <div class="form-group">
      <label>Title</label>
      <input type="text" formControlName="title" />
    </div>
    <div class="form-group">
      <label>Date</label>
      <input type="date" formControlName="date" />
    </div>
    <div class="form-group">
      <label>Location</label>
      <input type="text" formControlName="location" />
    </div>
    <div class="form-group">
      <label>Description</label>
      <textarea formControlName="description" rows="4"></textarea>
    </div>
    <button type="submit" [disabled]="form.invalid" class="btn btn-primary">Create Event</button>
  </form>
</div>
,
  'features/events/events-form/events-form.component.scss': 
.form-container { max-width: 600px; margin: 24px auto; padding: 24px; background: var(--surface); border-radius: 6px; }
.form-group { margin-bottom: 16px; }
label { display: block; margin-bottom: 8px; font-weight: 500; }
input, textarea { width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; font-family: 'Inter', sans-serif; }
.btn-primary { background: var(--navy, #000080); color: white; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; }
.btn-primary:disabled { opacity: 0.5; }
,

  'features/referrals/referrals-list/referrals-list.component.ts': 
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReferralService } from '../../../core/services/referral.service';
import { Referral } from '../../../core/models';
import { LucideAngularModule, CheckCircle } from 'lucide-angular';

@Component({
  selector: 'app-referrals-list',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './referrals-list.component.html',
  styleUrls: ['./referrals-list.component.scss']
})
export class ReferralsListComponent implements OnInit {
  referrals: Referral[] = [];
  steps = ['Requested', 'Reviewed', 'Referred', 'Outcome'];
  CheckCircle = CheckCircle;

  constructor(private referralService: ReferralService) {}

  ngOnInit() {
    this.referralService.getReferrals().subscribe(res => {
      if (res.success && res.data.items) {
        this.referrals = res.data.items;
      }
    });
  }

  getStepIndex(status: string): number {
    return this.steps.indexOf(status);
  }
}
,
  'features/referrals/referrals-list/referrals-list.component.html': 
<div class="referrals-container">
  <h2>Referral Tracker</h2>
  <div class="cards-grid">
    <div class="card" *ngFor="let ref of referrals">
      <div class="card-header">
        <h3>{{ ref.company }}</h3>
        <span>Job ID: {{ ref.jobId }}</span>
      </div>
      <div class="tracker">
        <div class="step" *ngFor="let step of steps; let i = index" [class.active]="i <= getStepIndex(ref.status)">
          <div class="circle"><lucide-icon *ngIf="i <= getStepIndex(ref.status)" [img]="CheckCircle"></lucide-icon></div>
          <div class="label">{{ step }}</div>
          <div class="line" *ngIf="i < steps.length - 1"></div>
        </div>
      </div>
    </div>
  </div>
</div>
,
  'features/referrals/referrals-list/referrals-list.component.scss': 
.referrals-container { padding: 24px; }
.cards-grid { display: grid; gap: 16px; margin-top: 24px; }
.card { background: var(--surface); padding: 24px; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.card-header { display: flex; justify-content: space-between; margin-bottom: 24px; }
.tracker { display: flex; justify-content: space-between; align-items: center; position: relative; }
.step { flex: 1; display: flex; flex-direction: column; align-items: center; position: relative; z-index: 1; }
.circle { width: 32px; height: 32px; border-radius: 50%; background: #eee; display: flex; align-items: center; justify-content: center; margin-bottom: 8px; color: white; }
.active .circle { background: var(--accent-teal, #008080); }
.label { font-size: 12px; color: var(--text-secondary, #666); }
.active .label { color: var(--text); font-weight: 500; }
.line { position: absolute; top: 16px; left: 50%; width: 100%; height: 2px; background: #eee; z-index: -1; }
.active .line { background: var(--accent-teal, #008080); }
,

  'features/messages/messages-view/messages-view.component.ts': 
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from '../../../core/services/message.service';
import { Message } from '../../../core/models';
import { Subscription, interval, switchMap, startWith } from 'rxjs';
import { LucideAngularModule, Send } from 'lucide-angular';

@Component({
  selector: 'app-messages-view',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './messages-view.component.html',
  styleUrls: ['./messages-view.component.scss']
})
export class MessagesViewComponent implements OnInit, OnDestroy {
  messages: Message[] = [];
  newMessage = '';
  mentorshipId = '';
  Send = Send;
  private pollSub?: Subscription;

  constructor(private route: ActivatedRoute, private msgService: MessageService) {}

  ngOnInit() {
    // For demo purposes, we will default to 'default_mentorship' if no param is present.
    this.mentorshipId = this.route.snapshot.paramMap.get('id') || 'default_mentorship';
    
    this.pollSub = interval(10000).pipe(
      startWith(0),
      switchMap(() => this.msgService.getMessages(this.mentorshipId))
    ).subscribe(res => {
      if (res.success && res.data.items) {
        this.messages = res.data.items;
      }
    });
  }

  sendMessage() {
    if (!this.newMessage.trim()) return;
    this.msgService.sendMessage(this.mentorshipId, this.newMessage).subscribe(res => {
      if (res.success) {
        this.newMessage = '';
        // manual trigger fetch or wait for poll
        this.msgService.getMessages(this.mentorshipId).subscribe(r => {
           if(r.success && r.data.items) this.messages = r.data.items;
        });
      }
    });
  }

  ngOnDestroy() {
    if (this.pollSub) this.pollSub.unsubscribe();
  }
}
,
  'features/messages/messages-view/messages-view.component.html': 
<div class="chat-container">
  <div class="chat-header">
    <h2>Mentorship Chat</h2>
  </div>
  <div class="messages-area">
    <div class="message-bubble" *ngFor="let msg of messages" [class.self]="msg.senderId === 'me'">
      <div class="content">{{ msg.content }}</div>
      <div class="time">{{ msg.createdAt | date:'shortTime' }}</div>
    </div>
  </div>
  <div class="chat-input">
    <input type="text" [(ngModel)]="newMessage" placeholder="Type a message..." (keyup.enter)="sendMessage()" />
    <button (click)="sendMessage()" class="btn-icon"><lucide-icon [img]="Send"></lucide-icon></button>
  </div>
</div>
,
  'features/messages/messages-view/messages-view.component.scss': 
.chat-container { display: flex; flex-direction: column; height: calc(100vh - 100px); background: var(--surface); border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin: 24px; }
.chat-header { padding: 16px 24px; border-bottom: 1px solid #eee; }
.messages-area { flex: 1; padding: 24px; overflow-y: auto; display: flex; flex-direction: column; gap: 16px; }
.message-bubble { max-width: 70%; padding: 12px 16px; border-radius: 12px; background: #f0f0f0; align-self: flex-start; }
.message-bubble.self { background: var(--navy, #000080); color: white; align-self: flex-end; }
.time { font-size: 10px; margin-top: 4px; opacity: 0.7; text-align: right; }
.chat-input { padding: 16px 24px; border-top: 1px solid #eee; display: flex; gap: 8px; align-items: center; }
input { flex: 1; padding: 12px; border: 1px solid #ccc; border-radius: 20px; outline: none; font-family: 'Inter', sans-serif; }
.btn-icon { background: var(--accent-teal, #008080); color: white; border: none; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; }
,

  'features/opportunities/opportunities.routes.ts': 
import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./opportunities-list/opportunities-list.component').then(m => m.OpportunitiesListComponent) },
  { path: 'new', loadComponent: () => import('./opportunities-form/opportunities-form.component').then(m => m.OpportunitiesFormComponent) }
];
,
  'features/events/events.routes.ts': 
import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./events-list/events-list.component').then(m => m.EventsListComponent) },
  { path: 'new', loadComponent: () => import('./events-form/events-form.component').then(m => m.EventsFormComponent) }
];
,
  'features/referrals/referrals.routes.ts': 
import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./referrals-list/referrals-list.component').then(m => m.ReferralsListComponent) }
];
,
  'features/messages/messages.routes.ts': 
import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./messages-view/messages-view.component').then(m => m.MessagesViewComponent) },
  { path: ':id', loadComponent: () => import('./messages-view/messages-view.component').then(m => m.MessagesViewComponent) }
];

};

for (const [relPath, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(basePath, relPath), content.trim());
}
console.log('Files generated successfully.');
