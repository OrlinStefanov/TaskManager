import { Component } from '@angular/core';
import { Auth, User } from '../services/auth';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main-page',
  imports: [
    RouterModule,
    FormsModule,
    CommonModule
  ],
  templateUrl: './main-page.html',
  styleUrl: './main-page.scss'
})

export class MainPage {
  public userName: string | null = null;
  public userEmail: string | null = null;

  user_data: User = {
    userNameOrEmail: '',
    role: 'User'
  }

  participants: { userName: string | null, userEmail: string | null, role: string }[] = [];

  public constructor(private authService : Auth) {}

  ngOnInit() {
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        console.log(user);
        this.userName = user.userName;
        this.userEmail = user.email;
        this.authService.setUser(user.userName);

        this.participants.push({
          userName: this.userName,
          userEmail: this.userEmail,
          role: "Creator"
        });

        console.log(this.participants);
      },
      error: () => {
        this.userName = null;
        this.authService.setUser(null);
      }
    });
  }

  public addParticipant() {
    if (this.user_data.userNameOrEmail && this.user_data.role) {
      this.participants.push({
        userName: this.user_data.userNameOrEmail,
        userEmail: this.userEmail,
        role: this.user_data.role
      });
      this.user_data.userNameOrEmail = '';
      this.user_data.role = 'User';
    }
  }
}
