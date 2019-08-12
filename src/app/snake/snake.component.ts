import {Component} from '@angular/core';
import {MovementService} from '../movement.service';

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
  constructor(private movement: MovementService) {
  }

  score$ = this.movement.score$;
  game$ = this.movement.game$;

  start($event: Event, x: string, y: string) {
    this.movement.startGame2($event, x, y);
  }
}
