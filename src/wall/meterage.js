import { Point, Text } from 'pixi.js';
import { METER } from '../config.js';
import { round } from '../utils/round.js';

// подпись с метражом стены
class WallMeterage {
  text = null;

  constructor(tool) {
    this.tool = tool;
    this.planner = tool.planner;
    this.viewport = tool.planner.viewport;

    this.text = new Text({
      text: '1 м',
      style: {
        fill: '#000000',
        fontSize: 22,
        fontFamily: 'sans-serif',
      },
      resolution: 2,
      anchor: 0.5
    });

    this.text.anchor.y = 1.5;
    this.text.position.set(100_000, 100_000); // ставим подальше, чтобы до первого рисования не было видно метки

    this.viewport.addChild(this.text);

    this.disable();
  }

  enable() {
    this.text.visible = true;
  }

  disable() {
    this.text.visible = false;
  }

  update(point1, point2) {
    // считаем дистанцию и обновляем текст
    const distance = Math.hypot(
      point2.x - point1.x,
      point2.y - point1.y
    ) / METER;

    this.text.text = round(distance);
    this.text.text = this.text.text.replace('.', ',') + ' м';

    // обновляем поворот текста
    let angle = Math.atan2(
      point2.y - point1.y,
      point2.x - point1.x
    );

    // следим за углом, чтобы надпись не была перевёрнута
    if (
      (angle > Math.PI / 2 && angle < Math.PI) || // 1,57...3,14
      (angle < -Math.PI / 2 && angle > -Math.PI) // -1,57...-3,14
    ) {
      angle += Math.PI;
    }

    this.text.rotation = angle;

    // обновляем позицию текста
    const position = new Point(
      // берем позицию первой точки и отнимаем от нее половину разницы между первой и второй точкой
      point1.x - (point1.x - point2.x) * 0.5,
      point1.y - (point1.y - point2.y) * 0.5
    );

    this.text.position.copyFrom(position);
  }
}

export default WallMeterage;
