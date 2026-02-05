import { Vector3 } from 'three';

export const PIXI_TO_THREE_COORD_COEF = 50;

// переводим экранные координаты пикси в тришные мировые на глаз
export function pixiToThreeCoords(pixiPoint) {
  return new Vector3(
    pixiPoint.x / PIXI_TO_THREE_COORD_COEF,
    0,
    pixiPoint.y / PIXI_TO_THREE_COORD_COEF
  );
}
