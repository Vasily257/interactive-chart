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

/** Параметры API-ответа (данные по донатеру) */
interface Donator {
  nickname: string;
  finance: FinanceData;
  gift_settings: GiftSettings;
  gift_stats: GiftStats;
}

export type { Donator, PeriodEarningsGraph };
