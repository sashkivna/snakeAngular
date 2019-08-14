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
