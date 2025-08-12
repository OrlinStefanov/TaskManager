import { NgClass, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { Auth } from '../services/auth';
import { showAlert } from '../services/helper';

@Component({
  selector: 'app-register',
  imports: [
    RouterModule,
    FormsModule,
    NgIf,
    NgClass
  ],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})

export class Register {
  credentials = {
    user_email: '',
    user_Name: '',
    user_Password: ''
  };

  message: string = '';
  alertType: 'success' | 'danger' | '' = '';

  constructor(private authService: Auth, private router : Router) {}

  onRegister() {
    this.authService.register(this.credentials).subscribe({
      next: () =>  {
        showAlert(this, 'success', 'Register successful!');
        if (this.credentials.user_Name != null || this.credentials.user_Password != null || this.credentials.user_email != null) this.router.navigate(['/dashboard'])
      },
      error: (err) => showAlert(this, 'danger', err.error || 'Register failed')
    });
  }
}
