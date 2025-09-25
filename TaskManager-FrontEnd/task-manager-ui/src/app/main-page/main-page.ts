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
  public userId: string | null = null;
  public userName: string | null = null;
  public userEmail: string | null = null;

  message: string = '';
  alertType: 'success' | 'danger' | '' = '';

  tobedeletedSessionId: string = "";

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

  //gets the done tasks
  completedTasksCount: number = 0;

  //to show members
  to_show_members : UserSession[] = [];

  //to edit sesion
  to_edit_session : Session;
  
  participants: { userName: string | null, userEmail: string | null, role: string }[] = [];

  public constructor(private authService : Auth) {}

  ngOnInit() {
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.userId = user.id;
        this.userName = user.userName;
        this.userEmail = user.email;
        this.authService.setUser(user.userName);
        this.authService.userid = user.id || '';

        this.participants.push({
          userName: this.userName,
          userEmail: this.userEmail,
          role: "Creator"
        });

        this.userSessions.push({
          sessionName: this.session.title,
          userName: user.userName || '',
          userEmail: user.userEmail || '',
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

    this.authService.getCompletedTasksCount(this.authService.User).subscribe({
      next: (count) => {
        this.completedTasksCount = count;
        console.log('Completed tasks count:', count);
        return count;
      },
      error: (err) => {
        console.error('Error fetching completed tasks count:', err);
        return 0;
      }
    });
    return 0;
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
          userEmail: user.userEmail || '',
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
      next: (createdsession) => {
        this.load_Sessions.push(createdsession);

        this.session.title = '';
        this.session.description = '';
        this.userSessions = [];
        this.participants = [];

        showAlert(this, 'success', 'Session created successfully');
      },
      error: (err) => showAlert(this, 'danger', err.error || 'Failed to create session')
    });
  }

  public getCurrentUserSessions() {
    this.authService.getUserSessions(this.userName).subscribe({
      next: (sessions) => {
        this.load_Sessions = sessions;
        this.is_loading = true;
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
      },
      error: (err) => {
        showAlert(this, 'danger', err.error || 'Failed to retrieve participate sessions')
        this.participate_loading = false;
      }
    }); 
  }

  public deleteSession(sessionId: string, event :MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.authService.deleteSession(sessionId).subscribe({
      next: () => {

        this.archive_loading = true;

        if (this.load_Sessions.length === 1) this.is_loading = false;
        
        const deleted = this.load_Sessions.find(s => s.id === sessionId);

        if (deleted && !this.archive_Sessions.some(s => s.id === sessionId)) this.archive_Sessions.push(deleted);
        this.load_Sessions = this.load_Sessions.filter(s => s.id !== sessionId);
      },
      error: (err) => showAlert(this, 'danger', err.error || 'Failed to delete session')
    });
  }

  public hardDeleteSession(event :MouseEvent) {
    if (this.tobedeletedSessionId == null) {
      showAlert(this, 'danger', 'Invalid session id');
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    this.authService.hardDeleteSession(this.tobedeletedSessionId).subscribe({
      next: () => {
        this.archive_loading = true;
        this.archive_Sessions = this.archive_Sessions.filter(s => s.id !== this.tobedeletedSessionId);

        if (this.archive_Sessions.length === 0) this.archive_loading = false;

        showAlert(this, 'success', 'Session permanently deleted successfully');
      },
      error: (err) => showAlert(this, 'danger', err.error || 'Failed to permanently delete session')
    });
  }

  public getDeletedSessions() {
    this.authService.deleteSessionByCreator(this.userName).subscribe({
      next: (sessions) => {
        this.archive_Sessions = sessions;
        this.archive_loading = true;

        this.getCurrentUserSessions();
      },
      error: (err) => {
        showAlert(this, 'danger', err.error || 'Failed to retrieve deleted sessions');
        this.archive_loading = false;
      } 
    });
  }

  public restoreSession(sessionId: string, event :MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.authService.restoreSession(sessionId).subscribe({
      next: () => {
        this.archive_loading = true;

        if (this.archive_Sessions.length === 1) this.archive_loading = false;
        const restored = this.archive_Sessions.find(s => s.id === sessionId);

        if (restored && !this.load_Sessions.some(s => s.id === sessionId)) {
          this.is_loading = true;
          this.load_Sessions.push(restored);
        }

        this.archive_Sessions = this.archive_Sessions.filter(s => s.id !== sessionId);

        showAlert(this, 'success', 'Session restored successfully');
      },
      error: (err) => showAlert(this, 'danger', err.error || 'Failed to restore session')
    });
  }

  public logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.authService.setUser(null);
        window.location.href = '/login';
      },
      error: () => {
        showAlert(this, 'danger', 'Failed to logout');
      }
    });
  }

  public ShowMembers(event : MouseEvent, us : UserSession[])
  {
    event.preventDefault();
    event.stopPropagation();

    this.to_show_members = us;
  }

  public EditSession(event : MouseEvent, s : Session)
  {
    event.preventDefault();
    event.stopPropagation();

    this.session = s;

    this.participants = this.session.userSessions.map(us => ({
      userName: us.userName || null,
      userEmail: us.userEmail || null,
      role: us.role
    }));
  }

  public initiateEditSession()
  {
    this.session = {
      title: '',
      description: '',
      userSessions: []
    };

    this.participants = [{
      userName: this.userName,
      userEmail: this.userEmail,
      role: this.user_data.role
    }];
  }

  //you can leave only if you are a participant in a session(Creator can't leave)
  public leaveSession(session_id : string, user_name : string, event : MouseEvent)
  {
    event.preventDefault();
    event.stopPropagation();

    this.authService.delete_userSession(session_id, user_name).subscribe({
      next : () => {

        if (this.participate_Sessions.length === 1) this.participate_loading = false;

        this.participate_Sessions = this.participate_Sessions.filter(s => s.id !== session_id);
      },
      error : (err) =>
      {
        console.log(err);
      } 
    })
  }

  //edit session by id
  public editSession(session_id : string, sesion : Session)
  {
    this.userSessions = this.participants.map(p => ({
      sessionName: this.session.title,
      userName: p.userName ?? "", 
      userEmail: p.userEmail ?? "",
      role: p.role as "Admin" | "User" | "Creator"
    }));

    sesion.userSessions = this.userSessions;

    this.authService.editSession(session_id, sesion).subscribe({
      next : (updatedSession) => {
        const index = this.load_Sessions.findIndex(s => s.id === session_id);

        if (index !== -1) {
          this.load_Sessions[index] = updatedSession as Session;
        }

        this.participants = null;
      }
    })
  }

  tobeDeletedSession(sessionId: string) {
    this.tobedeletedSessionId = sessionId;
  }
}