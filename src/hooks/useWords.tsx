import { useStore } from '../context/Store';

export function useWords() {
  const { lang } = useStore();
  return (en: string, pl: string) => (lang === 'pl' ? pl : en);
}
