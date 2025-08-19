import { Component } from '@angular/core';
import { Auth, Session, User, UserSession } from '../services/auth';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule, NgIf } from '@angular/common';
import { showAlert } from '../services/helper';

@Component({
  selector: 'app-main-page',
  imports: [
    RouterModule,
    FormsModule,
    CommonModule,
    NgIf
  ],
  templateUrl: './main-page.html',
  styleUrl: './main-page.scss'
})

export class MainPage {
  //fro the page
  public userName: string | null = null;
  public userEmail: string | null = null;

  message: string = '';
  alertType: 'success' | 'danger' | '' = '';

  user_data: User = {
    userNameOrEmail: '',
    role: 'User'
  }

  //for the session
  session: Session = {
    title: '',
    description: '',
    userSessions: []
  }

  userSessions: UserSession[] = [];


  participants: { userName: string | null, userEmail: string | null, role: string }[] = [];

  public constructor(private authService : Auth) {}

  ngOnInit() {
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.userName = user.userName;
        this.userEmail = user.email;
        this.authService.setUser(user.userName);

        this.participants.push({
          userName: this.userName,
          userEmail: this.userEmail,
          role: "Creator"
        });

        this.userSessions.push({
          sessionName: this.session.title,
          userName: user.userName || '',
          role: "Creator"
        });
      },
      error: () => {
        this.userName = null;
        this.authService.setUser(null);
      }
    });
  }

  public addParticipant() {
    if (!this.user_data.userNameOrEmail) {
      showAlert(this, 'danger', 'Please enter a username or email');
      return;
    }
    
    if (!this.user_data.role) {
      showAlert(this, 'danger', 'Please select a role');
      return;
    }

    this.authService.checkUserExists(this.user_data.userNameOrEmail).subscribe({
      next: (user) => 
      {
        if (this.participants.some(p => p.userName === this.user_data.userNameOrEmail || p.userEmail === this.user_data.userNameOrEmail)) {
          showAlert(this, 'danger', 'User already added as participant');
          return;
        }

        this.participants.push({
          userName: user.userName,
          userEmail: user.email,
          role: this.user_data.role
        });

        this.userSessions.push({
          sessionName: this.session.title,
          userName: user.userName || '',
          role: this.user_data.role
        })

        this.user_data.userNameOrEmail = '';
        this.user_data.role = 'User';

        showAlert(this, 'success', 'Participant added successfully');
      },
      error: (err) => {
        showAlert(this, 'danger', err.error || 'Invalid user information');
        this.user_data.userNameOrEmail = '';
        this.user_data.role = 'User';
      }
    });
  }

  public removeParticipant(p: { userName: string | null, userEmail: string | null, role: string }) {
    var index = this.participants.indexOf(p);
    if ((index < 0 || index >= this.participants.length) && p.userName === this.userName) {
      showAlert(this, 'danger', 'Invalid participant index');
      return;
    } else if (p.userName != this.userName) {
      this.participants.splice(index, 1);
      showAlert(this, 'success', 'Participant removed successfully');
    }

    this.userSessions = this.userSessions.filter(us => us.userName !== p.userName);
  }

  public createSession() {
    if (!this.session.title || !this.session.description) {
      showAlert(this, 'danger', 'Please fill in all fields');
      return;
    }

    if (this.participants.length === 0) {
      showAlert(this, 'danger', 'Please add at least one participant');
      return;
    }

    for (let i = 0; i < this.userSessions.length; i ++)
    {
      this.userSessions[i].sessionName = this.session.title;
    }

    this.session.userSessions = this.userSessions;

    console.log(this.participants);
    console.log(this.session);
    this.authService.createSession(this.session).subscribe({
      next: () => {
        showAlert(this, 'success', 'Session created successfully');
      },
      error: (err) => showAlert(this, 'danger', err.error || 'Failed to create session')
    });
  }
}
