import {Component, OnInit} from '@angular/core';
import {MovementService} from '../movement.service';
import {fromEvent, Observable} from 'rxjs';
import {distinctUntilChanged, filter, scan, startWith, tap} from 'rxjs/operators';

export enum Key {
  LEFT = 37,
  RIGHT = 39,
  UP = 38,
  DOWN = 40
}

export const DIRECTIONS = {
  38: {x: -1, y: 0},
  40: {x: 1, y: 0},
  37: {x: 0, y: -1},
  39: {x: 0, y: 1}
};
export const SNAKE_LENGTH = 3;
export const SNAKE_START = {
  x: 0,
  y: 0
};

@Component({
  selector: 'app-snake',
  templateUrl: './snake.component.html',
  styleUrls: ['./snake.component.css']
})
export class SnakeComponent implements OnInit {
  rows;
  keyEvents: Observable<{key: number, direction: { x: number, y: number}}>;
  score$;
  game$;
  table;
  tailCoordinates;

  constructor(private movement: MovementService) {
    this.score$ = this.movement.score$;
    this.game$ = this.movement.game$;
    this.game$.subscribe(
      (data) => this.drawItems(data)
    );
  }

  ngOnInit(): void {
    this.keyEvents = fromEvent(document, 'keydown').pipe(
      filter((event: KeyboardEvent) => (event.keyCode === Key.LEFT) || (event.keyCode === Key.UP) || (event.keyCode === Key.DOWN) || (event.keyCode === Key.RIGHT)),
      startWith({key: 39, direction: DIRECTIONS[39]}),
      scan((acc: {key: number, direction: any}, current: any) => {
        if (Math.abs(acc.key - current.keyCode) === 2) {
          return acc;
        } else {
          current = {key: current.keyCode, direction: DIRECTIONS[current.keyCode]};
          return current;
        }
      }),
      distinctUntilChanged(),
      tap((data) => this.movement.getArrows(data))
    );
  }

  start($event: Event, x: string, y: string) {
    $event.preventDefault();
    this.drawField(x, y);
    this.movement.startGame2(x, y);
  }

  drawField(x: string, y: string) {
    if (this.table) {
      const elem = document.getElementsByClassName('table')[0];
      elem.parentNode.removeChild(elem);
    }
    this.table = document.createElement('div');
    this.table.classList.add('table');
    for (let i = 0; i < +x; i++) {
      const row = document.createElement('div');
      row.classList.add('row');
      for (let j = 0; j < +y; j++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        row.appendChild(cell);
        this.table.appendChild(row);
      }
    }
    document.getElementsByTagName('app-snake')[0].appendChild(this.table);

    this.rows = document.getElementsByClassName('row');
  }

  drawItems(data) {
    if (this.tailCoordinates) {
      this.rows[this.tailCoordinates.x].children[this.tailCoordinates.y].classList.remove('snake');
    }

    if (this.movement.eatenApple) {
      this.rows[this.movement.eatenApple.x].children[this.movement.eatenApple.y].classList.remove('apple');
    }
    const snakeArray = data[0];
    const apples = data[1];
    this.tailCoordinates = snakeArray[0];
    snakeArray.forEach(cell => this.rows[cell.x].children[cell.y].classList.add('snake'));
    apples.forEach(cell => this.rows[cell.x].children[cell.y].classList.add('apple'));
  }
}
