'use client';

import React, { useReducer, useMemo, useCallback, useEffect } from 'react';
import styles from './interactiveChart.module.css';
import { Donator, GraphPeriod, GraphColumns, GraphColumnByPeriod } from '@/app/types/donator';
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
  SET_LIST_OPENING_STATUS = 'setListOpeningStatus',
  /** Присвоить колонкам значение "ноль" */
  SET_COLUMNS_VALUE_ZERO = 'setColumnsValueZero',
  /** Использовать мобильную ориентацию */
  USE_MOBILE_VIEW = 'isMobileView',
  /** Поменять временной периода графика  */
  SET_GRAPH_PERIOD = 'setGraphPeriod',
}

/** Действия, доступные в редьюсере */
type Action =
  | { type: ActionAlias.SET_LIST_OPENING_STATUS; value: boolean }
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

/** Задержка перед анимацией роста */
const GROWTH_ANIMATION_TIMEOUT: number = 100;

/**
 * Создать функцию-редьюсер
 * @param state стейт с данными
 * @param action доступные действия со стейтом
 */
const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case ActionAlias.SET_LIST_OPENING_STATUS:
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

/**
 * Преобразовать данные периода в нужный формат
 * @param periodName тип временного периода
 * @param valueAndTimeAxisLabels массив кортежей в формате "временная метка/значение"
 *  */
const mapValueAndTimeAxisLabels = (
  periodName: GraphPeriod,
  valueAndTimeAxisLabels: [string, number | null][]
) => {
  const graphColumns: GraphColumns = { timeAxisLabels: [], columnValues: [], maxValue: 0 };

  valueAndTimeAxisLabels.map(([label, value], index) => {
    if (periodName === GraphPeriod.MONTH) {
      /** Отметки, которые нужно отображать на оси времени */
      const isShowedLabel = index === 0 || (index + 1) % 5 === 0;

      if (isShowedLabel) {
        graphColumns.timeAxisLabels.push(addLeadingZero(Number(label)));
      }
    } else {
      graphColumns.timeAxisLabels.push(label.substring(0, 3));
    }

    if (typeof value === 'number') {
      graphColumns.columnValues.push(value);
      graphColumns.maxValue = Math.max(value, graphColumns.maxValue);
    }
  });

  return graphColumns;
};

/**
 * Получить данные для графиков (периоды и связанные значения)
 * @param data данные донатера, по которым строятся графики
 */
const getGraphData = (data: Donator) => {
  const graphData = {} as GraphColumnByPeriod;

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

  /** Выбраны ли данные за последний месяц */
  const isMonthPeriod = state.currentPeriod === GraphPeriod.MONTH;

  /** Данные по графикам, индексированные по периодам */
  const graphData = useMemo(() => getGraphData(data), [data]);

  /** Отобразить список с периодами */
  const showSelectValues = useCallback(() => {
    dispatch({ type: ActionAlias.SET_LIST_OPENING_STATUS, value: true });
  }, []);

  /** Скрыть список с периодами */
  const hideSelectValues = useCallback(() => {
    dispatch({ type: ActionAlias.SET_LIST_OPENING_STATUS, value: false });
  }, []);

  /**
   * Поменять период для графика
   * @param evt событие мыши (обязательное)
   */
  const changeGraphPeriod = useCallback((evt: React.MouseEvent<HTMLButtonElement>) => {
    const target = evt.target as HTMLButtonElement;
    const currentPeriod = target.id.replace('select-button-bottom-', '') as GraphPeriod;

    const isEnumValue = Object.values(GraphPeriod).includes(currentPeriod);

    if (isEnumValue) {
      // Сбросить значения колонок, чтобы они "вырастали" с нуля (анимация)
      dispatch({ type: ActionAlias.SET_COLUMNS_VALUE_ZERO, value: true });
      dispatch({ type: ActionAlias.SET_GRAPH_PERIOD, value: currentPeriod });
      dispatch({ type: ActionAlias.SET_LIST_OPENING_STATUS, value: false });

      // Добавить задержку, чтобы анимация роста срабатывала не сразу
      setTimeout(() => {
        dispatch({ type: ActionAlias.SET_COLUMNS_VALUE_ZERO, value: false });
      }, GROWTH_ANIMATION_TIMEOUT);
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
        isMonthPeriod={isMonthPeriod}
        currentPeriodData={graphData[state.currentPeriod]}
      />
    </div>
  );
};

export { InteractiveChart };
