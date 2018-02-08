import { Component, Optional } from '@angular/core';
import { trigger, style, transition, animate, keyframes, query, stagger } from '@angular/animations';

import { BsDropdownModule } from 'ngx-bootstrap';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [
    trigger('movies', [
      transition('* => *', [
        query(':enter', style({ opacity: 0 }), {optional: false}),
        query(':enter', stagger('300ms', [
          animate('.6s ease-in', keyframes([
            style({opacity: 0, transform: 'translateY(-75%)', offset: 0}),
            style({opacity: .5, transform: 'translateY(35px)',  offset: 0.3}),
            style({opacity: 1, transform: 'translateY(0)',     offset: 1.0}),
          ]))]), {optional: false})
      ])
    ])
  ]
})
export class AppComponent {
  movie: string;
  movies = [];
  lists = {'zero': null, 'one': ['1','2','3'], 'two':['a','b','c'] }
  listNames = []
  currentList: string;

  ngOnInit() {
    this.currentList = Object.keys(this.lists)[0];
    this.movies = this.lists[this.currentList];
    this.listNames = Object.keys(this.lists);
    console.log(Object.keys(this.lists));
  }

  loadList(name) {
    this.movies = this.lists[name]
    console.log(this.lists[name]);
    this.currentList = name;
  }

  addItem() {
    if(this.movie != null && this.movie != '') {
      console.log('called');
      if (this.lists[this.currentList])
        this.lists[this.currentList].push(this.movie)
      else {
        this.lists[this.currentList] = [this.movie]
        this.movies = this.lists[this.currentList]
        this.listNames.push(this.currentList)
      }
    }
  }
}
