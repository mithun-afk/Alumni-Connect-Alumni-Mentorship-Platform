import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  role: 'student' | 'alumni' = 'student';
  departments = ['CSE', 'ECE', 'EEE', 'ME', 'CE', 'IT', 'Chemical', 'Biotech'];
  
  currentYear = new Date().getFullYear();
  batches = Array.from({length: 20}, (_, i) => (this.currentYear - 15 + i).toString());

  registerForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required],
    department: ['', Validators.required],
    batch: ['', Validators.required],
    rollNo: ['']
  }, { validators: this.passwordMatchValidator });

  isLoading = false;
  errorMessage = '';

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ ...confirmPassword.errors, passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      if (confirmPassword?.hasError('passwordMismatch')) {
        const errors = { ...confirmPassword.errors };
        delete errors['passwordMismatch'];
        confirmPassword.setErrors(Object.keys(errors).length ? errors : null);
      }
    }
    return null;
  }

  setRole(selectedRole: 'student' | 'alumni') {
    this.role = selectedRole;
    if (this.role === 'alumni') {
      this.registerForm.get('rollNo')?.setValidators([Validators.required]);
    } else {
      this.registerForm.get('rollNo')?.clearValidators();
    }
    this.registerForm.get('rollNo')?.updateValueAndValidity();
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const payload = {
      ...this.registerForm.value,
      role: this.role
    };
    delete payload.confirmPassword;

    this.authService.register(payload).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.errorMessage = err.message || 'Registration failed.';
        this.isLoading = false;
      }
    });
  }
}

