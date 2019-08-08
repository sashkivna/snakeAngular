import { Component } from '@angular/core';
import {BehaviorSubject, combineLatest, from, fromEvent, interval, merge, Observable, Subject, Subscription} from 'rxjs';
import {distinctUntilChanged, filter, map, mapTo, scan, startWith, switchMap, tap, withLatestFrom} from 'rxjs/operators';

enum Key {
  LEFT = 37,
  RIGHT = 39,
  UP = 38,
  DOWN = 40
}
const DIRECTIONS = {
  38: {x: -1, y: 0},
  40: {x: 1, y: 0},
  37: {x: 0, y: -1},
  39: {x: 0, y: 1}
};
const SNAKE_LENGTH = 3;
const SNAKE_START = {
  x: 0,
  y: 0
};

@Component({
  selector: 'app-snake',
  templateUrl: './snake.component.html',
  styleUrls: ['./snake.component.css']
})
export class SnakeComponent {
  score$ = new BehaviorSubject(0);
  left$: Observable<any> = fromEvent(document, 'keydown').pipe(
    filter((event: KeyboardEvent) => event.keyCode === Key.LEFT)
  );
  up$: Observable<any> = fromEvent(document, 'keydown').pipe(
    filter((event: KeyboardEvent) => event.keyCode === Key.UP)
  );

  down$: Observable<any> = fromEvent(document, 'keydown').pipe(
    filter((event: KeyboardEvent) => event.keyCode === Key.DOWN)
  );

  right$: Observable<any> = fromEvent(document, 'keydown').pipe(
    filter((event: KeyboardEvent) => event.keyCode === Key.RIGHT)
  );
  snakeMovement$: Observable<{key: number; direction: {x: number; y: number}}> = merge(
    this.left$.pipe(mapTo({key: Key.LEFT, direction: DIRECTIONS[37]})),
    this.up$.pipe(mapTo({key: Key.UP, direction: DIRECTIONS[38]})),
    this.down$.pipe(mapTo({key: Key.DOWN, direction: DIRECTIONS[40]})),
    this.right$.pipe(mapTo({key: Key.RIGHT, direction: DIRECTIONS[39]})),
  ).pipe(
    startWith({key: 39, direction: DIRECTIONS[39]}),
    scan((acc, current) => {
      if (Math.abs(acc.key - current.key) === 2) {
        return acc;
      } else {
        return current;
      }
    }),
    distinctUntilChanged(),
  );

  snake: Array<any> = [];
  apples: Array<any> = [];
  ticks$ = interval(1000);

  apples$ = new BehaviorSubject([]);
  snake$ = new Subject();

  startGame$ = new Subject();

  snake2$ = this.startGame$.pipe(
    switchMap((data: {
      snake: {
        length: number;
        startPoint: {}
      }
    }) => this.printSnakeAtTheBeggining(data.snake.length)));

  move$ = this.ticks$.pipe(
    withLatestFrom(this.snake2$, this.snakeMovement$, this.apples$),
    map(([tick, snakeArr, movement, apples]) => {
      this.moveSnake(tick, snakeArr, movement.direction, apples);
    })
  );

  game$ = combineLatest(
      this.move$,
      this.apples$,
      this.snake2$,
      this.ticks$,
      this.snakeMovement$
    ).pipe(
      tap( (data) => console.log(data))
    );

  startGame2() {
    this.startGame$.next({
      snake: {
        length: SNAKE_LENGTH,
        startPoint: SNAKE_START
      },
    });

    this.generateApple();
  }

  printSnakeAtTheBeggining(length) {
    this.snake = [];
    for (let i = 0; i < length; i++) {
      this.snake.push({x: 0, y: i});
    }

    this.snake$.next(this.snake);
    return this.snake$;
  }

  generateApple() {
    let i = Math.floor(Math.random() * ((10 - 1) + 1));
    const j = Math.floor(Math.random() * ((10 - 1) + 1));

    this.apples$.getValue().forEach( apple => {
      if (apple.x === i && apple.y === j) {
        i = Math.floor(Math.random() * ((10 - 1) + 1));
      }
    });

    this.apples$.getValue().push({x: i, y: j});
  }

  moveSnake(tick, snakeArr, direction, apples) {
    let yNext, xNext;

    yNext = snakeArr[snakeArr.length - 1].y;

    xNext = snakeArr[snakeArr.length - 1].x;

    xNext += direction.x;
    yNext += direction.y;

    if (yNext > 10 - 1) {
      yNext = 0;
    }

    if (yNext < 0) {
      yNext = 10 - 1;
    }

    if (xNext < 0) {
      xNext = 10 - 1;
    }

    if (xNext > 10 - 1) {
      xNext = 0;
    }

    // snakeArr.forEach(cell => {
    //   if (cell.x === xNext && cell.y === yNext) {
    //     alert('game over!');
    //   }
    // });
    //
    // this.rows[xNext].children[yNext].classList.add('snake');
    //snakeArr.shift();
    snakeArr.push({x: xNext, y: yNext});

    let newSnakeCell = false;
    snakeArr.forEach(snakeCoord => {
      apples.forEach((apple, index) => {
        if (apple.x === snakeCoord.x && apple.y === snakeCoord.y) {
         // this.rows[this.apples[index].x].children[this.apples[index].y].classList.remove('apple');
          apples.splice(index, 1);

          newSnakeCell = true;
        }
      });
    });

    if (newSnakeCell) {
      this.generateApple();
      this.score$.next(this.score$.getValue() + 1);
    }

    if (!newSnakeCell) {
      //this.rows[snakeArr[0].x].children[snakeArr[0].y].classList.remove('snake');
      snakeArr.shift();
    }

    return snakeArr;
  }

  // redrawMatrix(snake, apples, direction) {
  //   this.moveSnake(snake, direction);
  //   document.getElementsByClassName('score')[0].innerHTML = this.score$.getValue().toString();
  // }
  //
  // fillMatrix(matr) {
  //   // this.printSnakeAtTheBeggining();
  //
  //   this.generateApple();
  //
  //   this.generateApple();
  //
  //   return matr;
  // }

  // startGame($event) {
  //   $event.preventDefault();
  //   if (this.game) {
  //     this.game.unsubscribe();
  //     this.score$.next(0);
  //
  //     this.snake.forEach(cell => this.rows[cell.x].children[cell.y].classList.remove('snake'));
  //     this.apples.forEach(cell => this.rows[cell.x].children[cell.y].classList.remove('apple'));
  //     this.snake = [];
  //     this.apples = [];
  //
  //     this.redrawMatrix(this.snake, this.apples, DIRECTIONS[39]);
  //   }
  //
  //   this.game =  interval(1000)
  //     .pipe(withLatestFrom(this.snakeState$), tap(console.log))
  //     .subscribe(([val, state]) => {
  //       this.redrawMatrix(this.snake, this.apples, state.direction);
  //     });
  //
  //   return  this.game;
  // }

/*
    1) stream Snake (start point, length)
    2) stream Apples (field size)
    3) stream field size
    4) stream start game
    5) stream keyBoard events
    6) stream Game: Snake[{x: 0, y: 0}, {x: 0, y: 1}] = interval => combineLatest(startGame).pipe(withLatest())

 */

/*  drawField($event: Event, x: string, y: string) {
    $event.preventDefault();
    this.nx = x;
    this.ny = y;
    this.nx$ = from(x);
    this.ny$ = from(this.ny);
    this.field$ = this.nx$.pipe(withLatestFrom(this.ny$));
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
  }*/
}
