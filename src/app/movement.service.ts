import {Injectable} from '@angular/core';
import {BehaviorSubject, combineLatest, interval, Observable, Subject} from 'rxjs';
import {map, switchMap, tap, withLatestFrom} from 'rxjs/operators';
import {SNAKE_LENGTH, SNAKE_START} from './constants';

@Injectable({
  providedIn: 'root'
})
export class MovementService {
  score$ = new BehaviorSubject(0);
  snakeMovement$ = new BehaviorSubject({ key: 37, direction:  {x: 0, y: 1}});
  speed$ = new BehaviorSubject(1000);
  gameOver$ = new BehaviorSubject(false);
  snake: Array<any> = [];
  apples: Array<any> = [];
  xSide: number;
  ySide: number;
  ticks$ = interval(this.speed$.getValue());
  bordersMode: boolean;
  apples$ = new BehaviorSubject([]);
  snake$ = new Subject();
  eatenApple: {x: number, y: number};
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
    map(([tick, snakeArr, movement, apples]) => this.moveSnake(tick, snakeArr, movement, apples))
  );

  game$ = combineLatest(
    this.move$
  );

  startGame2(x: string, y: string, bordersMode: string) {
    this.bordersMode = bordersMode === 'no-borders';
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

    // return observable (this.move$)
    return this.move$;
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
    const moveDirection = direction.direction;
    let yNext, xNext;

    yNext = snakeArr[snakeArr.length - 1].y;

    xNext = snakeArr[snakeArr.length - 1].x;

    xNext += moveDirection.x;
    yNext += moveDirection.y;

    if (this.bordersMode) {
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
    } else {
      if (yNext > this.ySide - 1) {
        this.eatenApple = null;
        this.gameOver$.next(true);
      }

      if (yNext < 0) {
        this.eatenApple = null;
        this.gameOver$.next(true);
      }

      if (xNext < 0) {
        this.eatenApple = null;
        this.gameOver$.next(true);
      }

      if (xNext > this.xSide - 1) {
        this.eatenApple = null;
        this.gameOver$.next(true);
      }
    }

    snakeArr.forEach(cell => {
      if (cell.x === xNext && cell.y === yNext) {
        this.eatenApple = null;
        this.gameOver$.next(true);
      }
    });

    snakeArr.push({x: xNext, y: yNext});

    let newSnakeCell = false;
    snakeArr.forEach(snakeCoord => {
      apples.forEach((apple, index) => {
        if (apple.x === snakeCoord.x && apple.y === snakeCoord.y) {
          this.eatenApple = apple;
          this.speed$.next(this.speed$.getValue() - 50);
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

  getArrows(arrowsStream: Observable<{key: number, direction: { x: number, y: number}}>) {
    // @ts-ignore
    this.snakeMovement$.next(arrowsStream);
  }
}
