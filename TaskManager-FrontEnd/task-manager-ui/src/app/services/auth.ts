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

@Injectable({
  providedIn: 'root'
})

export class Auth {
  private userSubject = new BehaviorSubject<string | null>(null);
  user$ = this.userSubject.asObservable();

  private apiUrl = 'https://localhost:7188'; //.NET API base URL

  constructor(private http: HttpClient) {}

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
}
