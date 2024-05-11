import { FC, FormEvent, useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { DATE_TIME_DAYJS_FORMAT, taskDateTimePickerProps, taskTextAreaProps, taskTextFieldProps } from '../Constants/task';
import { Box, Button, TextField, TextareaAutosize } from '@mui/material';
import { LocalizationProvider, MobileDateTimePicker as DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Task } from '../Types/taskTypes';

dayjs.extend(utc);
dayjs.extend(timezone);

interface CreateTaskFormProps {
	loading: boolean;
	onSubmit: (task: Pick<Task, 'title' | 'dueDate'>) => Promise<void>;
}

export const CreateTaskForm: FC<CreateTaskFormProps> = ({ onSubmit, loading }) => {
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState<string>('');
	const [dueDate, setDueDate] = useState<Dayjs | null>(null);

	return (
		<form className="task-create-container" onSubmit={(event: FormEvent) => { event.preventDefault(); onSubmit({ title, dueDate: (dueDate as Dayjs | null)?.toDate?.() }); }}>
			<Box className="task-fields-container">
				<TextField
					{...taskTextFieldProps}
					type="text"
					placeholder="Please enter task title"
					value={title ?? ''}
					onChange={({ target: { value } }) => setTitle(value)}
					autoFocus={true}
					autoComplete="off"
				/>
				<Box className="task-create-actions">
					<LocalizationProvider dateAdapter={AdapterDayjs}>
						<DateTimePicker<Dayjs>
							{...taskDateTimePickerProps}
							format={DATE_TIME_DAYJS_FORMAT}
							value={dueDate ?? null}
							onAccept={setDueDate}
							onChange={setDueDate}
							// Ensure that due date cannot be past date
							minDate={dayjs().tz('UTC').startOf('day')}
						/>
					</LocalizationProvider>
					<Button
						variant="contained"
						type="submit"
						className="task-form-submit-button"
						data-testid="task-form-submit-button"
						// Disable submit button until valid title is entered
						disabled={loading || typeof title !== 'string' || title.trim().length === 0}
					>
						Add task
					</Button>
				</Box>
			</Box>
			<TextareaAutosize
				{...taskTextAreaProps}
				placeholder="Please enter task description"
				value={description ?? ''}
				onChange={({ target: { value } }) => setDescription(value)}
				onResize={() => { }}
				autoComplete="off"
				minRows={2}
				maxRows={4}
			/>
		</form>
	);
}