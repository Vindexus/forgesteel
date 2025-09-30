import { Divider, Drawer, FloatButton, Segmented, Space } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { Career } from '@/models/career';
import { CareerCard } from '@/components/panels/classic-sheet/career-card/career-card';
import { ComplicationCard } from '@/components/panels/classic-sheet/complication-card/complication-card';
import { FactoryLogic } from '@/logic/factory-logic';
import { Hero } from '@/models/hero';
import { HeroSheetBuilder } from '@/logic/hero-sheet/hero-sheet-builder';
import { HeroSheetPage } from '@/components/pages/heroes/hero-sheet/hero-sheet-page';
import { SettingFilled } from '@ant-design/icons';
import { SheetPageSize } from '@/enums/sheet-page-size';
import { SheetTextColor } from '@/models/options';
import { Sourcebook } from '@/models/sourcebook';
import { SourcebookLogic } from '@/logic/sourcebook-logic';
import { Toggle } from '@/components/controls/toggle/toggle';
import { Utils } from '@/utils/utils';
import { useAppStore } from '@/store/store';
import { useCreateOptionOnChange } from '@/store/hooks';
import { useParams } from 'react-router';

import './hero-sheet-page.scss';

interface Props {
	heroes: Hero[];
	sourcebooks: Sourcebook[];
}

export const HeroSheetPreviewPage = (props: Props) => {
	const { options, setOption } = useAppStore();
	const createOptionOnChange = useCreateOptionOnChange();
	const { heroID } = useParams<{ heroID: string }>();
	const hero = useMemo(
		() => props.heroes.find(h => h.id === heroID)!,
		[ heroID, props.heroes ]
	);

	const [ drawerOpen, setDrawerOpen ] = useState(false);
	const [ previewOptions, setPreviewOptions ] = useState<'html' | 'canvas'>('html');

	const changeTextColor = (newColor: SheetTextColor) => {
		setDrawColor(newColor);
		setOption('sheetTextColor', newColor);
	};

	const setDrawColor = (newColor: SheetTextColor) => {
		let value = 34;
		switch (newColor) {
			case 'light':
				value = 68;
				break;
			case 'dark':
				value = 0;
				break;
		}
		const base = `rgb(${value}, ${value}, ${value})`;
		document.documentElement.style.setProperty('--color-text', base);
		const lighter = `rgb(${value + 34}, ${value + 34}, ${value + 34})`;
		document.documentElement.style.setProperty('--color-text-lighter', lighter);
		const lightest = `rgb(${value + 68}, ${value + 68}, ${value + 68})`;
		document.documentElement.style.setProperty('--color-text-lightest', lightest);
	};

	useEffect(() => {
		setDrawColor(options.sheetTextColor);
	}, [ options.sheetTextColor ]);

	const showDrawer = () => {
		setDrawerOpen(true);
	};

	const onDrawerClose = () => {
		setDrawerOpen(false);
	};

	const setDisplay = (type: 'html' | 'canvas') => {
		setPreviewOptions(type);
		const element = document.getElementById('classic-sheet');
		const canvasElem = document.getElementById('pdf-canvas');
		const prevDpr = window.devicePixelRatio;
		if (element && canvasElem) {
			const initialW = element.clientWidth;
			switch (type) {
				case 'html':
					element.className = '';
					canvasElem.className = 'hidden';
					break;
				case 'canvas':
					element.className = '';
					window.devicePixelRatio = 4;
					Utils.elementToCanvas(element)
						.then(function (canvas) {
							canvas.style.width = initialW + 'px';
							canvasElem.replaceChildren(canvas);
							canvasElem.className = '';
							element.className = 'hidden';
							window.devicePixelRatio = prevDpr;
						});
					break;
			}
		}
	};

	const fakeHero = FactoryLogic.createHero(props.sourcebooks.map(s => s.id));
	const getPageClasses = () => {
		return [
			'hero-sheet',
			options.classicSheetPageSize.toLowerCase(),
			options.pageOrientation
		].join(' ');
	};

	const getAllCareers = () => {
		return SourcebookLogic.getCareers(props.sourcebooks)
			.flatMap(c => {
				const withIncidents: Career[] = [];
				c.incitingIncidents.options.forEach(i => {
					const selected = Utils.copy(c.incitingIncidents);
					selected.selected = Utils.copy(i);
					withIncidents.push({
						...c,
						incitingIncidents: selected
					});
				});
				return withIncidents;
			})
			.map(HeroSheetBuilder.buildCareerSheet);
	};

	const getAllComplications = () => {
		return SourcebookLogic.getComplications(props.sourcebooks)
			.map(HeroSheetBuilder.buildComplicationSheet);
	};

	const getPreviewPage = () => {
		if (heroID === 'careers') {
			return (
				<main id='hero-sheet-page' className='classic-sheet'>
					<div className={getPageClasses()}>
						<h2>All Careers</h2>
						<div className='all-careers'>
							<CareerCard
								career={undefined}
								hero={fakeHero}
							/>
							{getAllCareers().map(c => {
								return (
									<CareerCard
										key={c.id}
										career={c}
										hero={fakeHero}
									/>
								);
							})}
						</div>
					</div>
				</main>
			);
		} else if (heroID === 'complications') {
			return (
				<main id='hero-sheet-page' className='classic-sheet'>
					<div className={getPageClasses()}>
						<h2>All Complications</h2>
						<div className='all-complications'>
							<ComplicationCard
								complication={undefined}
								hero={fakeHero}
							/>
							{getAllComplications().map(c => {
								return (
									<ComplicationCard
										key={c.id}
										complication={c}
										hero={fakeHero}
									/>
								);
							})}
						</div>
					</div>
				</main>
			);
		} else {
			return (
				<HeroSheetPage
					hero={hero}
					sourcebooks={props.sourcebooks}
				/>
			);
		}
	};

	try {
		return (
			<div id='pdf-preview'>
				<div className='menu'>
					<Segmented
						options={[
							{ value: 'html', label: 'HTML' },
							{ value: 'canvas', label: 'Canvas' }
						]}
						value={previewOptions}
						onChange={setDisplay}
					/>
				</div>
				{getPreviewPage()}
				<div id='pdf-canvas'></div>
				<FloatButton
					icon={<SettingFilled />}
					onClick={showDrawer}
					tooltip={<div>Sheet Display Options</div>}
				/>
				<Drawer
					title='Sheet Display Options'
					closable={{ 'aria-label': 'Close Button' }}
					onClose={onDrawerClose}
					open={drawerOpen}
					style={{ padding: '10px' }}
				>

					<Toggle label='Show play state' value={options.includePlayState} onChange={createOptionOnChange('includePlayState')} />
					<Toggle label='Use color' value={options.colorSheet} onChange={createOptionOnChange('colorSheet')} />
					<Divider size='small'>Text Color</Divider>
					<Segmented
						name='textColor'
						block={true}
						options={[
							{ value: 'dark', label: 'Darker' },
							{ value: 'default', label: 'Default' },
							{ value: 'light', label: 'Lighter' }
						]}
						value={options.sheetTextColor}
						onChange={changeTextColor}
					/>
					<Divider size='small'>Include Class Features</Divider>
					<Segmented
						name='abilitySort'
						block={true}
						options={[
							{ value: 'minimal', label: 'Minimal' },
							{ value: 'no-basic', label: 'No Simple' },
							{ value: 'all', label: 'All' }
						]}
						value={options.featuresInclude}
						onChange={createOptionOnChange('featuresInclude')}
					/>
					<Divider>Abilities</Divider>
					<Toggle label='Include standard abilities' value={options.showStandardAbilities} onChange={createOptionOnChange('showStandardAbilities')} />
					<Divider size='small'>Sort Abilities By</Divider>
					<Segmented
						name='abilitySort'
						block={true}
						options={[
							{ value: 'size', label: 'Length' },
							{ value: 'type', label: 'Action Type' }
						]}
						value={options.abilitySort}
						onChange={createOptionOnChange('abilitySort')}
					/>
					<Divider>Layout</Divider>
					<Space direction='vertical' style={{ width: '100%' }}>
						<Segmented
							name='pagesize'
							block={true}
							value={options.classicSheetPageSize}
							options={[
								{ value: SheetPageSize.Letter, label: 'Letter' },
								{ value: SheetPageSize.A4, label: 'A4' }
							]}
							onChange={createOptionOnChange('classicSheetPageSize')}
						/>
						<Segmented
							name='orientation'
							block={true}
							options={[
								{ value: 'portrait', label: 'Portrait' },
								{ value: 'landscape', label: 'Landscape' }
							]}
							value={options.pageOrientation}
							onChange={createOptionOnChange('pageOrientation')}
						/>
					</Space>
				</Drawer>
			</div>
		);
	} catch (ex) {
		console.error(ex);
		return null;
	}
};
