// округляем число до 1-го знака после запятой. причем округляем, отбрасывая дробную часть, а не округляя вверх или вниз
export function round(num) {
  return Math.trunc((num + Number.EPSILON) * 10) / 10;
}
