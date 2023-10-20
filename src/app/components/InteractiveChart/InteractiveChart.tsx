'use client';

import React, { useReducer } from 'react';
import styles from './interactiveChart.module.css';
import { Donator, GraphPeriod, GraphData } from '../../types/donator';
import addLeadingZero from '../../helpers/addLeadingZero';
import { Select } from '../Select/Select';
import { Graph } from '../Graph/Graph';

/** Перечисление действий, доступных в редьюсере */
enum ReducerAction {
  OPEN_SELECT_LIST = 'OPEN_SELECT_LIST',
  CLOSE_SELECT_LIST = 'CLOSE_SELECT_LIST',
  CHOOSE_YEAR = 'CHOOSE_YEAR',
  CHOOSE_HALF_YEAR = 'CHOOSE_HALF_YEAR',
  CHOOSE_LAST_MONTH = 'CHOOSE_LAST_MONTH',
  RESET_COLUMN_VALUES = 'RESET_COLUMN_VALUES',
  RETURN_COLUMN_VALUES = 'RETURN_COLUMN_VALUES',
}

/** Тип состояние */
type State = { isSelectOpen: boolean; isZeroColumnValue: boolean; currentPeriod: GraphPeriod };

/** Начальное состояние */
const initialState: State = {
  isSelectOpen: false,
  isZeroColumnValue: false,
  currentPeriod: GraphPeriod.YEAR,
};

/** Функция-редьюсер */
const reducer = (state: State, action: { type: ReducerAction }) => {
  switch (action.type) {
    case ReducerAction.OPEN_SELECT_LIST:
      return { ...state, isSelectOpen: true };
    case ReducerAction.CLOSE_SELECT_LIST:
      return { ...state, isSelectOpen: false };
    case ReducerAction.CHOOSE_YEAR:
      return { ...state, currentPeriod: GraphPeriod.YEAR };
    case ReducerAction.CHOOSE_HALF_YEAR:
      return { ...state, currentPeriod: GraphPeriod.HALF_YEAR };
    case ReducerAction.CHOOSE_LAST_MONTH:
      return { ...state, currentPeriod: GraphPeriod.MONTH };
    case ReducerAction.RESET_COLUMN_VALUES:
      return { ...state, isZeroColumnValue: true };
    case ReducerAction.RETURN_COLUMN_VALUES:
      return { ...state, isZeroColumnValue: false };
    default:
      return state;
  }
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
  const graphData = {} as GraphData;

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

/** Компонент InteractiveChart */
const InteractiveChart: React.FC<{ data: Donator }> = ({ data }) => {
  const [state, dispatch] = useReducer<React.Reducer<State, { type: ReducerAction }>>(
    reducer,
    initialState
  );

  const graphData = getGraphData(data);

  /** Обработать клик по верхней кнопке селекта */
  const handleClickOnSelectButtonTop = () => {
    if (state.isSelectOpen) {
      dispatch({ type: ReducerAction.CLOSE_SELECT_LIST });
    } else {
      dispatch({ type: ReducerAction.OPEN_SELECT_LIST });
    }
  };

  /** Обработать клик по нижней кнопке селекта */
  const handleClickOnSelectButtonBottom = (evt: React.MouseEvent<HTMLButtonElement>) => {
    const target = evt.target as HTMLButtonElement;

    dispatch({ type: ReducerAction.RESET_COLUMN_VALUES });
    dispatch({ type: ReducerAction.CLOSE_SELECT_LIST });

    if (target.id === `select-button-bottom-${GraphPeriod.YEAR}`) {
      dispatch({ type: ReducerAction.CHOOSE_YEAR });
    }

    if (target.id === `select-button-bottom-${GraphPeriod.HALF_YEAR}`) {
      dispatch({ type: ReducerAction.CHOOSE_HALF_YEAR });
    }

    if (target.id === `select-button-bottom-${GraphPeriod.MONTH}`) {
      dispatch({ type: ReducerAction.CHOOSE_LAST_MONTH });
    }

    setTimeout(() => {
      dispatch({ type: ReducerAction.RETURN_COLUMN_VALUES });
    }, 100);
  };

  return (
    <div className={styles.chart}>
      <Select
        isSelectOpen={state.isSelectOpen}
        currentPeriod={state.currentPeriod}
        handleClickOnSelectButtonTop={handleClickOnSelectButtonTop}
        handleClickOnSelectButtonBottom={handleClickOnSelectButtonBottom}
      />
      <Graph
        isZeroColumnValue={state.isZeroColumnValue}
        currentPeriod={state.currentPeriod}
        graphData={graphData}
      />
    </div>
  );
};

export { InteractiveChart };