import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {MovementService} from '../movement.service';
import {fromEvent, Observable, of, Subject, Subscription} from 'rxjs';
import {distinctUntilChanged, filter, map, scan, startWith, switchMap, tap, withLatestFrom} from 'rxjs/operators';
import {DIRECTIONS, Key} from '../constants';

@Component({
  selector: 'app-snake',
  templateUrl: './snake.component.html',
  styleUrls: ['./snake.component.css']
})
export class SnakeComponent implements OnInit {
  @ViewChild('table', {static: true}) table: ElementRef;
  rows: HTMLCollectionOf<Element>;
  keyEvents: Observable<{key: number, direction: { x: number, y: number}}>;
  score$: Observable<number>;
  snake$;
  apples$;
  speed$: Observable<number>;
  gameOver$: Observable<boolean>;
  tailCoordinates: {x: number, y: number};
  borders: string;
  gameSubcription: Subscription;
  start$ = new Subject<{x: string, y: string, borders: string}>();

  drawField$ = this.start$.pipe(
    switchMap((data) => {
      this.drawTable(data);
      return of(data);
    })
  );

  drawItems$ = this.drawField$.pipe(
    switchMap((data) => this.movement.startGame(data.x, data.y, data.borders)),
    switchMap((data) => this.drawItems(data))
  );

  constructor(private movement: MovementService) {
    this.score$ = this.movement.score$;
    this.speed$ = this.movement.speed$;
    this.apples$ = this.movement.apples$;
    this.snake$ = this.movement.snake$;
    this.gameOver$ = this.movement.gameOver$;
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

  start(data) {
    this.start$.next(data);
  }

  private gameOver() {
    alert('game over');
    this.gameSubcription.unsubscribe();
    const elem = document.getElementsByClassName('table')[0];
    elem.parentNode.removeChild(elem);
    this.table = undefined;
  }

  drawTable(data) {
    if (this.table.nativeElement) {
      const elem = document.getElementsByClassName('table')[0];
      elem.parentNode.removeChild(elem);
    }
    this.table.nativeElement = document.createElement('div');
    this.table.nativeElement.classList.add('table');
    for (let i = 0; i < +data.x; i++) {
      const row = document.createElement('div');
      row.classList.add('row');
      for (let j = 0; j < +data.y; j++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        row.appendChild(cell);
        this.table.nativeElement.appendChild(row);
      }
    }
    document.getElementsByTagName('app-snake')[0].appendChild(this.table.nativeElement);

    this.rows = document.getElementsByClassName('row');
  }

  drawItems(data) {
    if (this.tailCoordinates) {
      this.rows[this.tailCoordinates.x].children[this.tailCoordinates.y].classList.remove('snake');
    }

    if (this.movement.eatenApple) {
      this.rows[this.movement.eatenApple.x].children[this.movement.eatenApple.y].classList.remove('apple');
    }
    const snakeArray = data.value.snake;
    const apples = data.value.apples;
    this.tailCoordinates = snakeArray[0];
    snakeArray.forEach((cell: {x: number, y: number}) => this.rows[cell.x].children[cell.y].classList.add('snake'));
    apples.forEach((cell: {x: number, y: number}) => this.rows[cell.x].children[cell.y].classList.add('apple'));
    return of({snakeArray, apples});
  }
}
