import { FC, FormEvent, useEffect, useState, useCallback } from 'react';
import { Button, TextField, Box,  Modal, TextareaAutosize, Select, MenuItem } from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { Task, TaskStatus } from '../Types/taskTypes';
import { DATE_TIME_DAYJS_FORMAT, taskDateTimePickerProps, taskTextFieldProps, taskTextAreaProps, taskStatusDisplayLabel } from '../Constants/task';
import { LocalizationProvider, MobileDateTimePicker as DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

dayjs.extend(utc);
dayjs.extend(timezone);

interface EditTaskModalProps {
	open: boolean;
	loading: boolean;
	onClose: () => void;
	onSubmit: (taskId: string, updates: Partial<Omit<Task, 'id' | 'userId' | 'createdDate' | 'updatedDate'>>) => Promise<void>;
	task: Task;
}

export const EditTaskModal: FC<EditTaskModalProps> = ({ open, loading, onClose, onSubmit, task }) => {
	const [title, setTitle] = useState(task?.title ?? '');
	const [description, setDescription] = useState(task?.description ?? '');
	const [dueDate, setDueDate] = useState<Dayjs | null>(task?.dueDate ? dayjs(task?.dueDate) : null);
	const [status, setStatus] = useState(task?.status ?? TaskStatus.ToDo);

	useEffect(() => {
		if (!open) {
			// Reset all values in the form after modal is closed
			setTitle('');
			setDescription('');
			setDueDate(null);
			setStatus(TaskStatus.ToDo);
			return;
		}
		// Set the initial values in form after modal is opened
		setTitle(task?.title);
		setDescription(task?.description || '');
		setDueDate(task?.dueDate ? dayjs(task?.dueDate) : null);
		setStatus(task?.status);
	}, [open, task?.title, task?.description, task?.dueDate, task?.status]);

	const handleFormSubmit = useCallback(() => {
		// Check if the task id is a valid string
		if (typeof task?.id !== 'string' || task?.id?.length === 0) {
			return;
		}
		// Check if the title and status are valid strings
		if ((typeof title !== 'string' || title?.trim?.()?.length === 0) || ([TaskStatus.Done, TaskStatus.InProgress, TaskStatus.ToDo].indexOf(status as TaskStatus) === -1)) {
			return;
		}
		onSubmit(task?.id, { title, description, dueDate: dueDate?.toDate?.(), status });
	}, [onSubmit, task?.id, title, description, dueDate, status]);

	return (
		<Modal open={open} onClose={onClose}>
			<Box className="edit-task-modal-container">
				{(typeof task?.id === 'string' && task?.id?.length > 0) && (
					<form className="task-edit-container" onSubmit={(event: FormEvent) => { event.preventDefault(); handleFormSubmit(); }}>
						<Box className="task-edit-form-fields">
							{/* Text field for task title */}
							<TextField
								{...taskTextFieldProps }
								type="text"
								placeholder="Please enter task title"
								value={title ?? ''}
								onChange={({ target: { value } }) => setTitle(value)}
								autoFocus={true}
								autoComplete="off"
							/>
							{/* Text area for task description */}
							<TextareaAutosize
								{...taskTextAreaProps}
								placeholder="Please enter task description"
								value={description ?? ''}
								onChange={({ target: { value } }) => setDescription(value)}
								onResize={() => {}}
								autoComplete="off"
								minRows={2}
								maxRows={4}
							/>
							<Box className="task-edit-date-status">
								{/* Date time picker for task due date */}
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
								{/* Select field for task status */}
								<Select<TaskStatus>
									size="small"
									className="task-edit-status"
									value={status ?? TaskStatus.ToDo}
									onChange={({ target: { value } }) => setStatus(value as TaskStatus)}
									classes={{
										select: 'task-edit-status-select'
									}}
								>
									<MenuItem value={TaskStatus.ToDo}>{taskStatusDisplayLabel[TaskStatus.ToDo]}</MenuItem>
									<MenuItem value={TaskStatus.InProgress}>{taskStatusDisplayLabel[TaskStatus.InProgress]}</MenuItem>
									<MenuItem value={TaskStatus.Done}>{taskStatusDisplayLabel[TaskStatus.Done]}</MenuItem>
								</Select>
							</Box>
						</Box>
						<Box className="task-edit-form-actions">
							{/* Cancel button to abort editing task */}
							<Button
								variant="text"
								type="button"
								className="task-form-cancel-button"
								data-testid="task-form-cancel-button"
								// Disable cancel button while loading state is true
								disabled={loading}
								onClick={onClose}
							>
								Cancel
							</Button>
							{/* Submit button to update task */}
							<Button
								variant="contained"
								type="submit"
								className="task-form-submit-button"
								data-testid="task-modal-submit-button"
								// Disable submit button until valid title is entered
								disabled={loading || typeof title !== 'string' || title.trim().length === 0}
							>
								Update task
							</Button>
						</Box>
					</form>
				)}
			</Box>
		</Modal>
	);
};