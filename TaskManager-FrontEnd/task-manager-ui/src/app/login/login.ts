import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Auth, LoginRequest } from '../services/auth';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NgClass, NgIf } from '@angular/common';
import { showAlert } from '../services/helper';

@Component({
  selector: 'app-login',
  imports: [
    RouterModule,
    FormsModule,
    NgIf,
    NgClass
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  credentials: LoginRequest = {
    userNameOrEmail: '',
    password: '',
    rememberMe: false
  }

  message: string = '';
  alertType: 'success' | 'danger' | '' = '';

  constructor(private authService : Auth, private router: Router) {}

  onLogin() {
    this.authService.login(this.credentials).subscribe({
      next: () => {
        showAlert(this, 'success', 'Login successful!');
        this.authService.setUser(this.credentials.userNameOrEmail);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => showAlert(this, 'danger', err.error || 'Login failed')
    });
  }
}
