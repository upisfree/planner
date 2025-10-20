// возвращает из экранной точки точку в мировых координатах с учетом драга
export default function pointScreenToWorld(screenPoint, viewport) {
  return viewport.toWorld(screenPoint.x, screenPoint.y);
}
