import {Injectable} from '@angular/core';
import {BehaviorSubject, combineLatest, fromEvent, interval, merge, Observable, Subject, Subscription} from 'rxjs';
import {distinctUntilChanged, filter, map, mapTo, scan, startWith, switchMap, takeUntil, tap, withLatestFrom} from 'rxjs/operators';
import {DIRECTIONS, Key, SNAKE_LENGTH, SNAKE_START} from './snake/snake.component';

@Injectable({
  providedIn: 'root'
})
export class MovementService {
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
  snakeMovement$: Observable<{ key: number; direction: { x: number; y: number } }> = merge(
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
  game: Subscription;
  rows;
  snake: Array<any> = [];
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
  ).pipe(
    tap((data) => console.log(data))
    // takeUntil(this.move$)
  );

  static drawField(x: string, y: string) {
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

  startGame2($event: Event, x: string, y: string) {
    $event.preventDefault();
    this.rows = document.getElementsByClassName('row');

    this.xSide = +x;
    this.ySide = +y;

    MovementService.drawField(x, y);

    if (this.game) {
      this.unsubscribe();
    }

    this.game = this.game$
      .subscribe(() => this.startGame$.next({
        snake: {
          length: SNAKE_LENGTH,
          startPoint: SNAKE_START
        },
      }));

    this.generateApple();
    this.generateApple();
  }

  unsubscribe() {
    this.game.unsubscribe();
    this.score$.next(0);

    this.snake.forEach(cell => this.rows[cell.x].children[cell.y].classList.remove('snake'));
    this.apples$.getValue().forEach(cell => this.rows[cell.x].children[cell.y].classList.remove('apple'));
    this.apples$.next([]);

    const elem = document.getElementsByClassName('table')[0];
    elem.parentNode.removeChild(elem);

    this.startGame$.next({
      snake: {
        length: SNAKE_LENGTH,
        startPoint: SNAKE_START
      },
    });
  }

  printSnakeAtTheBeggining(length) {
    this.snake = [];
    for (let i = 0; i < length; i++) {
      this.snake.push({x: 0, y: i});
      this.rows[0].children[i].classList.add('snake');
    }

    this.snake$.next(this.snake);
    return this.snake$;
  }

  generateApple() {
    let i = Math.floor(Math.random() * ((this.xSide - 1) + 1));
    const j = Math.floor(Math.random() * ((this.ySide - 1) + 1));

    while (this.rows[i].children[j].className === 'cell snake') {
      i = Math.floor(Math.random() * ((this.xSide - 1) + 1));
    }

    this.apples$.getValue().forEach(apple => {
      if (apple.x === i && apple.y === j) {
        i = Math.floor(Math.random() * ((this.ySide - 1) + 1));
      }
    });
    this.rows[i].children[j].classList.add('apple');
    this.apples$.getValue().push({x: i, y: j});
  }

  moveSnake(tick, snakeArr, direction, apples) {
    snakeArr.forEach(cell => this.rows[cell.x].children[cell.y].classList.add('snake'));
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

    this.gameOver(snakeArr, xNext, yNext);

    this.rows[xNext].children[yNext].classList.add('snake');

    snakeArr.push({x: xNext, y: yNext});

    let newSnakeCell = false;
    snakeArr.forEach(snakeCoord => {
      apples.forEach((apple, index) => {
        if (apple.x === snakeCoord.x && apple.y === snakeCoord.y) {
          this.rows[apples[index].x].children[apples[index].y].classList.remove('apple');
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
      this.rows[snakeArr[0].x].children[snakeArr[0].y].classList.remove('snake');
      snakeArr.shift();
    }

    return snakeArr;
  }

  gameOver(snakeArr, xNext, yNext) {
    snakeArr.forEach(cell => {
      if (cell.x === xNext && cell.y === yNext) {
        alert('game over!');
      }
    });
  }
}

