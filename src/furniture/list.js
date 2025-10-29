const TEXTURE_PATH = `./assets/textures/furniture`;

// размеры здесь указаны в сантиметрах
const furnitureList = {
  'bench-pink': {
    textureUrl: `${ TEXTURE_PATH }/bench-pink.png`,
    name: 'Скамейка (розовая)',
    width: 90,
    height: 36
  },

  'desk-chair-manager': {
    textureUrl: `${ TEXTURE_PATH }/desk-chair-manager.png`,
    name: 'Стол менеджера',
    width: 80,
    height: 120
  },

  'desk-chair-warehouse': {
    textureUrl: `${ TEXTURE_PATH }/desk-chair-warehouse.png`,
    name: 'Стол на складе',
    width: 80,
    height: 100 // тут был указан только стол, а нужен еще стул. указал примерно
  },

  'desk-checkout-2': {
    textureUrl: `${ TEXTURE_PATH }/desk-checkout-2.png`,
    name: 'Стол выдачи (2 ячейки)',
    width: 96,
    height: 70
  },

  'desk-checkout-3': {
    textureUrl: `${ TEXTURE_PATH }/desk-checkout-3.png`,
    name: 'Стол выдачи (3 ячейки)',
    width: 140,
    height: 70
  },

  'desk-self-service-small': {
    textureUrl: `${ TEXTURE_PATH }/desk-self-service-small.png`,
    name: 'Стол самообслуживания (маленький)',
    width: 80,
    height: 53
  },

  'desk-self-service-big': {
    textureUrl: `${ TEXTURE_PATH }/desk-self-service-big.png`,
    name: 'Стол самообслуживания (большой)',
    width: 93,
    height: 75
  },

  'fitting-room': {
    textureUrl: `${ TEXTURE_PATH }/fitting-room.png`,
    name: 'Примерочная',
    width: 120,
    height: 120
  },

  'shelving-unit': {
    textureUrl: `${ TEXTURE_PATH }/shelving-unit.png`,
    name: 'Стеллаж',
    width: 100,
    height: 51
  },

  'pallet': {
    textureUrl: `${ TEXTURE_PATH }/pallet.png`,
    name: 'Поддон',
    width: 120,
    height: 80
  },

  'trashcan': {
    textureUrl: `${ TEXTURE_PATH }/trashcan.png`,
    name: 'Урна',
    width: 68,
    height: 48
  },
};

export { furnitureList };
