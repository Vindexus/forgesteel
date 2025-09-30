import { FactoryLogic } from '@/logic/factory-logic';
import { Options } from '@/models/options';
import { OptionsUpdateLogic } from '@/logic/update/options-update-logic';
import { create } from 'zustand';
import localforage from 'localforage';

export interface AppError {
	id: number;
	err: unknown
}

interface AppState {
	errors: AppError[];
	addError: (err: unknown) => void;
	clearErrors: () => void;
	options: Options;
	setOptions: (opts: Partial<Options>) => Promise<void>;
	setOption: (key: keyof Options, value: Options[keyof Options]) => Promise<void>;
}

const defaultOptions = FactoryLogic.createOptions();

let errorId = 0;
export const useAppStore = create<AppState>((set, get) => {
	const addError = (err: unknown) => {
		errorId++;
		const newError = { id: errorId, err };
		set(s => ({ errors: [ ...s.errors, newError ] }));
	};

	const persistOptions = async () => {
		try {
			await localforage.setItem('forgesteel-options', get().options);
		} catch (err: unknown) {
			console.error('caught an error in persistOptions', err);
			addError(err);
		}
	};

	const setOptions = async (opts: Partial<Options>) => {
		set(s => ({ options: { ...s.options, ...opts } }));
		await persistOptions();
	};

	return {
		options: defaultOptions,
		errors: [],
		clearErrors: () => set({ errors: [] }),
		addError,
		setOptions,
		setOption: async (key: keyof Options, value: Options[keyof Options]) => {
			await setOptions({ [key]: value });
		}
	};
});

// Hydrate persisted data on app load
(async () => {
	const options = await localforage.getItem<Options>('forgesteel-options');
	if (options) {
		OptionsUpdateLogic.updateOptions(options);
		useAppStore.setState({ options });
	}
})();
