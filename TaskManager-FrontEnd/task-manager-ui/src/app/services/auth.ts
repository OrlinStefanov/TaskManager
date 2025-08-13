import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';

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
}
