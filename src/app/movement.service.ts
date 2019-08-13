import {Injectable} from '@angular/core';
import {BehaviorSubject, combineLatest, fromEvent, interval, merge, Observable, Subject} from 'rxjs';
import {distinctUntilChanged, filter, map, mapTo, scan, startWith, switchMap, tap, withLatestFrom} from 'rxjs/operators';
import {DIRECTIONS, Key, SNAKE_LENGTH, SNAKE_START} from './snake/snake.component';

@Injectable({
  providedIn: 'root'
})
export class MovementService {
  score$ = new BehaviorSubject(0);
  snakeMovement$: Observable<{ key: number; direction: { x: number; y: number } }>;

  snake: Array<any> = [];
  apples: Array<any> = [];
  xSide: number;
  ySide: number;
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
  );

  startGame2(x: string, y: string) {
    this.apples$.next([]);
    this.score$.next(0);
    this.xSide = +x;
    this.ySide = +y;

    this.startGame$.next({
      snake: {
        length: SNAKE_LENGTH,
        startPoint: SNAKE_START
      },
    });

    this.generateApple();
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
    let i = Math.floor(Math.random() * ((this.ySide - 1) + 1));
    const j = Math.floor(Math.random() * ((this.xSide - 1) + 1));

    this.apples$.getValue().forEach(apple => {
      if (apple.x === i && apple.y === j) {
        i = Math.floor(Math.random() * ((this.ySide - 1) + 1));
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

    if (yNext > this.ySide - 1) {
      yNext = 0;
    }

    if (yNext < 0) {
      yNext = this.ySide - 1;
    }

    if (xNext < 0) {
      xNext = this.xSide - 1;
    }

    if (xNext > this.xSide - 1) {
      xNext = 0;
    }

    snakeArr.push({x: xNext, y: yNext});

    let newSnakeCell = false;
    snakeArr.forEach(snakeCoord => {
      apples.forEach((apple, index) => {
        if (apple.x === snakeCoord.x && apple.y === snakeCoord.y) {
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
      snakeArr.shift();
    }

    return snakeArr;
  }

  getArrows(arrowsStream: Observable<{key: number, direction: any}>) {
    this.snakeMovement$ = arrowsStream;
  }
}
