// спаунит html список всей мебели, которую можно перетаскивать на канвас
// TODO: переделать это в реакте
import { furnitureList } from './list.js';
import Furniture from './furniture.js';

let currentDraggingFurniture;
let currentMouseDownTarget; // нужно, чтобы определить, что мы начали драг на элементе

function spawnFurnitureList(planner) {
  const container = document.getElementById('furniture-list');

  // сбрасываем текущий драг при отпускании мышки
  window.addEventListener('pointerup', (event) => {
    currentDraggingFurniture = null;
    currentMouseDownTarget = null;
  });

  Object.entries(furnitureList).forEach((entry) => {
    const key = entry[0];
    const value = entry[1];

    const div = document.createElement('div');
    div.classList.add('furniture');
    div.addEventListener('pointerdown', onFurnitureMouseDown);
    div.addEventListener('pointermove', onFurnitureMouseMove.bind(null, key, planner));

    const img = document.createElement('img');
    img.src = value.textureUrl;
    img.setAttribute('draggable', false);

    const text = document.createElement('p');
    text.textContent = value.name;

    div.append(img, text);

    container.append(div);
  });
}

function onFurnitureMouseDown(event) {
  currentMouseDownTarget = event.currentTarget;
}

function onFurnitureMouseMove(id, planner, event) {
  const isPressed = event.buttons === 1;

  if (isPressed && !currentDraggingFurniture && currentMouseDownTarget === event.currentTarget) {
    planner.enableFurnitureTool();

    currentDraggingFurniture = new Furniture(planner, id);
    currentDraggingFurniture.onMouseDown(null, true);
  }
}

export default spawnFurnitureList;
