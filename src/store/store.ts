import { FactoryLogic } from '@/logic/factory-logic';
import { Options } from '@/models/options';
import { OptionsUpdateLogic } from '@/logic/update/options-update-logic';
import { create } from 'zustand';
import localforage from 'localforage';
import { Hero } from '@/models/hero';

const storageNames = {
	options: 'forgesteel-options',
	heroes: 'forgesteel-heroes'
} as const;

export interface AppError {
	id: number;
	err: unknown
}

interface AppState {
	errors: AppError[];
	addError: (err: unknown) => void;
	clearErrors: () => void;

	// When something is saved to storage, we also update this number
	// This is so hooks can trigger the sync saving when something is saved
	syncChangeId: number

	heroes: Hero[]
	setHeroes: (heroes: Hero[]) => Promise<void>
	setHero: (hero: Hero) => Promise<void>
	deleteHero: (hero: Hero) => Promise<void>

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
		set(s => ({ errors: [...s.errors, newError] }));
	};

	const persist = async (key: keyof typeof storageNames, value: any) => {
		try {
			await localforage.setItem(key, value);
			set(_ => ({ syncChangeId: get().syncChangeId + 1 }))
		} catch (err: unknown) {
			console.error('caught an error when persisting', key, err);
			addError(err);
		}
	}

	const persistOptions = async () => {
		return await persist('options', get().options);
	};

	const persistHeroes = async () => {
		try {
			await localforage.setItem(storageNames.heroes, get().heroes);
		} catch (err: unknown) {
			console.error('caught an error in persistHeroes', err);
			addError(err);
		}
	};

	const setOptions = async (opts: Partial<Options>) => {
		set(s => ({ options: { ...s.options, ...opts } }));
		await persistOptions();
	};

	const setHeroes = async (heroes: Hero[]) => {
		set(_ => ({ heroes }));
		await persistHeroes();
	};

	const setHero = async (hero: Hero) => {
		let heroes = get().heroes
		const idx = heroes.findIndex(h => h.id === hero.id)
		if (idx === -1) {
			heroes.push(hero);
		} else {
			heroes = heroes.map(h => h.id === hero.id ? hero : h)
		}
		await setHeroes(heroes)
	}

	const deleteHero = async (hero: Hero) => {
		await setHeroes(get().heroes.filter(h => h.id !== hero.id))
	}

	return {
		options: defaultOptions,

		errors: [],
		clearErrors: () => set({ errors: [] }),

		heroes: [],
		setHeroes,
		setHero,
		deleteHero,

		addError,
		setOptions,
		setOption: async (key: keyof Options, value: Options[keyof Options]) => {
			await setOptions({ [key]: value });
		},

		syncChangeId: 1,
	};
});

// Hydrate persisted data on app load
(async () => {
	const options = await localforage.getItem<Options>(storageNames.options);
	if (options) {
		OptionsUpdateLogic.updateOptions(options);
		useAppStore.setState({ options });
	}
})();
