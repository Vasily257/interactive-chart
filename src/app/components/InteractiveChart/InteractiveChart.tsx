'use client';

import React, { useReducer, useMemo, useCallback, useEffect } from 'react';
import styles from './interactiveChart.module.css';
import { Donator, GraphPeriod, GraphData } from '@/app/types/donator';
import addLeadingZero from '@/app/helpers/addLeadingZero';
import throttle from '@/app/helpers/throttle';
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
  SET_MOBILE = 'SET_MOBILE',
  SET_DESKTOP = 'SET_DESKTOP',
}

/** Тип состояние */
type State = {
  isSelectOpen: boolean;
  isZeroColumnValue: boolean;
  isMobile: boolean;
  currentPeriod: GraphPeriod;
};

/** Начальное состояние */
const initialState: State = {
  isSelectOpen: false,
  isZeroColumnValue: false,
  isMobile: false,
  currentPeriod: GraphPeriod.YEAR,
};

/** Точка перехода между мобильной и десктопной ориентацией */
const BREAK_POINT: number = 900;

/** Задержка при изменении размера экрана */
const RESIZE_TIMEOUT: number = 150;

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
    case ReducerAction.SET_MOBILE:
      return { ...state, isMobile: true };
    case ReducerAction.SET_DESKTOP:
      return { ...state, isMobile: false };
    default:
      return state;
  }
};

/** Преобразовать данные графика по осям времени и значений */
const mapValueAndTimeAxisLabels = (
  periodName: string,
  valueAndTimeAxisLabels: [string, number | null][]
) => {
  const timeAxisLabels: Array<string | number> = [];
  const columnValues: number[] = [];

  valueAndTimeAxisLabels.map(([label, value], index) => {
    if (periodName === GraphPeriod.MONTH) {
      const isShowedLabel = index === 0 || (index + 1) % 5 === 0;

      if (isShowedLabel) {
        timeAxisLabels.push(addLeadingZero(Number(label)));
      }
    } else {
      timeAxisLabels.push(label.substring(0, 3));
    }

    if (typeof value === 'number') {
      columnValues.push(value);
    }
  });

  return { timeAxisLabels, columnValues };
};

/** Получить данные для графиков (периоды и связанные значения) */
const getGraphData = (data: Donator) => {
  const graphData = {} as GraphData;

  // Проверить, есть ли данные в нужном формате
  if (!data?.finance?.periods) {
    return graphData;
  }

  // Разбить данные графиков на периоды и объекты в формате «интервал/значение»
  const PeriodsWithData = Object.entries(data.finance.periods[0].graph) as [
    GraphPeriod,
    Record<string, number | null>
  ][];

  // Пересобрать данные графиков, чтобы их можно было перебрать в разметке
  PeriodsWithData.forEach(entry => {
    const periodName: GraphPeriod = entry[0];
    const timeAxisLabelsAndColumnLabels: [string, number | null][] = Object.entries(entry[1]);

    graphData[periodName] = mapValueAndTimeAxisLabels(periodName, timeAxisLabelsAndColumnLabels);
  });

  return graphData;
};

/** Компонент InteractiveChart */
const InteractiveChart: React.FC<{ data: Donator }> = ({ data }) => {
  const [state, dispatch] = useReducer<React.Reducer<State, { type: ReducerAction }>>(
    reducer,
    initialState
  );

  const graphData = useMemo(() => getGraphData(data), [data]);

  /** Переключить видимость списка с периодами */
  const toggleSelectValuesDisplay = useCallback(() => {
    if (state.isSelectOpen) {
      dispatch({ type: ReducerAction.CLOSE_SELECT_LIST });
    } else {
      dispatch({ type: ReducerAction.OPEN_SELECT_LIST });
    }
  }, [state.isSelectOpen]);

  /** Поменять выбранный период для графика */
  const changeGraphPeriod = useCallback((evt: React.MouseEvent<HTMLButtonElement>) => {
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
  }, []);

  /** Обработать изменение размера экрана */
  const handleResize = () => {
    if (window.innerWidth > BREAK_POINT) {
      dispatch({ type: ReducerAction.SET_DESKTOP });
    } else {
      dispatch({ type: ReducerAction.SET_MOBILE });
    }
  };

  // Запустить обработчик, чтобы отрисовать график при первом рендере
  useEffect(() => {
    handleResize();
  }, []);

  // Добавить слежение за размером экрана
  useEffect(() => {
    const resizingHandler = throttle(handleResize, RESIZE_TIMEOUT);

    window.addEventListener('resize', resizingHandler);

    return () => {
      window.removeEventListener('resize', resizingHandler);
    };
  }, []);

  return (
    <div className={styles.chart}>
      <Select
        isSelectOpen={state.isSelectOpen}
        currentPeriod={state.currentPeriod}
        handleClickOnSelectButtonTop={toggleSelectValuesDisplay}
        handleClickOnSelectButtonBottom={changeGraphPeriod}
      />
      <Graph
        isZeroColumnValue={state.isZeroColumnValue}
        isMobile={state.isMobile}
        currentPeriod={state.currentPeriod}
        graphData={graphData}
      />
    </div>
  );
};

export { InteractiveChart };
