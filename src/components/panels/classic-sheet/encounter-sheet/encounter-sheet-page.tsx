import { FillerCard, SheetLayout } from '@/logic/classic-sheet/sheet-layout';
import { Encounter } from '@/models/encounter';
import { EncounterHeaderCard } from '@/components/panels/classic-sheet/encounter-header/encounter-header';
import { EncounterRosterCard } from '@/components/panels/classic-sheet/encounter-roster/encounter-roster';
import { EncounterSheetBuilder } from '@/logic/playbook-sheets/encounter-sheet-builder';
import { Hero } from '@/models/hero';
import { MaliceCard } from '@/components/panels/classic-sheet/malice-card/malice-card';
import { MonsterCard } from '@/components/panels/classic-sheet/monster-card/monster-card';
import { NotesCard } from '@/components/panels/classic-sheet/notes-card/notes-card';
import { SheetFormatter } from '@/logic/classic-sheet/sheet-formatter';
import { Sourcebook } from '@/models/sourcebook';
import { useAppStore } from '@/store/store';
import { useMemo } from 'react';

import './encounter-sheet-page.scss';

interface Props {
	encounter: Encounter;
	sourcebooks: Sourcebook[];
	heroes: Hero[];
}

export const EncounterSheetPage = (props: Props) => {
	const { options } = useAppStore();
	const encounter = useMemo(
		() => EncounterSheetBuilder.buildEncounterSheet(props.encounter, props.sourcebooks, props.heroes, options),
		[ props.encounter, props.sourcebooks, props.heroes, options ]
	);

	const getMonsterCards = () => {
		const layout = SheetLayout.getFollowerCardsLayout(options, true);

		const requiredCards: FillerCard[] = [];

		if (encounter.notes?.length) {
			requiredCards.push({
				element: <NotesCard notes={encounter.notes} key='notes' />,
				width: 1,
				height: Math.max(20, SheetFormatter.countLines(encounter.notes, layout.cardLineLen)),
				shown: false
			});
		}

		if (encounter.monsters?.length) {
			encounter.monsters?.forEach(ms => {
				requiredCards.push({
					element: <MonsterCard monster={ms} key={ms.id} />,
					width: 1,
					height: Math.min(layout.linesY, SheetFormatter.calculateMonsterSize(ms, layout.cardLineLen)),
					shown: false
				});
			});
		}

		requiredCards.sort((a, b) => a.height - b.height);

		return SheetLayout.getMonsterCardPages(requiredCards, encounter, layout, 'monsters');
	};

	const sheetClasses = useMemo(
		() => {
			const classes = [
				'encounter-sheet',
				options.classicSheetPageSize.toLowerCase()
			];
			if (options.colorSheet) {
				classes.push('color');
			}
			return classes;
		},
		[ options.classicSheetPageSize, options.colorSheet ]
	);

	return (
		<main id='classic-sheet'>
			<div className={sheetClasses.join(' ')} id={SheetFormatter.getPageId('encounter', encounter.id, 'main')}>
				<div className={`page page-1 ${options.pageOrientation}`}>
					<EncounterHeaderCard encounter={encounter} />
					<MaliceCard encounter={encounter} />
					<EncounterRosterCard encounter={encounter} sourcebooks={props.sourcebooks} />
				</div>
				{getMonsterCards()}
			</div>
		</main>
	);
};
