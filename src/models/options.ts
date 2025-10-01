import { PanelWidth } from '@/enums/panel-width';
import { SheetPageSize } from '@/enums/sheet-page-size';

export type SheetTextColor = 'light' | 'default' | 'dark';
export type FeaturesInclude = 'minimal' | 'no-basic' | 'all';
export type AbilitySort = 'size' | 'type';
export type PageOrientation = 'portrait' | 'landscape';
export interface Options {
	// Hero
	singlePage: boolean;
	separateInventoryFeatures: boolean;
	showSkillsInGroups: boolean;
	showStandardAbilities: boolean;
	dimUnavailableAbilities: boolean;
	showSources: boolean;
	includePlayState: boolean;
	compactView: boolean;
	abilityWidth: PanelWidth;
	classicSheetPageSize: SheetPageSize;
	colorSheet: boolean;
	sheetTextColor: SheetTextColor;
	featuresInclude: FeaturesInclude;
	abilitySort: AbilitySort;
	pageOrientation: PageOrientation;
	// Monster Builder
	similarLevel: boolean;
	similarRole: boolean;
	similarOrganization: boolean;
	similarSize: boolean;
	// Encounter
	minionCount: number;
	party: string;
	// Encounter Difficulty
	heroParty: string;
	heroCount: number;
	heroLevel: number;
	heroVictories: number;
	showDefeatedCombatants: boolean;
	// Tactical Map
	gridSize: number;
	playerGridSize: number;
}
