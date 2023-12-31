/** Добавить ноль в начале числа
 * @param number число (обязательное)
 */
export default function addLeadingZero(number: number): string {
  if (number >= 1 && number <= 9) {
    return `0${number}`;
  } else {
    return number.toString();
  }
}
