import { InteractiveChart } from './components/InteractiveChart/InteractiveChart';
import { Donator } from './types/donator';
import styles from './page.module.css';

/** Получить данные донатера */
const getDonatorData = async (): Promise<Donator> => {
  const response = await fetch('https://run.mocky.io/v3/80119f7c-a545-46f9-ac6f-5f4bd130f2d3');

  if (!response.ok) {
    throw new Error(`Network response was not ok`);
  }

  return response.json();
};

/** Рендер-функция домашней страницы */
export default async function Home() {
  /** Данные донатера */
  const donatorData = await getDonatorData();

  // Разметка
  return (
    <main className={styles.main}>
      <InteractiveChart data={donatorData} />
    </main>
  );
}
