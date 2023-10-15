import styles from './page.module.css';

// Интерфейсы

interface PeriodEarningsGraph {
  year: Record<string, number | null>;
  half_year: Record<string, number | null>;
  month: Record<string, number | null>;
}

interface Period {
  earnings: {
    year_sum: number;
    six_month_sum: number;
    last_month_sum: number;
  };
  graph: PeriodEarningsGraph;
}

interface FinanceData {
  total: {
    sum: number;
    donators_count: number;
    regular_donators_count: number;
  };
  periods: Period[];
}

interface GiftSettings {
  small_gift: number | null;
  medium_gift: number | null;
  big_gift: number | null;
}

interface GiftStats {
  small_gift_count: number;
  small_gift_sum: number;
  small_medium_count: number;
  small_medium_sum: number;
  small_big_count: number;
  small_big_sum: number;
}

interface FetchData {
  nickname: string;
  finance: FinanceData;
  gift_settings: GiftSettings;
  gift_stats: GiftStats;
}

// Константы

/** Значения вертикальной оси */
const verticalScaleItems: number[] = [0, 500, 1000, 2000, 5000, 10000];

/** Возможные значения в селекте */
const selectValues: Record<keyof Period['earnings'], string> = {
  year_sum: 'За последний год',
  six_month_sum: 'За последние 6 месяцев',
  last_month_sum: 'За последний месяц',
};

// Методы

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
const InteractiveChart = async () => {
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
