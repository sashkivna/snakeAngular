import {Component, OnInit} from '@angular/core';
import {MovementService} from '../movement.service';
import {combineLatest, fromEvent, Observable} from 'rxjs';
import {distinctUntilChanged, filter, scan, startWith} from 'rxjs/operators';

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

  constructor(private movement: MovementService) {
    this.score$ = this.movement.score$;
    this.game$ = this.movement.game$;
    // res = this.game$.pipe(combineLatest(this.keyEvents));
  }

  ngOnInit(): void {
    this.keyEvents = fromEvent(document, 'keydown').pipe(
      filter((event: KeyboardEvent) => (event.keyCode === Key.LEFT) || (event.keyCode === Key.UP) || (event.keyCode === Key.DOWN) || (event.keyCode === Key.RIGHT)),
      startWith({key: 39, direction: DIRECTIONS[39]}),
      scan((acc: {key: number, direction: any}, current: any) => {
        if (Math.abs(acc.key - current.keyCode) === 2) {
          return acc;
        } else {
          current = {key: current.keyCode, direction: DIRECTIONS[current.keyCode]}
          return current;
        }
      }),
      distinctUntilChanged()
    );

    this.movement.getArrows(this.keyEvents);
  }

  start($event: Event, x: string, y: string) {
    $event.preventDefault();
    this.drawField(x, y);
    this.movement.startGame2(x, y);

    // this.game$.subscribe( data => {
    //   debugger;
    //   console.log(data);
    // });
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
