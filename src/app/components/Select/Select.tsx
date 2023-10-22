'use client';

import React, { MouseEventHandler } from 'react';
import styles from './Select.module.css';
import { GraphPeriod } from '../../types/donator';

/** Описания периодов */
const GRAPH_PERIOD_TEXT = {
  [GraphPeriod.YEAR]: 'За последний год',
  [GraphPeriod.HALF_YEAR]: 'За последние 6 месяцев',
  [GraphPeriod.MONTH]: 'За последний месяц',
};

/** Получить список периодов, кроме текущего */
const getUnselectedPeriods = (currentPeriod: GraphPeriod) => {
  return Object.entries(GRAPH_PERIOD_TEXT)
    .filter(([periodKey]) => periodKey !== currentPeriod)
    .map(([periodKey, periodValue]) => ({ periodKey, periodValue }));
};

/** Компонент Select */
const Select: React.FC<{
  isSelectOpen: boolean;
  currentPeriod: GraphPeriod;
  handleClickOnSelectButtonTop: MouseEventHandler;
  handleClickOnSelectButtonBottom: MouseEventHandler;
}> = ({
  isSelectOpen,
  currentPeriod,
  handleClickOnSelectButtonTop,
  handleClickOnSelectButtonBottom,
}) => {
  const unselectedPeriods = getUnselectedPeriods(currentPeriod);

  const {
    box,
    button,
    buttonTop,
    currentValue,
    icon,
    iconReversed,
    values,
    valuesShown,
    value,
    buttonBottom,
  } = styles;

  return (
    <div className={box}>
      <button className={`${button} ${buttonTop}`} onClick={handleClickOnSelectButtonTop}>
        <span className={currentValue}>{GRAPH_PERIOD_TEXT[currentPeriod]}</span>
        <span className={`${icon} ${isSelectOpen && iconReversed}`}></span>
      </button>

      <ul className={`${values} ${isSelectOpen && valuesShown}`}>
        {unselectedPeriods.map((period, index) => {
          return (
            <li key={index} className={value}>
              <button
                className={`${button} ${buttonBottom}`}
                onClick={handleClickOnSelectButtonBottom}
                id={`select-button-bottom-${period.periodKey}`}
              >
                {period.periodValue}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export { Select };
