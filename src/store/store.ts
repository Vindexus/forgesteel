// store.ts
import { FactoryLogic } from '@/logic/factory-logic';
import { Options } from '@/models/options';
import { create } from 'zustand';
import localforage from 'localforage';

interface AppState {
	setOptions: (opts: Partial<Options>) => void;
}

const defaultOptions = FactoryLogic.createOptions();

export const useAppStore = create<AppState>((set, get) => ({
	options: defaultOptions,
	setOptions: (opts: Partial<Options>) => {
		set(s => ({ options: { ...s.options, ...opts } }));
		localforage.setItem('forgesteel-options', get().options);
	},
}));

// Hydrate persisted data on app load
(async () => {
	const options = await localforage.getItem<Options>('forgesteel-options');
	if (options) {
		useAppStore.setState({ options });
	}
})();
