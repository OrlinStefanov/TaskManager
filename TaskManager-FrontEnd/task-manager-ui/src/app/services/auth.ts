import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';

//for the login and register requests
export interface LoginRequest {
  userNameOrEmail: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterRequest {
  user_email: string;
  user_Name: string;
  user_Password: string;
}

export interface User {
  userNameOrEmail: string;
  role : "Admin" | "User";
}

//for the session requests
export interface UserSession {
  sessionName: string;

  userName: string;

  role: "Admin" | "User" | "Creator";
}

export interface Session {
  id?: string;
  title: string;
  description: string;

  userSessions: UserSession[];
}

//for the session page with tasks
export interface Sesison_Full {
  id?: string;
  title: string;
  description: string;

  userSessions: UserSessionFull[];

  tasks: Task[];
}

export interface Task {
  id?: string;
  title: string;
  description: string;

  dueDate: Date;
  sessionId: string;

  assignedToUserId: string;
  createdByUserId: string;
  status: "To Do" | "In Progress" | "Done";
}

export interface UserSessionFull {
  userId: string;
  userName: string;
  userEmail: string;
  role: "Admin" | "User" | "Creator";
}

@Injectable({
  providedIn: 'root'
})

export class Auth {
  private userSubject = new BehaviorSubject<string | null>(null);
  user$ = this.userSubject.asObservable();

  private apiUrl = 'https://localhost:7188'; //.NET API base URL

  constructor(private http: HttpClient) {}

  private _userid: string = '';

  set userid(id: string) {
    this._userid = id;
  }

  get userid(): string {
    return this._userid;
  }

  //login method to authenticate user
  login(data: LoginRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, data, { withCredentials: true, headers: { 'Content-Type': 'application/json' } });
  }

  //register method to create a new user
  register(data: RegisterRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data, { withCredentials: true, headers: { 'Content-Type': 'application/json' } });
  }

  //get current user
  getCurrentUser(): Observable<any> {
    return this.http.get(`${this.apiUrl}/current-user`, { withCredentials: true, headers: { 'Content-Type': 'application/json' } });
  }

  //set current user
  setUser(username: string | null) {
    this.userSubject.next(username);
  }

  //get current username
  get User(): string | null {
    return this.userSubject.value;
  }

  //doesn't work yet
  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true });
  }
  
  //checks if added user exists and returns their data
  checkUserExists(userNameOrEmail: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/${userNameOrEmail}`, { withCredentials: true, headers: { 'Content-Type': 'application/json' } });
  }

  //create session
  createSession(session: Session): Observable<any> {
    return this.http.post(`${this.apiUrl}/sessions`, session, { withCredentials: true, headers: { 'Content-Type': 'application/json' } });
  }

  //get sessions for a user
  getUserSessions(userName: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/sessions/${userName}`, { withCredentials: true, headers: { 'Content-Type': 'application/json' } });
  }

  //get sessions where user is a participant
  getParticipateSessions(userName: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/sessions/participant/${userName}`, { withCredentials: true, headers: { 'Content-Type': 'application/json' } });
  }

  //soft delete session by id
  deleteSession(sessionId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/sessions/${sessionId}`, { withCredentials: true, headers: { 'Content-Type': 'application/json' } });
  }

  //hard delete session by id
  hardDeleteSession(sessionId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/sessions/hard-delete/${sessionId}`, { withCredentials: true, headers: { 'Content-Type': 'application/json' } });
  }

  //return soft delete session by creator
  deleteSessionByCreator(userName: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/sessions/deleted/${userName}`, { withCredentials: true, headers: { 'Content-Type': 'application/json' } });
  }

  //restore deleted session by id
  restoreSession(sessionId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/sessions/restore/${sessionId}`, {}, { withCredentials: true, headers: { 'Content-Type': 'application/json' } });
  }

  //gets session by id
  getSessionById(sessionId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/sessions_all/${sessionId}`, { withCredentials: true, headers: { 'Content-Type': 'application/json' } });
  }

  //create task
  createTask(sessionId : string, task: Task): Observable<any> {
    return this.http.post(`${this.apiUrl}/sessions/${sessionId}/tasks`, task, { withCredentials: true, headers: { 'Content-Type': 'application/json' } });
  }

  //update task status
  updateTaskStatus(taskId: string, newStatus: "To Do" | "In Progress" | "Done"): Observable<any> {
    return this.http.put(`${this.apiUrl}/tasks/${taskId}/status`,JSON.stringify(newStatus), {withCredentials: true, headers: { 'Content-Type': 'application/json' }});
  }

  //get completed tasks count for a user
  getCompletedTasksCount(userName: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/tasks/completed/${userName}`, { withCredentials: true, headers: { 'Content-Type': 'application/json' } });
  }

  //delete task by id
  deleteTask(taskId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/tasks/${taskId}`, { withCredentials: true, headers: { 'Content-Type': 'application/json' } });
  }

  //edit task by id
  editTask(taskId: string, task: Task): Observable<any> {
    return this.http.put(`${this.apiUrl}/tasks/${taskId}`, task, { withCredentials: true, headers: { 'Content-Type': 'application/json' } });
  }
}