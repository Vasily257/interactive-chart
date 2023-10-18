'use client';

import React, { useReducer } from 'react';
import styles from './interactiveChart.module.css';
import { Donator, PeriodEarningsGraph } from '../types/donator';

/** Периоды, для которых строится график */
type GraphPeriod = keyof PeriodEarningsGraph;

/** Отдельная колонка с данными */
type GraphColumn = { interval: string; value: number | null };

/** Переменные состояния */
type State = { currentPeriod: GraphPeriod; isSelectOpen: boolean };

/** Действия, доступные в редьюсере */
type Action =
  | { type: 'TOGGLE_SELECT_LIST' }
  | { type: 'CHOOSE_YEAR' }
  | { type: 'CHOOSE_HALF_YEAR' }
  | { type: 'CHOOSE_LAST_MONTH' };

/** Значения по вертикальной оси */
const VERTICAL_SCALE_ITEMS: number[] = [0, 500, 1000, 2000, 5000, 10000];

/** Описания периодов */
const GRAPH_PERIOD_TEXT: Record<GraphPeriod, string> = {
  year: 'За последний год',
  half_year: 'За последние 6 месяцев',
  month: 'За последний месяц',
};

/** Начальные значения переменных состояния */
const initialState: State = {
  isSelectOpen: false,
  currentPeriod: 'year',
};

/** Функция-редьюсер */
const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case 'TOGGLE_SELECT_LIST':
      return { ...state, isSelectOpen: !state.isSelectOpen };
    case 'CHOOSE_YEAR':
      return { ...state, isSelectOpen: false, currentPeriod: 'year' as GraphPeriod };
    case 'CHOOSE_HALF_YEAR':
      return { ...state, isSelectOpen: false, currentPeriod: 'half_year' as GraphPeriod };
    case 'CHOOSE_LAST_MONTH':
      return { ...state, isSelectOpen: false, currentPeriod: 'month' as GraphPeriod };
    default:
      return state;
  }
};

/** Получить список периодов, кроме текущего */
const getUnselectedPeriods = (currentPeriod: GraphPeriod) => {
  const unselectedPeriods: { periodKey: GraphPeriod; periodValue: string }[] = [];

  Object.entries(GRAPH_PERIOD_TEXT).map(text => {
    const periodKey = text[0] as GraphPeriod;
    const periodValue = text[1];

    if (periodKey !== currentPeriod) {
      unselectedPeriods.push({ periodKey, periodValue });
    }
  });

  return unselectedPeriods;
};

/** Преобразовать данные графиков */
const mapIntervalsAndValues = (intervalsAndValues: [string, number | null][]) => {
  return intervalsAndValues.map(([interval, value]) => ({
    interval,
    value,
  }));
};

/** Получить данные для графиков (периоды и связанные значения) */
const getGraphData = (data: Donator) => {
  const graphData = {} as Record<GraphPeriod, GraphColumn[]>;

  // Разбить данные графиков на периоды и объекты в формате «интервал/значение»
  const PeriodsWithData = Object.entries(data.finance.periods[0].graph) as [
    GraphPeriod,
    Record<string, number | null>
  ][];

  // Пересобрать данные графиков, чтобы их можно было перебрать в разметке
  PeriodsWithData.forEach(entry => {
    const periodName: GraphPeriod = entry[0];
    const intervalsAndValues: [string, number | null][] = Object.entries(entry[1]);

    graphData[periodName] = mapIntervalsAndValues(intervalsAndValues);
  });

  return graphData;
};

/** Компонент InteractiveChart */
const InteractiveChart: React.FC<{ data: Donator }> = ({ data }) => {
  const [state, dispatch] = useReducer<React.Reducer<State, Action>>(reducer, initialState);

  /** Обработать клик по верхней кнопке селекта */
  const handleClickOnSelectButtonTop = () => {
    dispatch({ type: 'TOGGLE_SELECT_LIST' });
  };

  /** Обработать клик по нижней кнопке селекта */
  const handleClickOnSelectButtonBottom = (evt: React.MouseEvent<HTMLButtonElement>) => {
    const target = evt.target as HTMLButtonElement;

    if (target.id === 'select-button-bottom-year') {
      dispatch({ type: 'CHOOSE_YEAR' });
    }

    if (target.id === 'select-button-bottom-half_year') {
      dispatch({ type: 'CHOOSE_HALF_YEAR' });
    }

    if (target.id === 'select-button-bottom-month') {
      dispatch({ type: 'CHOOSE_LAST_MONTH' });
    }
  };

  const { selectButton, selectButtonTop } = styles;

  const unselectedPeriods = getUnselectedPeriods(state.currentPeriod);
  const graphData = getGraphData(data);

  return (
    <div className={styles.chart}>
      {/* Кнопка с выбором типа графика */}
      <div className={styles.selectBox}>
        <button
          className={`${selectButton} ${selectButtonTop}`}
          onClick={handleClickOnSelectButtonTop}
        >
          <span className={styles.selectCurrentValue}>
            {GRAPH_PERIOD_TEXT[state.currentPeriod]}
          </span>
          <span className={styles.selectIcon}></span>
        </button>
        {state.isSelectOpen && (
          <ul className={styles.selectValues}>
            {unselectedPeriods.map((period, index: number) => {
              return (
                <li key={index} className={styles.selectValue}>
                  <button
                    className={styles.selectButton}
                    onClick={handleClickOnSelectButtonBottom}
                    id={`select-button-bottom-${period.periodKey}`}
                  >
                    {period.periodValue}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* График */}
      <div className={styles.chartContainer}>
        <ul className={styles.verticalScale}>
          {VERTICAL_SCALE_ITEMS.map((verticalScaleItem: number, index: number) => {
            return (
              <li key={index} className={styles.verticalScaleItem}>
                {verticalScaleItem}
              </li>
            );
          })}
        </ul>
        <div className={styles.columnsContainer}>
          <ul className={styles.columns}>
            {graphData[state.currentPeriod].map((column: GraphColumn, index: number) => {
              return (
                <li key={index} className={styles.column}>
                  <span className={styles.columnInterval}>{column.interval}</span>
                  <div className={styles.columnValue}>{column.value}</div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export { InteractiveChart };
