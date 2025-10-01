import { AppError, useAppStore } from '@/store/store';
import { Button, Divider, Segmented, Space } from 'antd';
import { CopyOutlined, MoonOutlined, SettingOutlined, SunOutlined } from '@ant-design/icons';
import { DangerButton } from '@/components/controls/danger-button/danger-button';
import { Expander } from '@/components/controls/expander/expander';
import { Field } from '@/components/controls/field/field';
import { HeaderText } from '@/components/controls/header-text/header-text';
import { LogoPanel } from '@/components/panels/logo/logo-panel';
import { Modal } from '@/components/modals/modal/modal';
import { SelectablePanel } from '@/components/controls/selectable-panel/selectable-panel';
import { useTheme } from '@/hooks/use-theme';

import pbds from '@/assets/powered-by-draw-steel.png';
import pkg from '../../../../package.json';

import './about-modal.scss';

interface Props {
	onClose: () => void;
}

export const AboutModal = (props: Props) => {
	const { themeMode, setTheme } = useTheme();
	const { errors, clearErrors: clearStoreErrors } = useAppStore();

	try {
		const clearErrors = () => {
			clearStoreErrors();
			props.onClose();
		};

		const getError = (appError: AppError) => {
			const unknownError = appError.err;
			let message = '';
			let clipboardOutput = `error: ${unknownError}
error json: ${JSON.stringify(unknownError)}`;
			let error: Error | null = null;
			const fields: { label: string, value: string }[] = [];
			if (unknownError instanceof Event) {
				const event = unknownError;
				fields.push({ label: 'Type', value: 'event' });
				fields.push({ label: 'Event Type', value: `${event.type}` });
				if (event instanceof ErrorEvent) {
					error = event.error;
				}
				else if (event instanceof PromiseRejectionEvent) {
					error = event.reason;
				}
			}
			else if (unknownError instanceof Error) {
				fields.push({ label: 'Type', value: 'error' });
				error = unknownError;
			}

			if (error instanceof Error) {
				message = error.message;
				clipboardOutput = `message ${message}`;
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				const errAny = error as any;
				if (errAny.filename) {
					fields.push({ label: 'Location', value: `${errAny.filename}, line ${errAny.lineno}, column ${errAny.colno}` });
					clipboardOutput += `
file ${errAny.filename}
line ${errAny.lineno}
col ${errAny.colno}`;
				}

				const stringifiedError = JSON.stringify(error);
				if (stringifiedError != '{}') {
					fields.push({ label: 'Data', value: stringifiedError });
					clipboardOutput += `
data ${stringifiedError}`;
				}

				if (errAny.stack) {
					fields.push({ label: 'Stack', value: errAny.stack });
					clipboardOutput += `
stack ${errAny.stack}`;
				}

				if (error.cause && error.cause instanceof Error) {
					fields.push({ label: 'Cause', value: error.cause.message });
					clipboardOutput += `
cause ${error.cause.message}`;
					if (error.cause.stack) {
						fields.push({ label: 'Cause Stack', value: error.cause.stack });
						clipboardOutput += `
cause stack ${error.cause.stack}`;
					}
				}
			}
			else {
				message = String(unknownError);
			}

			return (
				<SelectablePanel key={appError.id}>
					<HeaderText
						extra={
							<Button
								type='text'
								icon={<CopyOutlined />}
								onClick={() => navigator.clipboard.writeText(clipboardOutput)}
							/>
						}
					>
						{message}
					</HeaderText>
					{fields.map((field, n) => <Field key={n} label={field.label} value={field.value} />)}
				</SelectablePanel>
			);
		};

		return (
			<Modal
				content={
					<div className='about-modal'>
						<div className='logo-container'>
							<LogoPanel />
						</div>
						<p>
							Designed by <a href='mailto:andy.aiken@live.co.uk'>Andy Aiken</a>.
						</p>
						<p>
							To suggest a new feature or improvement, or to report a bug, go <a href='https://github.com/andyaiken/forgesteel/issues' target='_blank'>here</a>.
						</p>
						<p>
							If you would like to contribute to this project, you can find the code <a href='https://github.com/andyaiken/forgesteel' target='_blank'>here</a>.
						</p>
						<Field label='Version' value={pkg.version} />
						<Divider />
						<p>
							<b>FORGE STEEL</b> is free.
						</p>
						<p>
							If you really feel the need to show your appreciation, I'd be grateful if you would take whatever you feel the app is worth and donate it to a local mental health charity.
						</p>
						<p>
							If after all that you <i>still</i> have too much spare cash, you can always <a href='https://coff.ee/andyaiken' target='_blank'>buy me a coffee</a>.
						</p>
						<Divider />
						<div className='logo-container'>
							<img src={pbds} />
						</div>
						<p>
							<b>FORGE STEEL</b> is an independent product published under the DRAW STEEL Creator License and is not affiliated with MCDM Productions, LLC.
						</p>
						<p>
							<b>DRAW STEEL</b> © 2024 <a href='https://mcdmproductions.com/' target='_blank'>MCDM Productions, LLC.</a>
						</p>
						<Divider />
						<Segmented
							block={true}
							value={themeMode}
							onChange={setTheme}
							options={[
								{ label: 'Light', value: 'light', icon: <SunOutlined /> },
								{ label: 'System', value: 'system', icon: <SettingOutlined /> },
								{ label: 'Dark', value: 'dark', icon: <MoonOutlined /> }
							]}
						/>
						{errors.length > 0 && (
							<>
								<Divider />
								<Expander
									title='Logs'
									extra={[
										<DangerButton key='clear' mode='clear' onConfirm={clearErrors} />
									]}
								>
									<Space direction='vertical' style={{ width: '100%', paddingTop: '15px' }}>
										{errors.map(getError)}
									</Space>
								</Expander>
							</>
						)}
					</div>
				}
				onClose={props.onClose}
			/>
		);
	} catch (ex) {
		console.error(ex);
		return null;
	}
};
