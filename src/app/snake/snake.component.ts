import {Component, OnInit} from '@angular/core';
import {MovementService} from '../movement.service';
import {fromEvent, Observable, Subscription} from 'rxjs';
import {distinctUntilChanged, filter, scan, startWith, tap} from 'rxjs/operators';
import {FormControl, FormGroup} from '@angular/forms';
import {DIRECTIONS, Key} from '../constants';

@Component({
  selector: 'app-snake',
  templateUrl: './snake.component.html',
  styleUrls: ['./snake.component.css']
})
export class SnakeComponent implements OnInit {
  rows: HTMLCollectionOf<Element>;
  keyEvents: Observable<{key: number, direction: { x: number, y: number}}>;
  score$: Observable<number>;
  game$;
  speed$: Observable<number>;
  gameOver$: Observable<boolean>;
  table: HTMLElement | boolean;
  tailCoordinates: {x: number, y: number};
  borders: string;
  gameSubcription: Subscription;
  gameForm: FormGroup;

  constructor(private movement: MovementService) {
    this.score$ = this.movement.score$;
    this.game$ = this.movement.game$;
    this.speed$ = this.movement.speed$;
    this.gameOver$ = this.movement.gameOver$;
    this.gameSubcription = this.game$.subscribe(
      (data) => this.drawItems(data)
    );
    this.gameOver$.subscribe(
      (data) => {
        if (data) {
          this.gameOver();
        }
      }
    );
  }

  ngOnInit(): void {
    this.gameForm  = new FormGroup({
      borders: new FormControl(''),
      xSide: new FormControl('10'),
      ySide: new FormControl('10')
    });

    this.gameForm.patchValue({borders: 'no-borders', tc: true});

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

  start($event: Event) {
    $event.preventDefault();
    const x = this.gameForm.get('xSide').value;
    const y = this.gameForm.get('ySide').value;
    this.borders = this.gameForm.get('borders').value;
    this.drawField(x, y);
    this.movement.startGame2(x, y, this.borders);

    if (!this.gameSubcription) {
      this.gameSubcription = this.game$.subscribe(
        (data) => this.drawItems(data)
      );
    }
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

  private gameOver() {
    alert('game over');
    this.gameSubcription.unsubscribe();
    const elem = document.getElementsByClassName('table')[0];
    elem.parentNode.removeChild(elem);
    this.table = false;
  }
}
