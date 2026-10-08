import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, FormArray } from '@angular/forms';
import { ProfileService } from '../../../core/services/profile.service';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { Profile } from '../../../core/models/user.model';

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, LucideAngularModule, RouterModule],
  templateUrl: './profile-edit.component.html',
  styleUrls: ['./profile-edit.component.scss']
})
export class ProfileEditComponent implements OnInit {
  private fb = inject(FormBuilder);
  private profileService = inject(ProfileService);
  private router = inject(Router);

  isLoading = true;
  isSaving = false;
  successMessage = '';
  errorMessage = '';

  profileForm = this.fb.group({
    headline: [''],
    bio: [''],
    currentCompany: [''],
    currentRole: [''],
    location: [''],
    experience: [0, Validators.min(0)],
    skills: [[] as string[]],
    domains: [[] as string[]],
    linkedinUrl: [''],
    githubUrl: [''],
    portfolioUrl: [''],
    profileVisibility: ['public']
  });

  newSkill = '';
  newDomain = '';

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.profileService.getMyProfile().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.profileForm.patchValue(res.data);
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  get skills() { return this.profileForm.get('skills')?.value || []; }
  get domains() { return this.profileForm.get('domains')?.value || []; }

  addSkill(event: Event) {
    event.preventDefault();
    const val = this.newSkill.trim();
    if (val && !this.skills.includes(val)) {
      this.profileForm.patchValue({ skills: [...this.skills, val] });
    }
    this.newSkill = '';
  }

  removeSkill(skill: string) {
    this.profileForm.patchValue({ skills: this.skills.filter((s: string) => s !== skill) });
  }

  addDomain(event: Event) {
    event.preventDefault();
    const val = this.newDomain.trim();
    if (val && !this.domains.includes(val)) {
      this.profileForm.patchValue({ domains: [...this.domains, val] });
    }
    this.newDomain = '';
  }

  removeDomain(domain: string) {
    this.profileForm.patchValue({ domains: this.domains.filter((d: string) => d !== domain) });
  }

  onSubmit() {
    if (this.profileForm.invalid) return;

    this.isSaving = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.profileService.updateProfile(this.profileForm.value as any).subscribe({
      next: (res) => {
        this.isSaving = false;
        this.successMessage = 'Profile updated successfully!';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.isSaving = false;
        this.errorMessage = err.message || 'Failed to update profile.';
      }
    });
  }
}




