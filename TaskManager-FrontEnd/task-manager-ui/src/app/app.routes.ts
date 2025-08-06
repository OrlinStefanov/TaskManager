import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Startup } from './startup/startup';
import { Register } from './register/register';

export const routes: Routes = [
  { path: '', component: Startup },
  { path: 'login', component: Login },
  { path: 'register', component: Register}
];
