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

  //to load sessions
  load_Sessions: Session[] = [];
  is_loading: boolean = false;

  //load sessiosn if you participate in any
  participate_Sessions: Session[] = [];
  participate_loading: boolean = false;

  //archive sessions
  archive_Sessions: Session[] = [];
  archive_loading: boolean = false;

  //to store user sessions
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

        this.getCurrentUserSessions();
        this.getParticipateSessions();
        this.getDeletedSessions();
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

    this.authService.createSession(this.session).subscribe({
      next: () => {
        showAlert(this, 'success', 'Session created successfully');
        this.getCurrentUserSessions();
      },
      error: (err) => showAlert(this, 'danger', err.error || 'Failed to create session')
    });
  }

  public getCurrentUserSessions() {
    this.authService.getUserSessions(this.userName).subscribe({
      next: (sessions) => {
        this.load_Sessions = sessions;
        this.is_loading = true;

        showAlert(this, 'success', 'Sessions retrieved successfully');
      },
      error: (err) => {
        showAlert(this, 'danger', err.error || 'Failed to retrieve sessions')
        this.is_loading = false;
      }
    }); 
  }

  public getParticipateSessions() {
    this.authService.getParticipateSessions(this.userName).subscribe({
      next: (sessions) => {
        this.participate_Sessions = sessions;
        this.participate_loading = true;

        showAlert(this, 'success', 'Participate Sessions retrieved successfully');
      },
      error: (err) => {
        showAlert(this, 'danger', err.error || 'Failed to retrieve participate sessions')
        this.participate_loading = false;
      }
    }); 
  }

  public deleteSession(sessionId: number, event :MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.authService.deleteSession(sessionId).subscribe({
      next: () => {
        showAlert(this, 'success', 'Session deleted successfully');
        this.getCurrentUserSessions();
        this.getDeletedSessions();
      },
      error: (err) => showAlert(this, 'danger', err.error || 'Failed to delete session')
    });
  }

  public hardDeleteSession(sessionId: number, event :MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.authService.hardDeleteSession(sessionId).subscribe({
      next: () => {
        showAlert(this, 'success', 'Session permanently deleted successfully');
        this.getDeletedSessions();
      },
      error: (err) => showAlert(this, 'danger', err.error || 'Failed to permanently delete session')
    });
  }

  public getDeletedSessions() {
    this.authService.deleteSessionByCreator(this.userName).subscribe({
      next: (sessions) => {
        this.archive_Sessions = sessions;
        this.archive_loading = true;
        showAlert(this, 'success', 'Deleted sessions retrieved successfully');
        this.getCurrentUserSessions();
      },
      error: (err) => {
        showAlert(this, 'danger', err.error || 'Failed to retrieve deleted sessions');
        this.archive_loading = false;
      } 
    });
  }

  public restoreSession(sessionId: number, event :MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.authService.restoreSession(sessionId).subscribe({
      next: () => {
        showAlert(this, 'success', 'Session restored successfully');
        this.getDeletedSessions();
        this.getCurrentUserSessions();
      },
      error: (err) => showAlert(this, 'danger', err.error || 'Failed to restore session')
    });
  }
}