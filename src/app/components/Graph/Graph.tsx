'use client';

import React from 'react';
import styles from './Graph.module.css';
import { GraphPeriod, GraphData } from '../../types/donator';

/** Метки по оси значений */
const VALUE_AXIS_LABELS: number[] = [0, 500, 1000, 2000, 5000, 10000];

/** Метки по оси значений в обратном порядке */
const reversedValueAxisLabels: number[] = [...VALUE_AXIS_LABELS].reverse();

/** Типы анимации */
const animationType = {
  width: 'width 0.5s',
  height: 'height 0.5s',
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
  while (left < right) {
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
/** Рассчитать длину колонки относительно всей оси значений */
const calculateRelativeColumnLength = (value: number) => {
  const labels = VALUE_AXIS_LABELS;
  const [left, right] = findBorderIndexes(labels, value);

  /** Количество промежутков между отметками оси значениями */
  const gapsNumber = labels.length - 1;

  /** Доля полностью заполненных промежутков */
  const baseHeight = left / gapsNumber;
  /** Доля заполнения последнего промежутка */
  const additionalHeight = (value - labels[left]) / (labels[right] - labels[left]) / gapsNumber;

  return baseHeight + additionalHeight;
};

/** Получить длину колонки как строку */
const getColumnLengthAsString = (columnLength: number) => {
  return `calc(${columnLength} * 100%)`;
};

/** Компонент Graph */
const Graph: React.FC<{
  isColumnsValueZero: boolean;
  isMobileView: boolean;
  currentPeriod: GraphPeriod;
  graphData: GraphData;
}> = ({ isColumnsValueZero, isMobileView, currentPeriod, graphData }) => {
  /** Выбраны ли данные за последний месяц */
  const isMonthPeriod = currentPeriod === GraphPeriod.MONTH;
  /** Отметки на оси значений */
  const valueLabels = isMobileView ? VALUE_AXIS_LABELS : reversedValueAxisLabels;

  /** Значения столбцов с данными */
  const columns = graphData[currentPeriod]?.columnValues || [];
  /** Отметки на оси времени */
  const timeLabels = graphData[currentPeriod]?.timeAxisLabels || [];

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
          const columnLength = isColumnsValueZero ? 0 : calculateRelativeColumnLength(value);
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
