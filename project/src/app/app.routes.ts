import { Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { Login } from './pages/login/login';
import { Registration } from './pages/resgister/resgister';
import { Tasks } from './pages/tasks/tasks';
import { Statistics } from './pages/statistics/statistics';
import { Profile } from './pages/profile/profile';
import { About } from './pages/about/about';
import { authGuard } from './guards/auth-guard';
import { NotFound } from './pages/not-found/not-found';
export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'register', component: Registration },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  { path: 'tasks', component: Tasks, canActivate: [authGuard] },
  { path: 'statistics', component: Statistics, canActivate: [authGuard] },
  { path: 'profile', component: Profile, canActivate: [authGuard] },
  { path: 'about', component: About, canActivate: [authGuard] },
  { path: '**', component: NotFound }
];