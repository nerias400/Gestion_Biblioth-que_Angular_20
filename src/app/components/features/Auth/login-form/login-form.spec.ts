import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';

import { LoginForm } from './login-form';
import { DEMO_CREDENTIALS } from '../../../../core/auth/auth.service';

describe('LoginForm', () => {
  let component: LoginForm;
  let fixture: ComponentFixture<LoginForm>;

  beforeEach(async () => {
    sessionStorage.removeItem('gestion.auth.email');
    await TestBed.configureTestingModule({
      imports: [LoginForm],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('requires a valid email and a password of at least eight characters', () => {
    expect(component.loginForm.invalid).toBeTrue();

    component.loginForm.setValue({
      email: 'not-an-email',
      password: 'short'
    });
    expect(component.loginForm.invalid).toBeTrue();

    component.loginForm.setValue({
      email: 'user@example.com',
      password: 'long-enough'
    });
    expect(component.loginForm.valid).toBeTrue();
  });

  it('shows the success popup for the hard-coded manager and redirects on confirmation', async () => {
    component.loginForm.setValue(DEMO_CREDENTIALS);
    component.onSubmit();

    expect(component.feedback).toBe('success');
    expect(sessionStorage.getItem('gestion.auth.email')).toBe(DEMO_CREDENTIALS.email);

    const router = TestBed.inject(Router);
    const navigateSpy = spyOn(router, 'navigateByUrl').and.resolveTo(true);
    component.continueAfterLogin();
    await fixture.whenStable();

    expect(navigateSpy).toHaveBeenCalledWith('/dashboard');
  });

  it('shows an error popup and does not authenticate unknown users', () => {
    component.loginForm.setValue({
      email: 'inconnu@example.com',
      password: 'UnMotDePasse123!'
    });
    component.onSubmit();

    expect(component.feedback).toBe('error');
    expect(sessionStorage.getItem('gestion.auth.email')).toBeNull();
    component.closeFeedback();
    expect(component.feedback).toBeNull();
  });

  it('shows an error popup for malformed credentials too', () => {
    component.loginForm.setValue({
      email: 'not-an-email',
      password: 'short'
    });
    component.onSubmit();

    expect(component.loginForm.controls.email.touched).toBeTrue();
    expect(component.loginForm.controls.password.touched).toBeTrue();
    expect(component.feedback).toBe('error');
    expect(sessionStorage.getItem('gestion.auth.email')).toBeNull();
  });
});
