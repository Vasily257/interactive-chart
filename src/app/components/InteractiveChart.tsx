'use client';

import React, { useReducer } from 'react';
import styles from './interactiveChart.module.css';
import { Donator } from '../types/donator';
import addLeadingZero from '../helpers/addLeadingZero';

/** Периоды, для которых строится график (на основе PeriodEarningsGraph) */
enum GraphPeriod {
  YEAR = 'year',
  HALF_YEAR = 'half_year',
  MONTH = 'month',
}

/** Переменные состояния */
type State = { currentPeriod: GraphPeriod; isSelectOpen: boolean };

/** Действия, доступные в редьюсере */
type Action =
  | { type: 'TOGGLE_SELECT_LIST' }
  | { type: 'CHOOSE_YEAR' }
  | { type: 'CHOOSE_HALF_YEAR' }
  | { type: 'CHOOSE_LAST_MONTH' };

/** Значения по вертикальной оси */
const VERTICAL_SCALE_LABELS: number[] = [0, 500, 1000, 2000, 5000, 10000];

/** Описания периодов */
const GRAPH_PERIOD_TEXT = {
  [GraphPeriod.YEAR]: 'За последний год',
  [GraphPeriod.HALF_YEAR]: 'За последние 6 месяцев',
  [GraphPeriod.MONTH]: 'За последний месяц',
};

/** Значения по вертикальной оси, отсортированные по убыванию */
const reversedVerticalScaleItems = [...VERTICAL_SCALE_LABELS].reverse();

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
const mapLabelsAndValues = (periodName: string, labelsAndValues: [string, number | null][]) => {
  const horizontalScaleLabels: Array<string | number> = [];
  const columnValues: number[] = [];

  labelsAndValues.map(([label, value], index) => {
    if (periodName === GraphPeriod.MONTH) {
      const isShowedLabel = index === 0 || (index + 1) % 5 === 0;

      if (isShowedLabel) {
        horizontalScaleLabels.push(addLeadingZero(Number(label)));
      }
    } else {
      horizontalScaleLabels.push(label.substring(0, 3));
    }

    if (typeof value === 'number') {
      columnValues.push(value);
    }
  });

  return { horizontalScaleLabels, columnValues };
};

/** Получить данные для графиков (периоды и связанные значения) */
const getGraphData = (data: Donator) => {
  const graphData = {} as Record<
    GraphPeriod,
    { horizontalScaleLabels: Array<string | number>; columnValues: number[] }
  >;

  // Разбить данные графиков на периоды и объекты в формате «интервал/значение»
  const PeriodsWithData = Object.entries(data.finance.periods[0].graph) as [
    GraphPeriod,
    Record<string, number | null>
  ][];

  // Пересобрать данные графиков, чтобы их можно было перебрать в разметке
  PeriodsWithData.forEach(entry => {
    const periodName: GraphPeriod = entry[0];
    const labelsAndValues: [string, number | null][] = Object.entries(entry[1]);

    graphData[periodName] = mapLabelsAndValues(periodName, labelsAndValues);
  });

  return graphData;
};

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

/** Компонент InteractiveChart */
const InteractiveChart: React.FC<{ data: Donator }> = ({ data }) => {
  const [state, dispatch] = useReducer<React.Reducer<State, Action>>(reducer, initialState);

  const isMonthPeriod = state.currentPeriod === GraphPeriod.MONTH;

  const unselectedPeriods = getUnselectedPeriods(state.currentPeriod);
  const graphData = getGraphData(data);

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
    graphBox,
    verticalScaleLabels,
    verticalScaleLabel,
    columnValues,
    columnValue,
    columnValueThin,
    horizontalScaleLabels,
    horizontalScaleLabel,
  } = styles;

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
            {unselectedPeriods.map((period, index) => {
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
          {graphData[state.currentPeriod].columnValues.map((value, index) => {
            return (
              <li
                key={index}
                style={{ height: `calc(${calculateRelativeColumnHeight(value)} * 100%)` }}
                className={`${columnValue} ${isMonthPeriod && columnValueThin}`}
              ></li>
            );
          })}
        </ul>
        <ul className={horizontalScaleLabels}>
          {graphData[state.currentPeriod].horizontalScaleLabels.map((label, index) => {
            return (
              <li key={index} className={horizontalScaleLabel}>
                {label}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export { InteractiveChart };
