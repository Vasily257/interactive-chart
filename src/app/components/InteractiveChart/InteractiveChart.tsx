'use client';

import React, { useReducer, useMemo, useCallback, useEffect } from 'react';
import styles from './interactiveChart.module.css';
import { Donator, GraphPeriod, GraphData } from '@/app/types/donator';
import addLeadingZero from '@/app/helpers/addLeadingZero';
import throttle from '@/app/helpers/throttle';
import { Select } from '../Select/Select';
import { Graph } from '../Graph/Graph';

/** Тип состояние */
interface State {
  isSelectOpen: boolean;
  isColumnsValueZero: boolean;
  isMobileView: boolean;
  currentPeriod: GraphPeriod;
}

/** Алиасы действий, доступных в редьюсере */
enum ActionAlias {
  IS_SELECT_LIST_OPEN = 'isSelectListOpen',
  IS_COLUMNS_VALUE_ZERO = 'isColumnsValueZero',
  IS_MOBILE_VIEW = 'isMobileView',
  SET_GRAPH_PERIOD = 'setGraphPeriod',
}

type ReducerAction =
  | { type: ActionAlias.IS_SELECT_LIST_OPEN; value: boolean }
  | { type: ActionAlias.IS_COLUMNS_VALUE_ZERO; value: boolean }
  | { type: ActionAlias.IS_MOBILE_VIEW; value: boolean }
  | { type: ActionAlias.SET_GRAPH_PERIOD; value: GraphPeriod };

/** Начальное состояние */
const initialState: State = {
  isSelectOpen: false,
  isColumnsValueZero: false,
  isMobileView: false,
  currentPeriod: GraphPeriod.YEAR,
};

/** Точка перехода между мобильной и десктопной ориентацией */
const BREAK_POINT: number = 900;

/** Задержка при изменении размера экрана */
const RESIZE_TIMEOUT: number = 150;

/** Функция-редьюсер */
const reducer = (state: State, action: ReducerAction) => {
  switch (action.type) {
    case ActionAlias.IS_SELECT_LIST_OPEN:
      return { ...state, isSelectOpen: action.value };
    case ActionAlias.IS_COLUMNS_VALUE_ZERO:
      return { ...state, isColumnsValueZero: action.value };
    case ActionAlias.IS_MOBILE_VIEW:
      return { ...state, isMobileView: action.value };
    case ActionAlias.SET_GRAPH_PERIOD:
      return { ...state, currentPeriod: action.value };
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
  // Иницализировать хранилище и функцию-редьюсер
  const [state, dispatch] = useReducer<React.Reducer<State, ReducerAction>>(reducer, initialState);

  /** Данные по всем графикам */
  const graphData = useMemo(() => getGraphData(data), [data]);

  /** Отобразить список с периодами */
  const showSelectValues = useCallback(() => {
    dispatch({ type: ActionAlias.IS_SELECT_LIST_OPEN, value: true });
  }, []);

  /** Скрыть список с периодами */
  const hideSelectValues = useCallback(() => {
    dispatch({ type: ActionAlias.IS_SELECT_LIST_OPEN, value: false });
  }, []);

  /** Поменять выбранный период для графика */
  const changeGraphPeriod = useCallback((evt: React.MouseEvent<HTMLButtonElement>) => {
    const target = evt.target as HTMLButtonElement;

    dispatch({ type: ActionAlias.IS_COLUMNS_VALUE_ZERO, value: true });
    dispatch({ type: ActionAlias.IS_SELECT_LIST_OPEN, value: false });

    if (target.id === `select-button-bottom-${GraphPeriod.YEAR}`) {
      dispatch({ type: ActionAlias.SET_GRAPH_PERIOD, value: GraphPeriod.YEAR });
    }

    if (target.id === `select-button-bottom-${GraphPeriod.HALF_YEAR}`) {
      dispatch({ type: ActionAlias.SET_GRAPH_PERIOD, value: GraphPeriod.HALF_YEAR });
    }

    if (target.id === `select-button-bottom-${GraphPeriod.MONTH}`) {
      dispatch({ type: ActionAlias.SET_GRAPH_PERIOD, value: GraphPeriod.MONTH });
    }

    setTimeout(() => {
      dispatch({ type: ActionAlias.IS_COLUMNS_VALUE_ZERO, value: false });
    }, 100);
  }, []);

  /** Обработать изменение размера экрана */
  const handleResize = () => {
    if (window.innerWidth > BREAK_POINT) {
      dispatch({ type: ActionAlias.IS_MOBILE_VIEW, value: false });
    } else {
      dispatch({ type: ActionAlias.IS_MOBILE_VIEW, value: true });
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
        showSelectValues={showSelectValues}
        hideSelectValues={hideSelectValues}
        changeGraphPeriod={changeGraphPeriod}
      />
      <Graph
        isColumnsValueZero={state.isColumnsValueZero}
        isMobileView={state.isMobileView}
        currentPeriod={state.currentPeriod}
        graphData={graphData}
      />
    </div>
  );
};

export { InteractiveChart };
