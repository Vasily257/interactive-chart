import React from 'react';
import styles from './interactive-сhart.module.css';
import { Donator, GraphPeriod, GraphColumn } from '../types/donator';

/** Значения по вертикальной оси */
const VERTICAL_SCALE_ITEMS: number[] = [0, 500, 1000, 2000, 5000, 10000];

/** Все возможные периоды для графика*/
const GRAPH_PERIODS: Record<GraphPeriod, string> = {
  year: 'За последний год',
  half_year: 'За последние 6 месяцев',
  month: 'За последний месяц',
};

/** Период для графика по умолчанию */
const DEFAULT_GRAPH_PERIOD: GraphPeriod = 'year';

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
  const unselectedPeriods: string[] = Object.values(GRAPH_PERIODS);
  const graphData = getGraphData(data) || {};

  const { selectButton, selectButtonTop } = styles;

  return (
    <div className={styles.chart}>
      {/* Кнопка с выбором типа графика */}
      <div className={styles.selectBox}>
        <button className={`${selectButton} ${selectButtonTop}`}>
          <span className={styles.selectCurrentValue}>{GRAPH_PERIODS[DEFAULT_GRAPH_PERIOD]}</span>
          <span className={styles.selectIcon}></span>
        </button>
        <ul className={styles.selectValues}>
          {unselectedPeriods.map((selectValue: string, index: number) => {
            return (
              <li key={index} className={styles.selectValue}>
                <button className={styles.selectButton}>{selectValue}</button>
              </li>
            );
          })}
        </ul>
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
            {graphData[DEFAULT_GRAPH_PERIOD].map((column: GraphColumn, index: number) => {
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
