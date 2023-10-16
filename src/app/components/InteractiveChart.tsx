import styles from './page.module.css';
import React from 'react';
import styles from './page.module.css';
import { Period } from '../types/donator';

/** Значения вертикальной оси */
const verticalScaleItems: number[] = [0, 500, 1000, 2000, 5000, 10000];

/** Возможные значения в селекте */
const selectValues: Record<keyof Period['earnings'], string> = {
  year_sum: 'За последний год',
  six_month_sum: 'За последние 6 месяцев',
  last_month_sum: 'За последний месяц',
};

// Разметка

/** Получить данные из fetch-запроса */
const getData = async (): Promise<FetchData> => {
  const response = await fetch('../../../public/data.json');

  if (!response.ok) {
    throw new Error(`Network response was not ok`);
  }

  return response.json();
};

// Разметка

/** Компонент InteractiveChart */
const InteractiveChart: React.FC = async () => {
  const data = await getData();
  const { year, half_year, month } = data.finance.periods[0].graph;

  const currentGraph = '';

  const showValues = Object.values(selectValues);

  return (
    <div className={styles.chart}>
      {/* Кнопка с выбором типа графика */}
      <div className={styles.selectBox}>
        <span className={styles.selectCurrentValue}></span>
        <button className={styles.selectButton}></button>
        <ul className={styles.selectValues}>
          {showValues.map((selectValue: string, index: number) => {
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
        <div className={styles.columnsContainer}></div>
      </div>
    </div>
  );
};

export { InteractiveChart };
