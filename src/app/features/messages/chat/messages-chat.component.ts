import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from '../../../core/services/message.service';
import { Message } from '../../../core/models/phase3.models';
import { interval, Subscription, switchMap, filter } from 'rxjs';

@Component({
  selector: 'app-messages-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chat-container">
      <header class="header">
        <h1>Messages</h1>
      </header>

      <div class="chat-box">
        <div class="messages">
          @for(msg of messages; track msg.id) {
            <div class="message" [class.sent]="msg.senderId === currentUserId">
              <p>{{msg.content}}</p>
              <span class="timestamp">{{msg.timestamp | date:'shortTime'}}</span>
            </div>
          }
        </div>
        
        <div class="input-area">
          <input type="text" [(ngModel)]="newMessage" placeholder="Type a message..." (keyup.enter)="sendMessage()">
          <button class="btn-primary" (click)="sendMessage()">Send</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chat-container {
      padding: 16px;
      font-family: 'Inter', sans-serif;
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    .header {
      margin-bottom: 16px;
    }
    .chat-box {
      flex: 1;
      display: flex;
      flex-direction: column;
      background-color: var(--surface, #ffffff);
      border-radius: 6px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .messages {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .message {
      max-width: 70%;
      padding: 8px 12px;
      border-radius: 6px;
      background-color: #eee;
      align-self: flex-start;
    }
    .message.sent {
      background-color: var(--teal, #008080);
      color: white;
      align-self: flex-end;
    }
    .timestamp {
      font-size: 10px;
      opacity: 0.8;
      display: block;
      margin-top: 4px;
      text-align: right;
    }
    .input-area {
      display: flex;
      padding: 16px;
      gap: 8px;
      border-top: 1px solid #eee;
    }
    input {
      flex: 1;
      padding: 8px;
      border: 1px solid #ccc;
      border-radius: 6px;
    }
    .btn-primary {
      background-color: var(--teal, #008080);
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
    }
  `]
})
export class MessagesChatComponent implements OnInit, OnDestroy {
  messages: Message[] = [];
  newMessage = '';
  currentUserId = 'user1'; // Mock current user for UI logic
  chatId = 'chat1'; // Assume an active chat ID
  private pollSub?: Subscription;

  constructor(private messageService: MessageService) {}

  ngOnInit() {
    this.loadMessages();
    this.pollSub = interval(10000)
      .pipe(switchMap(() => this.messageService.getMessages(this.chatId)))
      .subscribe(res => {
        if (res.success) {
          this.messages = res.data.items;
        }
      });
  }

  ngOnDestroy() {
    if (this.pollSub) {
      this.pollSub.unsubscribe();
    }
  }

  loadMessages() {
    this.messageService.getMessages(this.chatId).subscribe(res => {
      if (res.success) {
        this.messages = res.data.items;
      }
    });
  }

  sendMessage() {
    if (!this.newMessage.trim()) return;
    this.messageService.sendMessage(this.chatId, this.newMessage).subscribe(res => {
      if (res.success && res.data.items.length) {
        this.messages.push(res.data.items[0]); // Optimistic or returned msg
      }
      this.newMessage = '';
      this.loadMessages(); // reload to get true state
    });
  }
}
