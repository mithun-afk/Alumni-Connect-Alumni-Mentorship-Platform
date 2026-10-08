import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CareerPathService, CareerNode } from '../../core/services/career-path.service';
import { LucideAngularModule, Search, Filter } from 'lucide-angular';

@Component({
  selector: 'app-career-path',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './career-path.component.html',
  styleUrls: ['./career-path.component.scss']
})
export class CareerPathComponent implements OnInit {
  filterForm: FormGroup;
  careerNodes: CareerNode[] = [];
  lucideIcons = { Search, Filter };
  private fb = inject(FormBuilder);
  private careerPathService = inject(CareerPathService);

  constructor() {
    this.filterForm = this.fb.group({
      department: [''],
      graduationYear: [''],
      domain: [''],
      company: ['']
    });
  }

  ngOnInit(): void {
    this.fetchPaths();
  }

  fetchPaths(): void {
    this.careerPathService.getPaths(this.filterForm.value).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.careerNodes = (res.data.profiles || []).map((p: any) => ({
            id: p.id,
            name: p.name,
            department: p.department,
            graduationYear: p.batch,
            domain: p.domains && p.domains.length ? p.domains.join(", ") : "N/A",
            company: p.company || "Unknown",
            role: p.role || "Unknown",
            year: p.experience && p.experience.length ? new Date(p.experience[0].startDate).getFullYear() : "Present"
          }));
        }
      },
      error: () => {
        // Fallback mock data
        this.careerNodes = [
          { id: '1', name: 'Alice', department: 'Computer Science', graduationYear: 2018, domain: 'AI', company: 'Google', role: 'AI Engineer', year: 2019 },
          { id: '2', name: 'Bob', department: 'Electrical', graduationYear: 2017, domain: 'Hardware', company: 'Intel', role: 'Hardware Engineer', year: 2018 },
        ];
      }
    });
  }

  onFilter(): void {
    this.fetchPaths();
  }
}



