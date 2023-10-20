'use client';

import React from 'react';
import styles from './Graph.module.css';
import { GraphPeriod, GraphData } from '../../types/donator';

/** Значения по вертикальной оси */
const VERTICAL_SCALE_LABELS: number[] = [0, 500, 1000, 2000, 5000, 10000];

/** Тип анимации для столбцов */
const columnAnimationType = 'height 0.5s';

/** Значения по вертикальной оси, отсортированные по убыванию */
const reversedVerticalScaleItems = [...VERTICAL_SCALE_LABELS].reverse();

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
  const labels = VERTICAL_SCALE_LABELS;
  const [left, right] = findBorderIndexes(labels, value);

  const baseHeight = (left + 1) / labels.length;
  const additionalHeight = (value - labels[left]) / (labels[right] - labels[left]) / labels.length;

  return baseHeight + additionalHeight;
};

/** Компонент Graph */
const Graph: React.FC<{
  isZeroColumnValue: boolean;
  currentPeriod: GraphPeriod;
  graphData: GraphData;
}> = ({ isZeroColumnValue, currentPeriod, graphData }) => {
  const isMonthPeriod = currentPeriod === GraphPeriod.MONTH;

  const {
    graphBox,
    verticalScaleLabels,
    verticalScaleLabel,
    columnValues,
    columnValue,
    columnValueThin,
    horizontalScaleLabels,
    horizontalScaleLabelsExpanded,
    horizontalScaleLabel,
  } = styles;

  return (
    <div className={graphBox}>
      <ul className={verticalScaleLabels}>
        {reversedVerticalScaleItems.map((scaleItem, index) => {
          return (
            <li key={index} className={verticalScaleLabel}>
              {scaleItem}
            </li>
          );
        })}
      </ul>
      <ul className={columnValues}>
        {graphData[currentPeriod].columnValues.map((value, index) => {
          const columnHeight = isZeroColumnValue ? 0 : calculateRelativeColumnHeight(value);
          const columnAnimation = isZeroColumnValue ? '' : columnAnimationType;

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
      <ul className={`${horizontalScaleLabels} ${isMonthPeriod && horizontalScaleLabelsExpanded}`}>
        {graphData[currentPeriod].horizontalScaleLabels.map((label, index) => {
          return (
            <li key={index} className={horizontalScaleLabel}>
              {label}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export { Graph };
