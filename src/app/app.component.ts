import { Component, Input, Optional } from '@angular/core';
import { get, post, head } from 'request';
import {trigger, state, style, animate, transition } from '@angular/animations';
import { API } from '../config';
import { environment } from '../environments/environment.prod';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [
    trigger('sidebar', [
      state('inactive', style({
        background: "ffff",
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
    ])
  ]
})

export class AppComponent {
  newMovie: string;
  newList: string;
  movies = [];
  lists = {}
  listNames = []
  currentList: string;
  sidebar = {
    state: 'inactive',
    toggleState: () => {
      this.sidebar.state = this.sidebar.state == 'active' ? 'inactive' : 'active'
    }
  }

  ngOnInit() {
    get({ url: API }, (error, response, body) => {
        console.log(body);
        let res= JSON.parse(body);
        this.lists = res;
        this.currentList = Object.keys(res)[0];
        this.movies = res[this.currentList];
        this.listNames = Object.keys(res);
        console.log(this.lists);
        console.log(this.movies);
    });
  }

  loadList(name) {
    this.movies = [];
    this.movies = this.lists[name];
    this.currentList = name;
  }

  addMovie() {
    if(this.newMovie != null && this.newMovie != '') {
      this.addtodb();
      if (this.lists[this.currentList])
        this.lists[this.currentList].push(this.newMovie)
      else {
        this.lists[this.currentList] = [this.newMovie]
        this.movies = this.lists[this.currentList]
        this.listNames.push(this.currentList)
      }
      this.newMovie = '';
    }
  }

  createList() {
    head({ url: API, qs: { "name" : this.newList} });
    this.currentList = this.newList;
    this.lists[this.newList] = [];
    this.listNames.push(this.newList);
    this.movies = [];
    this.newList = '';
  }

  addtodb() {
    post({ 
        url: API,
        form: {name: this.newMovie,list: this.currentList },
        json: true
      },
      (error, res, stuff) => { console.log(error, stuff, res); }
    );
  }
}
