'use client';

import React, { useReducer, useMemo, useCallback, useEffect } from 'react';
import styles from './interactiveChart.module.css';
import { Donator, GraphPeriod, GraphData } from '@/app/types/donator';
import addLeadingZero from '@/app/helpers/addLeadingZero';
import throttle from '@/app/helpers/throttle';
import { Select } from '../Select/Select';
import { Graph } from '../Graph/Graph';

/** Состояние (хранилище стейт-переменных) */
interface State {
  isSelectOpen: boolean;
  isColumnsValueZero: boolean;
  isMobileView: boolean;
  currentPeriod: GraphPeriod;
}

/** Алиасы действий */
enum ActionAlias {
  /** Поменять статус открытия списка */
  SET_LIST_STATUS = 'setListStatus',
  /** Присвоить колонкам значение "ноль" */
  SET_COLUMNS_VALUE_ZERO = 'setColumnsValueZero',
  /** Использовать мобильную ориентацию */
  USE_MOBILE_VIEW = 'isMobileView',
  /** Поменять временной периода графика  */
  SET_GRAPH_PERIOD = 'setGraphPeriod',
}

/** Действия, доступные в редьюсере */
type Action =
  | { type: ActionAlias.SET_LIST_STATUS; value: boolean }
  | { type: ActionAlias.SET_COLUMNS_VALUE_ZERO; value: boolean }
  | { type: ActionAlias.USE_MOBILE_VIEW; value: boolean }
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
const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case ActionAlias.SET_LIST_STATUS:
      return { ...state, isSelectOpen: action.value };
    case ActionAlias.SET_COLUMNS_VALUE_ZERO:
      return { ...state, isColumnsValueZero: action.value };
    case ActionAlias.USE_MOBILE_VIEW:
      return { ...state, isMobileView: action.value };
    case ActionAlias.SET_GRAPH_PERIOD:
      return { ...state, currentPeriod: action.value };
    default:
      return state;
  }
};

/** Преобразовать данные периода в нужный формат */
const mapValueAndTimeAxisLabels = (
  periodName: string,
  valueAndTimeAxisLabels: [string, number | null][]
) => {
  const timeAxisLabels: Array<string | number> = [];
  const columnValues: number[] = [];

  valueAndTimeAxisLabels.map(([label, value], index) => {
    if (periodName === GraphPeriod.MONTH) {
      /** Отметки, которые нужно отображать на оси времени */
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
  // Иницализировать стейт и функцию-редьюсер
  const [state, dispatch] = useReducer<React.Reducer<State, Action>>(reducer, initialState);

  /** Данные по графикам, индексированные по периодам */
  const graphData = useMemo(() => getGraphData(data), [data]);

  /** Отобразить список с периодами */
  const showSelectValues = useCallback(() => {
    dispatch({ type: ActionAlias.SET_LIST_STATUS, value: true });
  }, []);

  /** Скрыть список с периодами */
  const hideSelectValues = useCallback(() => {
    dispatch({ type: ActionAlias.SET_LIST_STATUS, value: false });
  }, []);

  /** Поменять период для графика */
  const changeGraphPeriod = useCallback((evt: React.MouseEvent<HTMLButtonElement>) => {
    const target = evt.target as HTMLButtonElement;
    const currentPeriod = target.id.replace('select-button-bottom-', '') as GraphPeriod;

    const isEnumValue = Object.values(GraphPeriod).includes(currentPeriod);

    if (isEnumValue) {
      // Сбросить значения колонок, чтобы они "вырастали" с нуля (анимация)
      dispatch({ type: ActionAlias.SET_COLUMNS_VALUE_ZERO, value: true });
      dispatch({ type: ActionAlias.SET_GRAPH_PERIOD, value: currentPeriod });
      dispatch({ type: ActionAlias.SET_LIST_STATUS, value: false });

      // Добавить задержку, чтобы анимация роста срабатывала не сразу
      setTimeout(() => {
        dispatch({ type: ActionAlias.SET_COLUMNS_VALUE_ZERO, value: false });
      }, 100);
    }
  }, []);

  /** Обработать изменение размера экрана */
  const handleResize = () => {
    if (window.innerWidth > BREAK_POINT) {
      dispatch({ type: ActionAlias.USE_MOBILE_VIEW, value: false });
    } else {
      dispatch({ type: ActionAlias.USE_MOBILE_VIEW, value: true });
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
