import React from 'react';
import styles from './interactive-сhart.module.css';
import { Donator, PeriodEarningsGraph } from '../types/donator';

/** Периоды, для которых строится график */
type GraphPeriod = keyof PeriodEarningsGraph;

/** Значения периодов, для которых строится график */
type GraphColumn = { interval: string; value: number | null };

/** Значения вертикальной оси */
const verticalScaleItems: number[] = [0, 500, 1000, 2000, 5000, 10000];

/** Возможные значения в селекте */
const selectValues: Record<GraphPeriod, string> = {
  year: 'За последний год',
  half_year: 'За последние 6 месяцев',
  month: 'За последний месяц',
};

/** Компонент InteractiveChart */
const InteractiveChart: React.FC<{ data: Donator }> = ({ data }) => {
  const currentGraph: GraphPeriod = 'year';
  const unselectedPeriods: string[] = Object.values(selectValues);

  /** Получить данные для графиков (периоды и связанные значения) */
  const getGraphData = () => {
    const entries = Object.entries(data.finance.periods[0].graph);
    const graphData = {};

    entries.forEach(entry => {
      const periodName = entry[0];
      const intervalsAndValues = Object.entries(entry[1]);

      graphData[periodName] = [{ interval: intervalsAndValues[0], value: intervalsAndValues[1] }];
    });

    return graphData;
  };

  const graphData = getGraphData();

  return (
    <div className={styles.chart}>
      {/* Кнопка с выбором типа графика */}
      <div className={styles.selectBox}>
        <span className={styles.selectCurrentValue}></span>
        <button className={styles.selectButton}></button>
        <ul className={styles.selectValues}>
          {unselectedPeriods.map((selectValue: string, index: number) => {
            return (
              <li key={index} className={styles.selectValue}>
                {selectValue}
              </li>
            );
          })}
        </ul>
      </div>

      {/* График */}
      <div className={styles.chartContainer}>
        <ul className={styles.verticalScale}>
          {verticalScaleItems.map((verticalScaleItem: number, index: number) => {
            return (
              <li key={index} className={styles.verticalScaleItem}>
                {verticalScaleItem}
              </li>
            );
          })}
        </ul>
        <div className={styles.columnsContainer}>
          <ul className={styles.columns}>
            {graphData[currentGraph].map((column: GraphColumn, index: number) => {
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
