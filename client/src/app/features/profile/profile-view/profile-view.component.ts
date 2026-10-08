import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProfileService } from '../../../core/services/profile.service';
import { AuthService } from '../../../core/services/auth.service';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-profile-view',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './profile-view.component.html',
  styleUrls: ['./profile-view.component.scss']
})
export class ProfileViewComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private profileService = inject(ProfileService);
  private authService = inject(AuthService);

  profileData: any = null;
  isLoading = true;
  isOwnProfile = false;

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const userId = params.get('userId');
      if (userId === 'me' || userId === this.authService.currentUserValue?._id) {
        this.isOwnProfile = true;
        this.loadMyProfile();
      } else if (userId) {
        this.loadPublicProfile(userId);
      }
    });
  }

  loadMyProfile() {
    this.profileService.getMyProfile().subscribe({
      next: (res) => {
        if (res.success) {
          this.profileData = res.data;
        }
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  loadPublicProfile(userId: string) {
    this.profileService.getPublicProfile(userId).subscribe({
      next: (res) => {
        if (res.success) {
          this.profileData = res.data;
        }
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }
}

