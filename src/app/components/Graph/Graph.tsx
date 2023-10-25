'use client';

import React from 'react';
import styles from './Graph.module.css';
import { GraphColumns } from '../../types/donator';

/** Пропсы компонента Graph */
interface Props {
  /** Обнулены ли значения в столбцах графика */
  isColumnsValueZero: boolean;
  /** Мобильная ли ориентация */
  isMobileView: boolean;
  /** Выбран ли период за последний месяц */
  isMonthPeriod: boolean;
  /** Данные выбранного периода */
  currentPeriodData: GraphColumns;
}

/** Количество промежутков между отметками на оси значений */
const gapsNumberOnValueAxis = 5;

/** Типы анимации */
const animationType = {
  width: 'width 0.5s',
  height: 'height 0.5s',
};

/** Получить отметки оси значений
 * @param maxValue максимальное значение на оси значений (обязательное)
 */
const getLabelsOfValueAxis = (maxValue: number) => {
  const labels: number[] = [];

  /** Длина промежутка между отметками (цена деления) */
  const gapLength = Math.ceil(maxValue / gapsNumberOnValueAxis / 1000) * 1000;

  for (let i = 0; i < gapsNumberOnValueAxis + 1; i++) {
    labels.push(i * gapLength);
  }

  return labels;
};

/** Найти пограничные индексы
 * @param array массив со значениями (обязательное)
 * @param value значение, которое сравнивается со значениями массива (обязательное)
 */
const findBorderIndexes = (array: number[], value: number) => {
  let left: number = 0;
  let right: number = array.length - 1;

  // Обработать случай, если сравниваемое значение
  // находится выходит за пределы значений массива
  if (value < array[0] || value > array[right]) {
    return [-1, -1];
  }

  // Найти пограничные индексы
  while (left <= right) {
    if (array[left] < value) {
      left += 1;
    } else {
      return [left - 1, left];
    }

    if (array[right] > value) {
      right -= 1;
    } else {
      return [right, right + 1];
    }
  }

  // Обработать случай, если сравниваемое значение
  // находится выходит между серединными значениями массива
  return [right, left];
};

/**
 * Рассчитать длину колонки относительно всей оси значений
 * @param value значение колонки в единицах оси значений (обязательное)
 * @param labels отметки на оси значений (обязательное)
 */
const calculateRelativeColumnLength = (value: number, labels: number[]) => {
  const [left, right] = findBorderIndexes(labels, value);

  /** Доля полностью заполненных промежутков */
  const baseHeight = left / gapsNumberOnValueAxis || 0;

  /** Доля заполнения последнего промежутка */
  const additionalHeight =
    (value - labels[left]) / (labels[right] - labels[left]) / gapsNumberOnValueAxis || 0;

  return baseHeight + additionalHeight;
};

/** Получить длину колонки как строку */
const getColumnLengthAsString = (columnLength: number) => {
  return `calc(${columnLength} * 100%)`;
};

/** Компонент Graph */
const Graph: React.FC<Props> = ({
  isColumnsValueZero,
  isMobileView,
  isMonthPeriod,
  currentPeriodData,
}) => {
  /** Отметки на оси значений в порядке возрастания */
  const valueLabelsInAscendingOrder = getLabelsOfValueAxis(currentPeriodData.maxValue);

  /** Отметки на оси значений */
  const valueLabels = isMobileView
    ? valueLabelsInAscendingOrder
    : [...valueLabelsInAscendingOrder].reverse();

  /** Значения столбцов с данными */
  const columns = currentPeriodData?.columnValues || [];

  /** Отметки на оси времени */
  const timeLabels = currentPeriodData?.timeAxisLabels || [];

  const {
    graphBox,
    valueAxisLabels,
    valueAxisLabel,
    columnValues,
    columnValue,
    columnValueThin,
    timeAxisLabels,
    timeAxisLabelsExpanded,
    timeAxisLabel,
  } = styles;

  return (
    <div className={graphBox}>
      <ul className={valueAxisLabels}>
        {valueLabels.map((scaleItem, index) => {
          return (
            <li className={valueAxisLabel} key={index}>
              {scaleItem}
            </li>
          );
        })}
      </ul>
      <ul className={columnValues}>
        {columns.map((value, index) => {
          const columnLength = isColumnsValueZero
            ? 0
            : calculateRelativeColumnLength(value, valueLabelsInAscendingOrder);

          const width = isMobileView ? getColumnLengthAsString(columnLength) : '';
          const height = !isMobileView ? getColumnLengthAsString(columnLength) : '';

          const columnAnimationType = isMobileView ? animationType.width : animationType.height;
          const columnAnimation = isColumnsValueZero ? '' : columnAnimationType;

          return (
            <li
              key={index}
              style={{ width: width, height: height, transition: columnAnimation }}
              className={`${columnValue} ${isMonthPeriod && columnValueThin}`}
              data-value={value}
            ></li>
          );
        })}
      </ul>
      <ul className={`${timeAxisLabels} ${isMonthPeriod && timeAxisLabelsExpanded}`}>
        {timeLabels.map((label, index) => {
          return (
            <li key={index} className={timeAxisLabel}>
              {label}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export { Graph };
