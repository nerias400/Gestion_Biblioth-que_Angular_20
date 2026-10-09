import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, DEMO_CREDENTIALS } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-login-form',
  imports: [ReactiveFormsModule],
  templateUrl: './login-form.html',
  styleUrl: './login-form.css',
  standalone: true
})
export class LoginForm {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  readonly demoCredentials = DEMO_CREDENTIALS;
  feedback: 'success' | 'error' | null = null;

  readonly loginForm = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email]
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8)]
    })
  });

  constructor() {
    if (this.authService.isAuthenticated()) {
      void this.router.navigateByUrl('/dashboard');
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
    }

    const authenticated = this.authService.signIn(
      this.loginForm.controls.email.value,
      this.loginForm.controls.password.value
    );
    this.feedback = authenticated ? 'success' : 'error';
  }

  closeFeedback(): void {
    this.feedback = null;
  }

  continueAfterLogin(): void {
    this.feedback = null;
    void this.router.navigateByUrl('/dashboard');
  }
}
