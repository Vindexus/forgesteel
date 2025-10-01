import { Divider, Segmented, Select, Space } from 'antd';
import { Collections } from '@/utils/collections';
import { ErrorBoundary } from '@/components/controls/error-boundary/error-boundary';
import { Hero } from '@/models/hero';
import { NumberSpin } from '@/components/controls/number-spin/number-spin';
import { PanelWidth } from '@/enums/panel-width';
import { SheetPageSize } from '@/enums/sheet-page-size';
import { SheetTextColor } from '@/models/options';
import { Toggle } from '@/components/controls/toggle/toggle';
import { useAppStore } from '@/store/store';
import { useCreateOptionOnChange } from '@/store/hooks';
import { useEffect } from 'react';

import './options-panel.scss';

interface Props {
	mode: 'hero-modern' | 'hero-classic' | 'monster' | 'encounter-modern' | 'encounter-classic' | 'tactical-map' | 'session' | 'player';
	heroes: Hero[];
}

export const OptionsPanel = (props: Props) => {
	const { options, setOptions, setOption } = useAppStore();
	const createOptionOnChange = useCreateOptionOnChange();

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

	const getContent = () => {
		const getParties = () => {
			return Collections
				.distinct(props.heroes.map(h => h.folder), f => f)
				.sort()
				.filter(f => !!f);
		};

		const getPartySection = (initialDivider: boolean) => {
			const parties = getParties();
			if (parties.length === 0) {
				return null;
			}

			return (
				<>
					{initialDivider ? <Divider /> : null}
					<div className='ds-text'>
						Start encounters with these heroes:
					</div>
					<Select
						style={{ width: '100%' }}
						placeholder='Select a party'
						options={[ '', ...parties ].map(p => ({ value: p, label: p || 'No heroes' }))}
						optionRender={option => <div className='ds-text'>{option.data.label}</div>}
						showSearch={true}
						filterOption={(input, option) => {
							const strings = option ?
								[
									option.label
								]
								: [];
							return strings.some(str => str.toLowerCase().includes(input.toLowerCase()));
						}}
						value={options.party}
						onChange={p => setOptions({ party: p || '' })}
					/>
				</>
			);
		};

		switch (props.mode) {
			case 'hero-modern':
				return (
					<>
						<Toggle label='Separate inventory features' value={options.separateInventoryFeatures} onChange={createOptionOnChange('separateInventoryFeatures')} />
						<Toggle label='Show skills in groups' value={options.showSkillsInGroups} onChange={createOptionOnChange('showSkillsInGroups')} />
						<Toggle label='Include standard abilities' value={options.showStandardAbilities} onChange={createOptionOnChange('showStandardAbilities')} />
						<Toggle label='Dim unavailable abilities' value={options.dimUnavailableAbilities} onChange={createOptionOnChange('dimUnavailableAbilities')} />
						<Toggle label='Show feature / ability sources' value={options.showSources} onChange={createOptionOnChange('showSources')} />
						<Divider>View</Divider>
						<Toggle label='Single page' value={options.singlePage} onChange={createOptionOnChange('singlePage')} />
						<Toggle label='Compact' value={options.compactView} onChange={createOptionOnChange('compactView')} />
						<Divider>Abilities</Divider>
						<Segmented
							name='abilitywidth'
							block={true}
							disabled={options.compactView}
							options={[
								{ value: PanelWidth.Narrow, label: 'S' },
								{ value: PanelWidth.Medium, label: 'M' },
								{ value: PanelWidth.Wide, label: 'L' },
								{ value: PanelWidth.ExtraWide, label: 'XL' }
							]}
							value={options.abilityWidth}
							onChange={createOptionOnChange('abilityWidth')}
						/>
					</>
				);
			case 'hero-classic':
				return (
					<>
						<Toggle label='Show play state' value={options.includePlayState} onChange={createOptionOnChange('includePlayState')} />
						<Toggle label='Use color' value={options.colorSheet} onChange={createOptionOnChange('colorSheet')} />
						<Toggle label='Include standard abilities' value={options.showStandardAbilities} onChange={createOptionOnChange('showStandardAbilities')} />
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
								options={[
									{ value: SheetPageSize.Letter, label: 'Letter' },
									{ value: SheetPageSize.A4, label: 'A4' }
								]}
								value={options.classicSheetPageSize}
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
					</>
				);
			case 'monster':
				return (
					<>
						<div className='ds-text'>Show data from similar monsters using these fields:</div>
						<Toggle label='Monster level' value={options.similarLevel} onChange={createOptionOnChange('similarLevel')} />
						<Toggle label='Monster role' value={options.similarRole} onChange={createOptionOnChange('similarRole')} />
						<Toggle label='Monster organization' value={options.similarOrganization} onChange={createOptionOnChange('similarOrganization')} />
						<Toggle label='Monster size' value={options.similarSize} onChange={createOptionOnChange('similarSize')} />
					</>
				);
			case 'encounter-modern':
				return (
					<>
						<NumberSpin label='Minions per group' min={1} value={options.minionCount} onChange={createOptionOnChange('minionCount')} />
						{getPartySection(true)}
						<Divider />
						<div className='ds-text'>
							Calculate encounter difficulty based on these heroes:
						</div>
						<Select
							style={{ width: '100%' }}
							placeholder='Select a party'
							options={[ ...getParties(), '' ].map(p => ({ value: p, label: p || 'A custom party' }))}
							optionRender={option => <div className='ds-text'>{option.data.label}</div>}
							showSearch={true}
							filterOption={(input, option) => {
								const strings = option ?
									[
										option.label
									]
									: [];
								return strings.some(str => str.toLowerCase().includes(input.toLowerCase()));
							}}
							value={options.heroParty}
							onChange={p => setOptions({ heroParty: p || '' })}
						/>
						{
							options.heroParty === '' ?
								<>
									<NumberSpin label='Number of heroes' min={1} value={options.heroCount} onChange={createOptionOnChange('heroCount')} />
									<NumberSpin label='Hero level' min={1} max={10} value={options.heroLevel} onChange={createOptionOnChange('heroLevel')} />
									<NumberSpin label='Number of victories' min={0} value={options.heroVictories} onChange={createOptionOnChange('heroVictories')} />
								</>
								: null
						}
					</>
				);
			case 'encounter-classic':
				return (
					<>
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
						<Divider>Layout</Divider>
						<Space direction='vertical' style={{ width: '100%' }}>
							<Segmented
								name='pagesize'
								block={true}
								options={[
									{ value: SheetPageSize.Letter, label: 'Letter' },
									{ value: SheetPageSize.A4, label: 'A4' }
								]}
								value={options.classicSheetPageSize}
								onChange={createOptionOnChange('classicSheetPageSize')}
							/>
						</Space>
					</>
				);
			case 'tactical-map':
				return (
					<>
						<NumberSpin label='Map Grid Size' min={5} steps={[ 5 ]} value={options.gridSize} onChange={createOptionOnChange('gridSize')} />
					</>
				);
			case 'session':
				return (
					<>
						{getPartySection(false)}
						<Divider />
						<Toggle label='Show defeated combatants' value={options.showDefeatedCombatants} onChange={createOptionOnChange('showDefeatedCombatants')} />
						<NumberSpin label='Map Grid Size' min={5} steps={[ 5 ]} value={options.gridSize} onChange={createOptionOnChange('gridSize')} />
					</>
				);
			case 'player':
				return (
					<>
						<NumberSpin label='Map Grid Size' min={5} steps={[ 5 ]} value={options.playerGridSize} onChange={createOptionOnChange('playerGridSize')} />
					</>
				);
		}
	};

	try {
		return (
			<ErrorBoundary>
				<div className='options-panel'>
					{getContent()}
				</div>
			</ErrorBoundary>
		);
	} catch (ex) {
		console.error(ex);
		return null;
	}
};
