import { TextFieldProps, TextareaAutosizeProps } from '@mui/material';
import { TaskStatus } from '../Types/taskTypes';
import { MobileDateTimePickerProps as DateTimePickerProps } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import MD5 from './md5';

export const DATE_TIME_DAYJS_FORMAT = 'MMMM DD, YYYY, h:mm A';

export const DATE_DAYJS_FORMAT = 'MMMM DD, YYYY';

export const taskStatusDisplayLabel = {
	[TaskStatus.ToDo]: 'To Do',
	[TaskStatus.InProgress]: 'In Progress',
	[TaskStatus.Done]: 'Done'
};

export const taskDateTimePickerProps: Partial<DateTimePickerProps<Dayjs>> = {
	className: 'task-form-date-time-picker',
	slotProps: {
		mobilePaper: {
			sx: {
				borderRadius: '8px',
				boxShadow: 'rgba(161, 161, 161, 0.50) 0px 2px 4px'
			}
		},
		textField: {
			placeholder: 'Due date',
			sx: {
				height: '32px',
				backgroundColor: 'transparent',
				padding: '3px 12px',
				border: '1px solid #ffffff',
				borderRadius: '4px',
				'&:hover': {
					borderColor: '#1890ff'
				},
				'&.Mui-disabled': {
					color: '#fffff',
					boxShadow: 'none',
					backgroundColor: 'transparent',
					WebkitTextFillColor: '#fffff',
					border: 'none'
				},
				'.MuiInputBase-root': {
					paddingRight: '0px',
					height: '100%'
				},
				'.MuiInputAdornment-root': {
					display: 'none'
				},
				'input': {
					fontSize: '16px',
					lineHeight: '20px',
					padding: '0px',
					color: '#ffffff',
					whiteSpace: 'nowrap',
					textOverflow: 'ellipsis',
					overflow: 'hidden',
					maxWidth: '100%'
				},
				'input::disabled': {
					color: '#ffffff',
					boxShadow: 'none',
					backgroundColor: 'transparent',
					WebkitTextFillColor: '#ffffff'
				},
				'input::placeholder, textArea::placeholder': {
					color: '#ffffff'
				},
				'fieldset': {
					border: 'none'
				}
			}
		}
	},
	ampm: true,
	ampmInClock: true,
	closeOnSelect: false,
	disableFuture: false,
	disablePast: false,
	disableOpenPicker: false,
	disableHighlightToday: false,
	defaultCalendarMonth: dayjs(new Date())
};

export const taskTextFieldProps: TextFieldProps = {
	variant: 'outlined',
	required: true,
	autoCapitalize: 'off',
	autoCorrect: 'off',
	classes: {
		root: 'task-form-input-container'
	},
	InputLabelProps: {
		className: 'task-form-input-label'
	},
	InputProps: {
		classes: {
			root: 'task-form-input'
		}
	},
	sx: {
		height: '36px',
		'& .MuiOutlinedInput-root': {
			'& fieldset': {
				borderColor: '#ffffff'
			},
			'&:hover fieldset': {
				borderColor: '#1890ff'
			},
			'&.Mui-focused fieldset': {
				borderColor: '#1890ff'
			}
		},
	}
};

export const taskTextAreaProps: TextareaAutosizeProps = {
	autoCapitalize: 'off',
	autoCorrect: 'off',
	className: 'task-edit-text-area'
};

export const getGravatarProfilePhotoUrl = (email: string | null | undefined, dimension: number) => {
	if (!email || email.length === 0 || !dimension || isNaN(dimension)) {
		return 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
	}
	return `https://secure.gravatar.com/avatar/${MD5(email)}?s=${dimension}&r=pg&d=mm`;
};

export const stripHTMLFromUserInput = (potentialHTML: string) => {
	const doc = new DOMParser().parseFromString(potentialHTML, 'text/html');
	return doc.body.textContent as string;
};
