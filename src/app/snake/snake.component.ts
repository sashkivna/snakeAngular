import {Component} from '@angular/core';
import {MovementService} from '../movement.service';
import {fromEvent, Observable} from 'rxjs';
import {filter} from 'rxjs/operators';

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
export class SnakeComponent {
  rows;
  left$;
  up$;
  down$;
  right$;

  constructor(private movement: MovementService) {
  }

  score$ = this.movement.score$;
  game$ = this.movement.game$;

  start($event: Event, x: string, y: string) {
    $event.preventDefault();
    // this.drawField(x, y);
    // this.rows = document.getElementsByClassName('row');
    this.left$ = this.getKeydownLeft(document, Key.LEFT);
    this.up$ = this.getKeydownUp(document, Key.UP);
    this.down$ = this.getKeydownDown(document, Key.DOWN);
    this.right$ = this.getKeydownRight(document, Key.RIGHT);

    this.movement.startGame2(this.left$, this.down$, this.up$, this.right$, x, y);
  }

  getKeydownLeft(doc, key) {
    return fromEvent(doc, 'keydown').pipe(
      filter((event: KeyboardEvent) => event.keyCode === key)
    );
  }

  getKeydownUp(doc, key) {
    return fromEvent(doc, 'keydown').pipe(
      filter((event: KeyboardEvent) => event.keyCode === key)
    );
  }

  getKeydownRight(doc, key) {
    return fromEvent(doc, 'keydown').pipe(
      filter((event: KeyboardEvent) => event.keyCode === key)
    );
  }

  getKeydownDown(doc, key) {
    return fromEvent(doc, 'keydown').pipe(
      filter((event: KeyboardEvent) => event.keyCode === key)
    );
  }

  drawField(x: string, y: string) {
    const table = document.createElement('div');
    table.classList.add('table');
    for (let i = 0; i < +x; i++) {
      const row = document.createElement('div');
      row.classList.add('row');
      for (let j = 0; j < +y; j++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        row.appendChild(cell);
        table.appendChild(row);
      }
    }
    document.getElementsByTagName('app-snake')[0].appendChild(table);
  }
}
