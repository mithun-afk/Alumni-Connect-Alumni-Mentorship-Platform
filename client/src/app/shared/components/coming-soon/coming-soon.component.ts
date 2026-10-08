import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-coming-soon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="coming-soon">
      <div class="coming-soon__icon">🚀</div>
      <h2>{{ title }}</h2>
      <p>This feature is coming soon. Stay tuned!</p>
    </div>
  `,
  styles: [`
    .coming-soon {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 24px;
      text-align: center;
      color: #5B6475;
    }
    .coming-soon__icon { font-size: 3rem; margin-bottom: 16px; }
    h2 { color: #1F2A44; font-size: 1.5rem; margin-bottom: 8px; }
    p { font-size: 0.9375rem; }
  `]
})
export class ComingSoonComponent {
  @Input() title = 'Coming Soon';
}
