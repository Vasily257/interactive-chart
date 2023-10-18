'use client';

import React, { useReducer } from 'react';
import styles from './interactiveChart.module.css';
import { Donator } from '../types/donator';

/** Периоды, для которых строится график (на основе PeriodEarningsGraph) */
enum GraphPeriod {
  YEAR = 'year',
  HALF_YEAR = 'half_year',
  MONTH = 'month',
}

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
const GRAPH_PERIOD_TEXT = {
  [GraphPeriod.YEAR]: 'За последний год',
  [GraphPeriod.HALF_YEAR]: 'За последние 6 месяцев',
  [GraphPeriod.MONTH]: 'За последний месяц',
};

/** Начальные значения переменных состояния */
const initialState: State = {
  isSelectOpen: false,
  currentPeriod: GraphPeriod.YEAR,
};

/** Функция-редьюсер */
const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case 'TOGGLE_SELECT_LIST':
      return { ...state, isSelectOpen: !state.isSelectOpen };
    case 'CHOOSE_YEAR':
      return { ...state, isSelectOpen: false, currentPeriod: GraphPeriod.YEAR };
    case 'CHOOSE_HALF_YEAR':
      return { ...state, isSelectOpen: false, currentPeriod: GraphPeriod.HALF_YEAR };
    case 'CHOOSE_LAST_MONTH':
      return { ...state, isSelectOpen: false, currentPeriod: GraphPeriod.MONTH };
    default:
      return state;
  }
};

/** Получить список периодов, кроме текущего */
const getUnselectedPeriods = (currentPeriod: GraphPeriod) => {
  return Object.entries(GRAPH_PERIOD_TEXT)
    .filter(([periodKey]) => periodKey !== currentPeriod)
    .map(([periodKey, periodValue]) => ({ periodKey, periodValue }));
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

    if (target.id === `select-button-bottom-${GraphPeriod.YEAR}`) {
      dispatch({ type: 'CHOOSE_YEAR' });
    }

    if (target.id === `select-button-bottom-${GraphPeriod.HALF_YEAR}`) {
      dispatch({ type: 'CHOOSE_HALF_YEAR' });
    }

    if (target.id === `select-button-bottom-${GraphPeriod.MONTH}`) {
      dispatch({ type: 'CHOOSE_LAST_MONTH' });
    }
  };

  const {
    chart,
    selectBox,
    selectButton,
    selectButtonTop,
    selectCurrentValue,
    selectIcon,
    selectValues,
    selectValue,
    chartContainer,
    verticalScale,
    verticalScaleItem,
    columnsContainer,
    columns,
    column,
    columnInterval,
    columnValue,
  } = styles;

  const unselectedPeriods = getUnselectedPeriods(state.currentPeriod);
  const graphData = getGraphData(data);

  return (
    <div className={chart}>
      {/* Кнопка с выбором типа графика */}
      <div className={selectBox}>
        <button
          className={`${selectButton} ${selectButtonTop}`}
          onClick={handleClickOnSelectButtonTop}
        >
          <span className={selectCurrentValue}>{GRAPH_PERIOD_TEXT[state.currentPeriod]}</span>
          <span className={selectIcon}></span>
        </button>
        {state.isSelectOpen && (
          <ul className={selectValues}>
            {unselectedPeriods.map((period, index: number) => {
              return (
                <li key={index} className={selectValue}>
                  <button
                    className={selectButton}
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
      <div className={chartContainer}>
        <ul className={verticalScale}>
          {VERTICAL_SCALE_ITEMS.map((scaleItem: number, index: number) => {
            return (
              <li key={index} className={verticalScaleItem}>
                {scaleItem}
              </li>
            );
          })}
        </ul>
        <div className={columnsContainer}>
          <ul className={columns}>
            {graphData[state.currentPeriod].map((columnItem: GraphColumn, index: number) => {
              return (
                <li key={index} className={column}>
                  <span className={columnInterval}>{columnItem.interval}</span>
                  <div className={columnValue}>{columnItem.value}</div>
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
