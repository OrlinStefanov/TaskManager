import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Startup } from './startup/startup';
import { Register } from './register/register';
import { MainPage } from './main-page/main-page';
import { AuthGuard } from './services/auth-guard/auth-guard';

export const routes: Routes = [
  { path: '', component: Startup },
  { path: 'login', component: Login },
  { path: 'register', component: Register},
  { path: 'dashboard', component: MainPage, canActivate: [AuthGuard]},
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' }
];
