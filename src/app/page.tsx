import { InteractiveChart } from './components/InteractiveChart';
import { Donator } from './types/donator';
import styles from './page.module.css';
import data from '../../public/data.json';

/** Получить данные донатера */
const getDonatorData = async (): Promise<Donator> => {
  // Чтобы использовать мок-апи, надо добавить data.json в https://designer.mocky.io/ и получить ссылку.
  // Но ссылка быстро устаревает, поэтому для стабильности настроено прямое обращение к файлу.

  // const response = await fetch('https://run.mocky.io/v3/80119f7c-a545-46f9-ac6f-5f4bd130f2d3');

  // if (!response.ok) {
  //   throw new Error(`Network response was not ok`);
  // }

  // return response.json();

  return data;
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
