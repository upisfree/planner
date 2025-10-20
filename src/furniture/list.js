const TEXTURE_PATH = `./assets/textures/furniture`;

const furnitureList = {
  'bench': {
    textureUrl: `${ TEXTURE_PATH }/bench.png`,
    name: 'Скамейка'
  },

  'desk-manager': {
    textureUrl: `${ TEXTURE_PATH }/desk-manager.png`,
    name: 'Стол менеджера'
  },

  'desk-warehouse': {
    textureUrl: `${ TEXTURE_PATH }/desk-warehouse.png`,
    name: 'Стол самообслуживания'
  },

  'desk-self-service': {
    textureUrl: `${ TEXTURE_PATH }/desk-self-service.png`,
    name: 'Стол на складе'
  },

  'fitting-room': {
    textureUrl: `${ TEXTURE_PATH }/fitting-room.png`,
    name: 'Примерочная'
  },

  'shelving-unit': {
    textureUrl: `${ TEXTURE_PATH }/shelving-unit.png`,
    name: 'Стеллаж'
  },
};

export { furnitureList };
