import { Component, OnInit } from '@angular/core';
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

  constructor(
    private fb: FormBuilder,
    private careerPathService: CareerPathService
  ) {
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
    this.careerPathService.getPaths(this.filterForm.value).subscribe(res => {
      if (res.success) {
        this.careerNodes = res.data;
      }
    });
  }

  onFilter(): void {
    this.fetchPaths();
  }
}
