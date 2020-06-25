import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthData } from './auth.model'
import { Subject } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private token;
  private isAuthenticatd: boolean = false;
  private authStatusListener = new Subject<boolean>()
  private tokenTimer: any;
  private userId: string;

  constructor(private http: HttpClient, private router: Router) { }

  getUserId() {
    return this.userId;
  }

  getToken() {
    return this.token;
  }

  getIsAuth() {
    return this.isAuthenticatd;
  }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable()
  }

  createUser(email: string, password: string) {
    const authData: AuthData = { email, password }
    this.http.post('http://localhost:3000/api/user/signup', authData)
      .subscribe(response => {
        console.log(response)
        this.login(email, password)
      })
  }

  autoAuthUser() {
    const authInformation = this.getAuthData()
    if (!authInformation) {
      return;
    }
    const now = new Date()
    const expiresIn = new Date(authInformation.expirationDate).getTime() - now.getTime()
    if (expiresIn > 0) {
      this.token = authInformation.token;
      this.userId = authInformation.userId;
      this.isAuthenticatd = true;
      this.authStatusListener.next(true);
      this.setAuthTimer(expiresIn / 1000)
    }
  }

  setAuthTimer(duration: number) {
    this.tokenTimer = setTimeout(() => {
      this.logout()
    }, duration * 1000)
  }

  login(email: string, password: string) {
    const authData: AuthData = { email, password }
    this.http.post<{ token: string, expiresIn: number, userId: string }>('http://localhost:3000/api/user/login', authData)
      .subscribe(result => {
        //console.log(result)
        this.token = result.token
        if (this.token) {
          const expireInDuration = result.expiresIn;
          this.setAuthTimer(expireInDuration)
          const now = new Date();
          const expDate = new Date(now.getTime() + expireInDuration * 1000)
          console.log(expDate)
          this.saveAuthData(this.token, expDate , this.userId)
          this.isAuthenticatd = true;
          this.userId = result.userId;
          this.authStatusListener.next(this.isAuthenticatd);
          this.router.navigate(['/']);
        }
      })
  }

  logout() {
    this.isAuthenticatd = false
    clearInterval(this.tokenTimer)
    this.token = null;
    this.userId = null;
    this.authStatusListener.next(false);
    this.router.navigate(['/'])
    this.clearAuthData();
  }

  private getAuthData() {
    const token = localStorage.getItem('token')
    const expirationDate = localStorage.getItem('expireDate')
    const userId = localStorage.getItem('userId')

    if (!token || !expirationDate) {
      return
    }
    return { token, expirationDate , userId }
  }


  private saveAuthData(token: string, expirationDate: Date, userId : string) {
    localStorage.setItem('token', token)
    localStorage.setItem('expiredDate', expirationDate.toISOString())
    localStorage.setItem('userId', userId)
  }

  private clearAuthData() {
    localStorage.removeItem('token')
    localStorage.removeItem('expiredDate')
    localStorage.removeItem('userId')

  }
}  // e.o.c
