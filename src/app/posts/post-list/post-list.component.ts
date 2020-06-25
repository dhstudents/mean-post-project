import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Post } from '../post.model';
import { PostsService } from './../posts.service';

import { Subscription } from 'rxjs';

import { PageEvent } from '@angular/material/paginator';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy {
  // posts = [
  //   {title: 'title #1' , content: 'content #1'},
  //   {title: 'title #2' , content: 'content #2'},
  //   {title: 'title #3' , content: 'content #3'}
  // ]
  // @Input() posts: Post[] = []
  posts: Post[] = [];
  postsSub: Subscription;;
  isLoading: boolean = false;

  // paginator
  totalPosts: number = 0;
  postPerPage = 2;
  currentPage = 1;
  pageSizeOptions = [1, 2, 5, 10]

  authStatusSubs: Subscription;
  userIsAutenticated: boolean = false;


  constructor(public postsService: PostsService, private authService: AuthService) { }

  ngOnInit() {
    this.isLoading = true;
    this.postsService.getPosts(this.postPerPage, this.currentPage);
    this.postsSub = this.postsService.getPostUpdatelistener()
      .subscribe((postsData: { posts: Post[], count: number }) => {
        this.isLoading = false;
        this.totalPosts = postsData.count
        this.posts = postsData.posts;
      })     // next , error , complete
    this.userIsAutenticated = this.authService.getIsAuth();
    this.authStatusSubs = this.authService.getAuthStatusListener()
      .subscribe(isAuthenticated => {
        this.userIsAutenticated = isAuthenticated;
      });
  }

  ngOnDestroy() {
    this.postsSub.unsubscribe()
    this.authStatusSubs.unsubscribe()
  }

  onDelete(postId: string) {
    this.postsService.deletePost(postId)
      .subscribe(() => {
        this.postsService.getPosts(this.postPerPage, this.currentPage);
      })
  }
  // import PageEvent from material

  onChangedPage(pageData: PageEvent) {
    this.isLoading = true;
    this.postPerPage = pageData.pageSize;
    this.currentPage = pageData.pageIndex;
    this.postsService.getPosts(this.postPerPage, this.currentPage);
  }
}
