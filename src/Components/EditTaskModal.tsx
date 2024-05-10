import { FC, FormEvent, useEffect, useState } from 'react';
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
	onSubmit: (taskId: string, updates: Partial<Omit<Task, 'id' | 'userId' | 'createdDate' | 'updatedDate'>>) => void;
	task: Task;
}

export const EditTaskModal: FC<EditTaskModalProps> = ({ open, loading, onClose, onSubmit, task }) => {
	const [taskTitle, setTaskTitle] = useState(task?.title ?? '');
	const [taskDescription, setTaskDescription] = useState(task?.description ?? '');
	const [taskDueDate, setTaskDueDate] = useState<Dayjs | null>(task?.dueDate ? dayjs(task?.dueDate) : null);
	const [taskStatus, setTaskStatus] = useState(task?.status ?? TaskStatus.ToDo);

	useEffect(() => {
		if (!open) {
			setTaskTitle('');
			setTaskDescription('');
			setTaskDueDate(null);
			setTaskStatus(TaskStatus.ToDo);
			return;
		}
		setTaskTitle(task?.title);
		setTaskDescription(task?.description || '');
		setTaskDueDate(task?.dueDate ? dayjs(task?.dueDate) : null);
		setTaskStatus(task?.status);
	}, [open, task?.title, task?.description, task?.dueDate, task?.status]);

	return (
		<Modal open={open} onClose={onClose}>
			<Box className="edit-task-modal-container">
				{(typeof task?.id === 'string' && task?.id?.length > 0) && (
					<form className="task-edit-container" onSubmit={(event: FormEvent) => { event.preventDefault(); onSubmit(task?.id, {
						title: taskTitle,
						description: taskDescription,
						dueDate: taskDueDate?.toDate?.(),
						status: taskStatus
					}); }}>
						<Box className="task-edit-form-fields">
							<TextField
								{...taskTextFieldProps }
								type="text"
								placeholder="Please enter task title"
								value={taskTitle ?? ''}
								onChange={({ target: { value } }) => setTaskTitle(value)}
								autoFocus={true}
								autoComplete="off"
							/>
							<TextareaAutosize
								{...taskTextAreaProps}
								placeholder="Please enter task description"
								value={taskDescription ?? ''}
								onChange={({ target: { value } }) => setTaskDescription(value)}
								onResize={() => {}}
								autoComplete="off"
								minRows={2}
								maxRows={4}
							/>
							<Box className="task-edit-date-status">
								<LocalizationProvider dateAdapter={AdapterDayjs}>
									<DateTimePicker<Dayjs>
										{...taskDateTimePickerProps}
										format={DATE_TIME_DAYJS_FORMAT}
										value={taskDueDate ?? null}
										onAccept={setTaskDueDate}
										onChange={setTaskDueDate}
										// Ensure that due date cannot be past date
										minDate={dayjs().tz('UTC').startOf('day')}
									/>
								</LocalizationProvider>
								<Select<TaskStatus>
									size="small"
									className="task-edit-status"
									value={taskStatus ?? TaskStatus.ToDo}
									onChange={({ target: { value } }) => setTaskStatus(value as TaskStatus)}
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
							<Button
								variant="text"
								type="button"
								className="task-form-cancel-button"
								data-testid="task-form-cancel-button"
								disabled={loading}
								onClick={onClose}
							>
								Cancel
							</Button>
							<Button
								variant="contained"
								type="submit"
								className="task-form-submit-button"
								data-testid="task-modal-submit-button"
								disabled={loading || typeof taskTitle !== 'string' || taskTitle.trim().length === 0}
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