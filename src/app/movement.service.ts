import {Injectable} from '@angular/core';
import {BehaviorSubject, combineLatest, interval, Observable, of, Subject} from 'rxjs';
import {map, tap, withLatestFrom} from 'rxjs/operators';
import {SNAKE_LENGTH, SNAKE_START} from './constants';

export interface Snake {
  snake: {
    length: number;
    startPoint: {}
  };
}

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

  startGame(x: string, y: string, bordersMode: string) {
    console.log('game started at the server');
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
    this.printSnakeAtTheBeggining(SNAKE_LENGTH);

    this.generateApple();
    this.generateApple();

    return this.ticks$.pipe(
      withLatestFrom(this.apples$, this.snakeMovement$));
  }

  printSnakeAtTheBeggining(length) {
    console.log('printed snake at the beggining');
    this.snake = [];
    for (let i = 0; i < length; i++) {
      this.snake.push({x: 0, y: i});
    }

    this.snake$.next(this.snake);
    return this.snake$;
  }

  generateApple() {
    console.log('apple geenrated');
    let i = Math.floor(Math.random() * ((this.ySide - 1) + 1));
    const j = Math.floor(Math.random() * ((this.xSide - 1) + 1));

    this.apples$.getValue().forEach(apple => {
      if (apple.x === i && apple.y === j) {
        i = Math.floor(Math.random() * ((this.ySide - 1) + 1));
      }
    });

    this.apples$.getValue().push({x: i, y: j});

    return this.apples$;
  }

  moveSnake(tick, data, direction) {
    const moveDirection = direction.direction;
    let yNext, xNext;
    const snakeArr = this.snake;

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
      this.apples$.getValue().forEach((apple, index) => {
        if (apple.x === snakeCoord.x && apple.y === snakeCoord.y) {
          this.eatenApple = apple;
          this.speed$.next(this.speed$.getValue() - 50);
          this.apples$.getValue().splice(index, 1);
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
    this.snake$.next(snakeArr);
  }

  getArrows(arrowsStream: Observable<{key: number, direction: { x: number, y: number}}>) {
    // @ts-ignore
    this.snakeMovement$.next(arrowsStream);
  }
}
