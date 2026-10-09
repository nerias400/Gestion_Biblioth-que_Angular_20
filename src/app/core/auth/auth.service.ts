import { computed, Injectable, signal } from '@angular/core';

const SESSION_KEY = 'gestion.auth.email';
export const DEMO_CREDENTIALS = {
  email: 'gerant@gestion.cm',
  password: 'Gestion123!'
} as const;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly currentUserEmail = signal<string | null>(
    sessionStorage.getItem(SESSION_KEY)
  );

  readonly userEmail = this.currentUserEmail.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUserEmail() !== null);

  signIn(email: string, password: string): boolean {
    if (email !== DEMO_CREDENTIALS.email || password !== DEMO_CREDENTIALS.password) {
      return false;
    }

    sessionStorage.setItem(SESSION_KEY, email);
    this.currentUserEmail.set(email);
    return true;
  }

  signOut(): void {
    sessionStorage.removeItem(SESSION_KEY);
    this.currentUserEmail.set(null);
  }
}
