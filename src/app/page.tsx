import { InteractiveChart } from './components/InteractiveChart/InteractiveChart';
import { Donator } from './types/donator';
import styles from './page.module.css';
import data from '../../public/data.json';

/** Получить данные донатера */
const getDonatorData = async (): Promise<Donator | null> => {
  try {
    const response = await fetch('https://run.mocky.io/v3/80119f7c-a545-46f9-ac6f-5f4bd130f2d3');

    if (!response.ok) {
      throw new Error(`Network response wasn't ok`);
    }

    return response.json();
  } catch (error) {
    console.error('The data is downloaded locally because an error occurred:', error);

    return null;
  }
};

/** Домашняя страница */
export default async function Home() {
  const donatorData = (await getDonatorData()) ?? (data as Donator);

  // Разметка
  return (
    <main className={styles.main}>
      <h1 className="visually-hidden">Interactive chart</h1>
      <InteractiveChart data={donatorData} />
    </main>
  );
}
