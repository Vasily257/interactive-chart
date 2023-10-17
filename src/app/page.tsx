import { GetStaticProps } from 'next';
import { InteractiveChart } from './components/InteractiveChart';
import { Donator } from './types/donator';
import styles from './page.module.css';

export const getStaticProps: GetStaticProps = async () => {
  const response = await fetch('../../../public/data.json');

  if (!response.ok) {
    throw new Error(`Network response was not ok`);
  }

  const donatorData: Donator = await response.json();

  return {
    props: {
      donatorData,
    },
  };
};

export default function Home({ donatorData }: { donatorData: Donator }) {
  return (
    <main className={styles.main}>
      <InteractiveChart data={donatorData} />
    </main>
  );
}
