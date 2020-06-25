import { Post } from './post.model';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs'  // similar to EventEmitter
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class PostsService {
  private posts: Post[] = []
  private postsUpdated = new Subject<{posts: Post[] , count : number}>();

  constructor(private http: HttpClient, private router: Router) {
  }

  getPosts(postPerPage: number, currentPage: number) {
    const queryParams = `?pagesize=${postPerPage}&page=${currentPage}`
    this.http.get<{ message: string, posts: any, count: number }>('http://localhost:3000/api/posts' + queryParams)
      .pipe(
        map(responseData => {
          return {
            posts: responseData.posts.map((post) => {
              return {
                id: post._id,
                title: post.title,
                content: post.content,
                imagePath: post.imagePath,
                creator: post.creator
              }
            }), count : responseData.count
          }
        }))
      .subscribe((postsRes) => {
        this.posts = postsRes.posts;
        this.postsUpdated.next({posts: [...this.posts], count : postsRes.count})
      })
  }

  getPostUpdatelistener() {
    return this.postsUpdated.asObservable()
  }

  getPost(id: string) {
    //  return { ...this.posts.find(post => post.id === id) }
    return this.http.get<{ _id: string, title: string, content: string, imagePath: string , creator: string }>(`http://localhost:3000/api/posts/${id}`)
  }

  addPost(title: string, content: string, image: File) {
    // const post: Post = { id: null, title, content }  // {titile : title , title: content}
    const postData = new FormData()
    postData.append('title', title)
    postData.append('content', content)
    postData.append('image', image, title)
    this.http.post<{ message: string, post: Post }>('http://localhost:3000/api/posts', postData)
      .subscribe(
        (responseData) => {
        // const post: Post = { id: responseData.post.id, title, content, imagePath: responseData.post.imagePath }
        // this.posts.push(post);
        this.informChangeAndGotoHome()
      })
  }

  updatePost(id: string, title: string, content: string, image: File | string) {
    let postData: FormData | Post;
    if (typeof image === 'object') {
      postData = new FormData();
      postData.append('id', id)
      postData.append('title', title)
      postData.append('content', content)
      postData.append('image', image, title)
    } else {
      postData = { id, title, content, imagePath: image , creator: null }
    }
    this.http.put(`http://localhost:3000/api/posts/${id}`, postData)
      .subscribe((response) => {
        // const updatedPosts = [...this.posts] // clone array;
        // const oldPostIndex = updatedPosts.findIndex(p => p.id === id)
        // const post: Post = {
        //   id, title, content, imagePath: image as string
        // }
        // updatedPosts[oldPostIndex] = post;
        // this.posts = updatedPosts;
        this.informChangeAndGotoHome();
      })
  }


  // helper function
  private informChangeAndGotoHome() {
   // this.postsUpdated.next([...this.posts]);  // raise event
    this.router.navigate(['/']);
  }

  deletePost(postId: string) {
    return this.http.delete(`http://localhost:3000/api/posts/${postId}`)
      // .subscribe(() => {
      //   console.log('Deleted!!!!')
      //   const updatedPosts = this.posts.filter(post => post.id !== postId)
      //   this.posts = updatedPosts;
      //   this.postsUpdated.next([...this.posts])
      // })
  }




} // end of class service

