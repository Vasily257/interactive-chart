'use client';

import React from 'react';
import styles from './Graph.module.css';
import { GraphPeriod, GraphData } from '../../types/donator';

/** Метки по оси значений */
const VALUE_AXIS_LABELS: number[] = [0, 500, 1000, 2000, 5000, 10000];

/** Тип анимации для столбцов */
const COLUMN_ANIMATION_TYPE = 'height 0.5s';

/** Метки по оси значений, отсортированные по убыванию */
const reversevValueAxisLabels = [...VALUE_AXIS_LABELS].reverse();

/** Найти пограничные индексы */
const findBorderIndexes = (array: number[], value: number) => {
  let left: number = 0;
  let right: number = array.length - 1;

  if (value < array[0] || value > array[right]) {
    return [-1, -1];
  }

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

  return [right, left];
};
/** Рассчитать высоту колонки */
const calculateRelativeColumnHeight = (value: number) => {
  const labels = VALUE_AXIS_LABELS;
  const [left, right] = findBorderIndexes(labels, value);

  const baseHeight = (left + 1) / labels.length;
  const additionalHeight = (value - labels[left]) / (labels[right] - labels[left]) / labels.length;

  return baseHeight + additionalHeight;
};

/** Компонент Graph */
const Graph: React.FC<{
  isZeroColumnValue: boolean;
  isMobile: boolean;
  currentPeriod: GraphPeriod;
  graphData: GraphData;
}> = ({ isZeroColumnValue, isMobile, currentPeriod, graphData }) => {
  const isMonthPeriod = currentPeriod === GraphPeriod.MONTH;

  const columns = graphData[currentPeriod]?.columnValues || [];
  const timeLabels = graphData[currentPeriod]?.timeAxisLabels || [];

  const {
    graphBox,
    valueAxisLabels,

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
        {reversevValueAxisLabels.map((scaleItem, index) => {
          return <li key={index}>{scaleItem}</li>;
        })}
      </ul>
      <ul className={columnValues}>
        {columns.map((value, index) => {
          const columnHeight = isZeroColumnValue ? 0 : calculateRelativeColumnHeight(value);
          const columnAnimation = isZeroColumnValue ? '' : COLUMN_ANIMATION_TYPE;

          return (
            <li
              key={index}
              style={{ height: `calc(${columnHeight} * 100%)`, transition: columnAnimation }}
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
