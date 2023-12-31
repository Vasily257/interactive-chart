'use client';

import React, { MouseEventHandler, useEffect, useRef } from 'react';
import styles from './Select.module.css';
import { GraphPeriod } from '../../types/donator';

/** Пропсы компонента Select */
interface Props {
  /** Открыт ли список с периодами */
  isSelectOpen: boolean;
  /** Текущий период */
  currentPeriod: GraphPeriod;
  /** Показать список с периодами */
  showSelectValues: () => void;
  /** Скрыть список с периодами */
  hideSelectValues: () => void;
  /** Поменять текущий период */
  changeGraphPeriod: MouseEventHandler;
}

/** Описание периодов */
const GRAPH_PERIOD_TEXT = {
  [GraphPeriod.YEAR]: 'For the last year',
  [GraphPeriod.HALF_YEAR]: 'For the last 6 months',
  [GraphPeriod.MONTH]: 'For the last month',
};

/**
 * Получить список периодов, кроме текущего
 * @param currentPeriod текущий период (обязательное)
 */
const getUnselectedPeriods = (currentPeriod: GraphPeriod) => {
  return Object.entries(GRAPH_PERIOD_TEXT)
    .filter(([periodKey]) => periodKey !== currentPeriod)
    .map(([periodKey, periodValue]) => ({ periodKey, periodValue }));
};

/** Компонент Select */
const Select: React.FC<Props> = ({
  isSelectOpen,
  currentPeriod,
  showSelectValues,
  changeGraphPeriod,
  hideSelectValues,
}) => {
  /** Все периоды, кроме выбранного */
  const unselectedPeriods = getUnselectedPeriods(currentPeriod);
  /** Элемент списка с периодами */
  const selectValues = useRef(null);

  useEffect(() => {
    /**
     * Обработать клик вне списка с периодами
     * @param evt событие мыши (обязательное)
     */
    const handleClickOutsideSelectValues = (evt: MouseEvent) => {
      if (evt.target !== selectValues.current) {
        hideSelectValues();
      }
    };

    if (isSelectOpen) {
      document.addEventListener('click', handleClickOutsideSelectValues);
    } else {
      document.removeEventListener('click', handleClickOutsideSelectValues);
    }

    return () => {
      document.removeEventListener('click', handleClickOutsideSelectValues);
    };
  }, [selectValues, isSelectOpen, hideSelectValues]);

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
      <button className={`${button} ${buttonTop}`} onClick={showSelectValues}>
        <span className={currentValue}>{GRAPH_PERIOD_TEXT[currentPeriod]}</span>
        <span className={`${icon} ${isSelectOpen && iconReversed}`}></span>
      </button>

      <ul ref={selectValues} className={`${values} ${isSelectOpen && valuesShown}`}>
        {unselectedPeriods.map((period, index) => {
          return (
            <li key={index} className={value}>
              <button
                className={`${button} ${buttonBottom}`}
                onClick={changeGraphPeriod}
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
