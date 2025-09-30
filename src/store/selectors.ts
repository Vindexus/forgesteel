import { Options } from '@/models/options';
import { useAppStore } from './store';

export const useOption = <K extends keyof Options>(key: K) => {
	const { options } = useAppStore();
	return options[key];
};
