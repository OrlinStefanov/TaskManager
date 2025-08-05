import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Startup } from './startup/startup';

export const routes: Routes = [
  { path: '', component: Startup },
  { path: 'login', component: Login }
];
