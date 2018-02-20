import { Component, Input, Optional, NgZone } from '@angular/core';
import { get, post } from 'request';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { API, DB, api_key } from '../config';
import { uniqBy, remove, trim, map } from 'lodash';
import { GoogleSignInSuccess } from 'angular-google-signin';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [
    trigger('sidebar', [
      state('inactive', style({
        width: '40px'
      })),
      state('active',   style({
        width: '200px'
      })),
      transition('inactive => active', animate('0.3s ease', style({
        width:'200px'
      }))),
      transition('active => inactive', animate('0.3s ease', style({
        width:'40px'
      }))),
    ]),
    trigger('lists', [
      state('inactive', style({
        display:'none'
      })),
      transition('inactive => active', animate('0.3s ease', style({
        opacity:'1'
      }))),
      transition('inactive => active', animate('.5s ease-in-out'))
    ]),
    trigger('error', [
      state('none', style({
        display: 'none'
      })),
      transition('* => *', animate('100ms ease-in'))
    ])
  ]
})

export class AppComponent {

  constructor(private _ngZone: NgZone) {}

  private myClientId: string = '225745065308-le24eciknujgmg86a2n3di4iunse7mar.apps.googleusercontent.com';

  onGoogleSignInSuccess(event: GoogleSignInSuccess, loginState) {
    let googleUser: gapi.auth2.GoogleUser = event.googleUser;
    this.userId = googleUser.getId();
    get({ url: API + 'getAll.php', qs:{'UID':this.userId}}, (error, response, body) => {
      this._ngZone.run(() => {
        let res= JSON.parse(body);
        this.lists = res;
        this.currentList = Object.keys(res)[0];
        this.listNames = Object.keys(res);
      });
    });
  }

  errorMessage: string = 'none';
  userId: string;
  newMovie: string;
  newList: string;
  suggestions = []
  lists = {}
  listNames = []
  currentList: string;
  sidebar = {
    state: 'active',
    toggleState: () => {
      this.sidebar.state = this.sidebar.state == 'active' ? 'inactive' : 'active'
    }
  }

  textChanged(event) {
    this.newMovie = event;
    if(event.length) {
      get(DB + event.replace(' ', '%20'), (err, res, body) => {
        body = JSON.parse(body);
        console.log(body);
        this.suggestions = body.errors ? [] : uniqBy(body.results, (res) => res.original_title);
      })
    }
  }

  loadList(name) {
    this.currentList = name;
  }

  addMovie() {
    if(this.newMovie != null && this.newMovie != '') {
      if(!map(this.suggestions, (entry) => entry.original_title.toLowerCase()).includes(this.newMovie.toLowerCase())) {
        this.errorMessage = 'Could not find movie';
        setTimeout(() => this.errorMessage = null, 2000);
        return;
      }
      if (map(this.lists[this.currentList], (entry) => entry.name.toLowerCase()).includes(this.newMovie.toLowerCase())) {
        this.errorMessage = 'Movie already in list';
        return;
      }
      this.createMovie(this.newMovie);
    }
  }

  createList() {
    if(this.newList != null && this.newList!= '') {
      post({ 
        url: API + 'createList.php',
        form: { "name" : this.newList, 'userId': this.userId },
        json: true
      });
      this.currentList = this.newList;
      this.lists[this.newList] = [];
      this.listNames.push(this.newList);
      this.newList = '';
    }
  }

  deleteList(name) {
    post({ 
      url: API + 'deleteList.php',
      form: {name: name, UID: this.userId },
      json: true
      },
      // (error, res, body) => { console.log(error, res, body); }
    );
    delete this.lists[name];
    remove(this.listNames, lname => lname == name);
    this.currentList = this.listNames[0];
  }

  deleteMovie(event) {
    post({ 
      url: API + 'deleteMovie.php',
      form: {name: event,list: this.currentList, UID: this.userId },
      json: true
      },
      // (error, res, body) => { console.log(error, res, body); }
    );
    remove(this.lists[this.currentList], entry => entry.name == event);
  }

  //TODO: add more database information including poster url to put picture in movie list
  createMovie(name) {
    let movieId = this.suggestions.filter((entry) => entry.original_title.toLowerCase() == this.newMovie.toLowerCase())[0].id;
    get('https://api.themoviedb.org/3/movie/' + movieId + '?api_key='+ api_key + '&language=en-US',
      (error, res, body) => { 
        body = JSON.parse(body)
        if (this.lists[this.currentList])
            this.lists[this.currentList].push({ name: body.original_title, link: body.homepage })
          else {
            this.lists[this.currentList] = [body.original_title]
            this.listNames.push(this.currentList)
          }
          this.suggestions = [];
          this.newMovie = '';
        post({
            url: API + 'createMovie.php',
            form: {name: body.original_title, link: body.homepage, list: this.currentList},
            json: true
          },
          // (error, res, body) => { console.log(error, body, res); }
        );
      }
    );
  }
}
