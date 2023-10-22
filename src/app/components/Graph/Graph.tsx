'use client';

import React from 'react';
import styles from './Graph.module.css';
import { GraphPeriod, GraphData } from '../../types/donator';

/** Метки по оси значений */
const VALUE_AXIS_LABELS: number[] = [0, 500, 1000, 2000, 5000, 10000];

/** Метки по оси значений в обратном порядке */
const reversedValueAxisLabels: number[] = [...VALUE_AXIS_LABELS].reverse();

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
/** Рассчитать длину колонки относительно всей оси значений */
const calculateRelativeColumnLength = (value: number) => {
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
  const valueLabels = isMobile ? VALUE_AXIS_LABELS : reversedValueAxisLabels;

  const columns = graphData[currentPeriod]?.columnValues || [];
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
          const columnLength = isZeroColumnValue ? 0 : calculateRelativeColumnLength(value);
          const width = isMobile ? `calc(${columnLength} * 100%)` : '';
          const height = !isMobile ? `calc(${columnLength} * 100%)` : '';

          const columnAnimationType = isMobile ? 'width 0.5s' : 'height 0.5s';
          const columnAnimation = isZeroColumnValue ? '' : columnAnimationType;

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
