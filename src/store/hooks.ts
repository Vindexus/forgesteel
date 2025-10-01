import { Options } from '@/models/options';
import { useAppStore } from './store';

/**
 * @description Quick helper for getting just a single option value
 * @example const gridSize = useOption('gridSize');
 */
export const useOption = <K extends keyof Options>(key: K) => {
	const { options } = useAppStore();
	return options[key];
};

/**
 * @description This hooks gives you a factory function you can use to easily create typesafe onChange handlers.
 * @example
 * const onChange = useCreateOptionOnChange();
 * <input name='favoriteColor' onChange={onChange('favoriteColor')} />
 */
export const useCreateOptionOnChange = () => {
	const { setOption } = useAppStore();
	return <K extends keyof Options>(key: K) => {
		return async (value: Options[K]) => {
			return setOption(key, value);
		};
	};
};
