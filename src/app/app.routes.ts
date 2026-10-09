import { Routes } from '@angular/router';
import { authenticatedGuard } from './core/auth/auth.guard';
import { LoginForm } from './components/features/Auth/login-form/login-form';
import { Dashboard } from './components/features/dashboard/dashboard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: LoginForm },
  { path: 'dashboard', component: Dashboard, canActivate: [authenticatedGuard] },
  { path: '**', redirectTo: 'login' }
];
