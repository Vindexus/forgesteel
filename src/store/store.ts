// store.ts
import { FactoryLogic } from '@/logic/factory-logic';
import { Options } from '@/models/options';
import { create } from 'zustand';
import localforage from 'localforage';

interface AppState {
	options: Options;
	setOptions: (opts: Partial<Options>) => void;
	setOption: (key: keyof Options, value: Options[keyof Options]) => void;
	createOptionOnChange: (key: keyof Options) => (value: Options[keyof Options]) => void;
}

const defaultOptions = FactoryLogic.createOptions();

export const useAppStore = create<AppState>((set, get) => ({
	options: defaultOptions,
	setOptions: (opts: Partial<Options>) => {
		set(s => ({ options: { ...s.options, ...opts } }));
		localforage.setItem('forgesteel-options', get().options);
	},
	setOption: (key: keyof Options, value: Options[keyof Options]) => {
		set(s => ({ options: { ...s.options, [key]: value } }));
		localforage.setItem('forgesteel-options', get().options);
	},
	createOptionOnChange<K extends keyof Options>(key: K) {
		return (value: Options[K]) => {
			return get().setOption(key, value);
		};
	}
}));

// Hydrate persisted data on app load
(async () => {
	const options = await localforage.getItem<Options>('forgesteel-options');
	if (options) {
		useAppStore.setState({ options });
	}
})();
