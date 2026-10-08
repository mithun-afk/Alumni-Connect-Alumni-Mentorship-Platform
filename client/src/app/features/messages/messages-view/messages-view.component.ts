import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MessageService } from '../../../core/services/message.service';
import { MentorshipService } from '../../../core/services/mentorship.service';
import { AuthService } from '../../../core/services/auth.service';
import { interval, Subscription, switchMap } from 'rxjs';

@Component({
  selector: 'app-messages-view',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="page">
      <div *ngIf="!selectedMentorshipId">
        <h1 class="page-title">Messages</h1>
        <div class="loading-state" *ngIf="loadingList"><div class="spinner"></div></div>
        <div class="empty-state" *ngIf="!loadingList&&mentorships.length===0"><p>No active mentorships. Messages are available between mentorship participants.</p></div>
        <div *ngIf="!loadingList&&mentorships.length>0">
          <p style="color:#5B6475;margin-bottom:16px">Select a conversation:</p>
          <div style="display:flex;flex-direction:column;gap:12px">
            <div class="card" style="cursor:pointer;display:flex;justify-content:space-between;align-items:center" *ngFor="let m of mentorships" (click)="selectMentorship(m)">
              <div><strong>{{getLabel(m)}}</strong><p style="font-size:.8rem;color:#5B6475;margin-top:4px">Active Mentorship</p></div>
              <span style="color:#2F7F79;font-size:.875rem">Open →</span>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="selectedMentorshipId" class="chat-container">
        <div class="chat-header">
          <button class="btn btn-secondary" style="padding:6px 12px;font-size:.8rem" (click)="back()">← Back</button>
          <h2 style="margin:0">{{currentLabel}}</h2>
        </div>
        <div class="messages-area">
          <div class="loading-state" *ngIf="loadingMsgs"><div class="spinner"></div></div>
          <div class="empty-state" *ngIf="!loadingMsgs&&messages.length===0"><p>No messages yet. Say hello!</p></div>
          <div *ngFor="let msg of messages" class="bubble-wrap" [class.mine]="msg.sender===myId||msg.sender?._id===myId">
            <div class="bubble">{{msg.content}}</div>
            <div class="bubble-time">{{msg.createdAt|date:'shortTime'}}</div>
          </div>
        </div>
        <div class="input-bar">
          <input [(ngModel)]="newMsg" placeholder="Type a message..." (keyup.enter)="send()" [disabled]="sending">
          <button class="btn btn-primary" (click)="send()" [disabled]="sending||!newMsg.trim()">{{sending?'...':'Send'}}</button>
        </div>
      </div>
    </div>`,
  styles: [`
    .page{padding:24px}
    .chat-container{display:flex;flex-direction:column;height:calc(100vh - 130px)}
    .chat-header{display:flex;align-items:center;gap:16px;padding-bottom:16px;border-bottom:1px solid #E2E4E8;margin-bottom:16px}
    .messages-area{flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:8px;padding:8px;background:#fff;border:1px solid #E2E4E8;border-radius:6px}
    .bubble-wrap{display:flex;flex-direction:column;max-width:65%}
    .bubble-wrap.mine{align-self:flex-end;align-items:flex-end}
    .bubble{padding:10px 14px;border-radius:16px;background:#F5F6F8;color:#1F2A44;font-size:.9rem;word-break:break-word}
    .mine .bubble{background:#2F7F79;color:#fff}
    .bubble-time{font-size:.68rem;color:#5B6475;margin-top:2px}
    .input-bar{display:flex;gap:8px;padding-top:12px;border-top:1px solid #E2E4E8;margin-top:auto}
    .input-bar input{flex:1}
  `]
})
export class MessagesViewComponent implements OnInit, OnDestroy {
  private msgSvc = inject(MessageService);
  private mSvc = inject(MentorshipService);
  private auth = inject(AuthService);
  mentorships: any[] = []; loadingList = true;
  selectedMentorshipId = ''; currentLabel = '';
  messages: any[] = []; loadingMsgs = false;
  newMsg = ''; sending = false;
  myId = this.auth.currentUserValue?._id || '';
  private poll?: Subscription;

  ngOnInit() {
    this.mSvc.getActiveMentorships().subscribe({
      next:(r:any)=>{this.mentorships=(r.data||[]).filter((m:any)=>m.status==='active');this.loadingList=false;},
      error:()=>{this.loadingList=false;}
    });
  }

  getLabel(m: any): string {
    const role = this.auth.currentUserValue?.role;
    if (role === 'student') return `${m.mentor?.firstName||''} ${m.mentor?.lastName||''}`.trim()||'Mentor';
    return `${m.student?.firstName||''} ${m.student?.lastName||''}`.trim()||'Student';
  }

  selectMentorship(m: any) {
    this.selectedMentorshipId = m._id;
    this.currentLabel = this.getLabel(m);
    this.loadMessages();
    this.poll = interval(10000).pipe(switchMap(()=>this.msgSvc.getMessages(m._id)))
      .subscribe({next:(r:any)=>{this.messages=r.data||[];}});
  }

  loadMessages() {
    this.loadingMsgs = true;
    this.msgSvc.getMessages(this.selectedMentorshipId).subscribe({
      next:(r:any)=>{this.messages=r.data||[];this.loadingMsgs=false;},
      error:()=>{this.loadingMsgs=false;}
    });
  }

  send() {
    if (!this.newMsg.trim()) return;
    this.sending = true;
    this.msgSvc.sendMessage(this.selectedMentorshipId, this.newMsg).subscribe({
      next:()=>{this.newMsg='';this.sending=false;this.loadMessages();},
      error:()=>{this.sending=false;}
    });
  }

  back() { this.selectedMentorshipId=''; this.poll?.unsubscribe(); this.messages=[]; }
  ngOnDestroy() { this.poll?.unsubscribe(); }
}
