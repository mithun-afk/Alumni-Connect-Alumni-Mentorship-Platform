import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SessionService } from '../../../core/services/session.service';
import { OfficeHourSlot } from '../../../core/models/mentorship.model';

@Component({
  selector: 'app-office-hours',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './office-hours.component.html',
  styleUrls: ['./office-hours.component.scss']
})
export class OfficeHoursComponent implements OnInit {
  slots: OfficeHourSlot[] = [];
  
  newSlot = {
    date: '',
    startTime: '',
    endTime: '',
    topic: ''
  };

  constructor(private sessionService: SessionService) {}

  ngOnInit() {
    this.loadSlots();
  }

  loadSlots() {
    // using dummy mentor ID for now
    this.sessionService.getOfficeHours('1').subscribe(res => {
      this.slots = res.data || [];
    });
  }

  addSlot() {
    if (this.newSlot.date && this.newSlot.startTime && this.newSlot.endTime) {
      this.sessionService.addOfficeHour({
        ...this.newSlot,
        mentor: '1'
      }).subscribe(() => {
        alert('Slot added');
        this.loadSlots();
        this.newSlot = { date: '', startTime: '', endTime: '', topic: '' };
      });
    }
  }
}



