import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventService } from '../../../core/services/event.service';
import { Event } from '../../../core/models/phase3.models';

@Component({
  selector: 'app-events-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="events-container">
      <header class="header">
        <h1>Events</h1>
      </header>

      <div class="event-list">
        @for(event of events; track event.id) {
          <div class="card">
            <h3>{{event.title}}</h3>
            <div class="details">
              <span>{{event.date | date}}</span>
              <span>{{event.location}}</span>
            </div>
            <p>{{event.description}}</p>
            <button class="btn-primary" (click)="rsvp(event.id)" [disabled]="event.isRsvpd">
              {{event.isRsvpd ? 'RSVP\\'d' : 'RSVP'}}
            </button>
          </div>
        } @empty {
          <p>No upcoming events.</p>
        }
      </div>
    </div>
  `,
  styles: [`
    .events-container {
      padding: 16px;
      font-family: 'Inter', sans-serif;
    }
    .header {
      margin-bottom: 24px;
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
    .btn-primary {
      background-color: var(--teal, #008080);
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
    }
    .btn-primary:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }
  `]
})
export class EventsListComponent implements OnInit {
  events: Event[] = [];

  constructor(private eventService: EventService) {}

  ngOnInit() {
    this.eventService.getEvents().subscribe(res => {
      if (res.success) {
        this.events = res.data.items;
      }
    });
  }

  rsvp(id: string) {
    this.eventService.rsvp(id).subscribe(res => {
      if (res.success) {
        const evt = this.events.find(e => e.id === id);
        if (evt) evt.isRsvpd = true;
      }
    });
  }
}
