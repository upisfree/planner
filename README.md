# Планировщик помещений ПВЗ
### Управление
E — экспорт планировки
R — скриншот планировки

Фичи:
* работа со стенами
* работа с мебелью

### Про масштаб
100 пикселей в pixi.js берем как 1 метр. Все объекты масштабируем исходя из этого через `sprite.setSize()`.

### Как сжать 3д модель
```bash
npm install --global @gltf-transform/cli

gltf-transform optimize objects_original.glb objects_meshopt.glb --compress meshopt --flatten false --instance false --join false --palette false --prune false --simplify false --weld false --texture-compress auto --texture-size 4096
# конвертим текстуры в ktx2 uastc, который занимает больше места на диске и в vram, но выглядит лучше по качеству
# disk 22 mb, vram 67 mb 
gltf-transform uastc objects_meshopt.glb objects.glb

# если важно максимально сжать, то можно сконвертить в ktx2 etc1, но визуально будет похуже
# disk 4 mb, vram 34 mb 
gltf-transform etc1 objects_meshopt.glb objects.glb
```
