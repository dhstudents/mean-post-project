import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from './../auth/auth.service';
import { Subscription } from 'rxjs';



@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  public userIsAuthenticated: boolean = false;
  private authListenerSubs: Subscription;
  constructor(private authService: AuthService) { }

  onLogout() {
    this.authService.logout();
  }


  ngOnInit() {
    this.userIsAuthenticated = this.authService.getIsAuth();
    this.authListenerSubs = this.authService.getAuthStatusListener()
      .subscribe( isAuthenticated => this.userIsAuthenticated = isAuthenticated);

  }
  ngOnDestroy() {
    this.authListenerSubs.unsubscribe();
  }

}
