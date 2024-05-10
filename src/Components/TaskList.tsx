import { FC, Fragment, FormEvent, useState, useEffect, useCallback, useMemo } from 'react';
import { FirebaseError } from 'firebase/app';
import { useAtom } from 'jotai';
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { Task, TaskStatus } from '../Types/taskTypes';
import { signOut } from '../Services/authService';
import { createTask, deleteTask, fetchTasks, updateTask } from '../Services/taskService';
import { userAtom } from '../State/authState';
import { DATE_TIME_DAYJS_FORMAT, getGravatarProfilePhotoUrl, taskDateTimePickerProps, taskStatusDisplayLabel, taskTextFieldProps } from '../Constants/task';
import useNotifications from '../Hooks/useNotification';
import { Box, Button, Chip, Divider, IconButton, MenuItem, Modal, Select, TextField, Typography, useMediaQuery } from '@mui/material';
import { LocalizationProvider, MobileDateTimePicker as DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import EditIcon from '@mui/icons-material/EditOutlined';
import { Loader } from './Loader';
import { EditTaskModal } from './EditTaskModal';
import { ReactComponent as ToDoListBanner } from '../Assets/ToDoListBanner.svg';

import '../Styles/taskList.css';
import useDebounce from '../Hooks/useDebounce';

dayjs.extend(utc);
dayjs.extend(timezone);

interface TaskListProps { }

const TaskStatusChip: FC<{ status: TaskStatus; }> = ({ status }) => {
	if (typeof status !== 'string' || status.length === 0) {
		return <Fragment />
	}
	return (
		<Chip label={taskStatusDisplayLabel[status] ?? status} className="task-item-status" style={{
			color: status === TaskStatus.ToDo ? '#C21313' : (status === TaskStatus.InProgress ? '#E7961C' : '#2C8E47'),
			backgroundColor: status === TaskStatus.ToDo ? 'rgba(194, 19, 19, 0.12)' : (status === TaskStatus.InProgress ? 'rgba(231, 150, 28, 0.20)' : 'rgba(93, 183, 121, 0.20)')
		}} />
	);
};

const TaskList: FC<TaskListProps> = () => {
	const [{ user }, setUser] = useAtom(userAtom);

	const { addNotification } = useNotifications();
	const isNotMobile = useMediaQuery('(min-width:600px)');

	const [loading, setLoading] = useState(false);
	const [tasks, setTasks] = useState<Task[]>([]);
	const [deleteTaskModalVisible, setDeleteTaskModalVisible] = useState<string | null>(null);
	const [editTaskModalVisible, setEditTaskModalVisible] = useState<string | null>(null);
	const [filterStatus, setFilterStatus] = useState<TaskStatus | 'ALL'>('ALL');
	const [taskTitle, setTaskTitle] = useState('');
	const [taskDueDate, setTaskDueDate] = useState<Dayjs | null>(null);
	const [searchTerm, setSearchTerm] = useState('');

	const debouncedSearchTerm = useDebounce<string>(searchTerm, 500);

	const filteredTasks = useMemo(() => {
		return tasks.filter((task) => {
			if (typeof debouncedSearchTerm !== 'string' || debouncedSearchTerm.length === 0) {
				return true;
			}
			return (
				task.title?.toLowerCase?.()?.includes?.(debouncedSearchTerm?.toLowerCase?.()) ||
				task.description?.toLowerCase?.()?.includes?.(debouncedSearchTerm?.toLowerCase?.())
			)
		})
	}, [tasks, debouncedSearchTerm]);

	const fetchTasksData = useCallback(async () => {
		if (!user?.uid) {
			setTasks([]);
			return;
		}
		setLoading(true);
		const tasksData = await fetchTasks(
			{ userId: user?.uid as string },
			{ status: filterStatus === 'ALL' ? undefined : filterStatus, searchTerm: debouncedSearchTerm }
		);
		setTasks(tasksData);
		setLoading(false);
	}, [user?.uid, filterStatus, debouncedSearchTerm, setTasks]);

	useEffect(() => {
		fetchTasksData();
	}, [fetchTasksData]);

	const handleSignout = useCallback(async () => {
		setUser((prev) => ({ ...prev, loading: true }));
		setLoading(true);
		try {
			await signOut();
			setUser((prev) => ({ ...prev, loading: false, user: null }));
		} catch (error) {
			addNotification({ type: 'error', message: (error as FirebaseError).message });
		} finally {
			setUser((prev) => ({ ...prev, loading: false }));
		}
	}, [setLoading, setUser, addNotification]);

	const handleDeleteTask = useCallback(async (taskId: string) => {
		if (typeof taskId !== 'string' || taskId.length === 0) {
			return;
		}
		setLoading(true);
		try {
			await deleteTask(taskId);
			setTasks((prev) => prev.filter((task) => task.id !== taskId));
			setLoading(false);
			addNotification({ type: 'success', message: 'Task deletion successful' });
		} catch (error) {
			setLoading(false);
			addNotification({ type: 'error', message: (error as FirebaseError).message });
		} finally {
			setDeleteTaskModalVisible(null);
		}
	}, [setLoading, addNotification]);

	const handleEditTask = useCallback(async (taskId: string, updates: Partial<Omit<Task, 'id' | 'userId' | 'createdDate' | 'updatedDate'>>) => {
		if (typeof taskId !== 'string' || taskId.length === 0) {
			return;
		}
		if ((typeof updates.title !== 'string' || updates.title.trim().length === 0) || (typeof updates.status !== 'string')) {
			return;
		}
		setLoading(true);
		try {
			await updateTask(taskId, { title: updates.title?.trim?.(), description: updates.description?.trim?.(), status: updates.status, dueDate: updates.dueDate });
			setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, ...updates } : t));
			setLoading(false);
			addNotification({ type: 'success', message: 'Task update successful' });
		} catch (error) {
			setLoading(false);
			addNotification({ type: 'error', message: (error as FirebaseError).message });
		} finally {
			setEditTaskModalVisible(null);
		}
	}, [setLoading, addNotification]);

	const handleAddTask = useCallback(async () => {
		if (typeof taskTitle !== 'string' || taskTitle.trim().length === 0) {
			return;
		}
		setLoading(true);
		try {
			const task = await createTask({ title: taskTitle.trim(), description: '', status: TaskStatus.ToDo, dueDate: taskDueDate?.toDate?.(), userId: user?.uid as string });
			setTasks((prev) => ([task, ...prev]));
			setLoading(false);
			addNotification({ type: 'success', message: 'Task creation successful' });
		} catch (error) {
			setLoading(false);
			addNotification({ type: 'error', message: (error as FirebaseError).message });
		} finally {
			setTaskTitle('');
			setTaskDueDate(null);
		}
	}, [taskTitle, taskDueDate, user?.uid, setLoading, addNotification]);

	return (
		<Box className="task-list-container">
			<IconButton className="task-list-profile" disabled={loading} disableRipple={true} onClick={handleSignout}>
				<img src={getGravatarProfilePhotoUrl(user?.email, 200)} alt="gravatar" className="task-list-gravatar" />
				<Typography className="task-list-logout" component="div" tabIndex={-1}>Logout</Typography>
			</IconButton>
			<Typography className="task-list-heading" component="h1">Lets do some tasks!</Typography>
			<Box className="task-list">
				{loading ? <Loader /> : (
					<Fragment>
						<form className="task-create-container" onSubmit={(event: FormEvent) => { event.preventDefault(); handleAddTask(); }}>
							<TextField
								{...taskTextFieldProps}
								type="text"
								placeholder="Please enter task title"
								value={taskTitle ?? ''}
								onChange={({ target: { value } }) => setTaskTitle(value)}
								autoFocus={true}
								autoComplete="off"
							/>
							<Box className="task-create-actions">
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
								<Button
									variant="contained"
									type="submit"
									className="task-form-submit-button"
									disabled={loading || typeof taskTitle !== 'string' || taskTitle.trim().length === 0}
								>
									Add task
								</Button>
							</Box>
						</form>
						<Divider className="task-list-divider" />
						<Box className="task-filter-container">
							<TextField
								{...taskTextFieldProps}
								classes={{ root: 'task-form-input-container' }}
								InputLabelProps={{ className: 'task-form-input-label' }}
								InputProps={{ classes: { root: 'task-form-input' } }}
								type="text"
								placeholder="Search tasks by title or description"
								value={searchTerm ?? ''}
								onChange={({ target: { value } }) => setSearchTerm(value)}
								autoFocus={true}
								autoComplete="off"
							/>
							<Box className="task-filter-sort-container">
								<Typography className="task-filter-sort-heading" component="div">Sort by:</Typography>
								<Select<TaskStatus | 'ALL'>
									size="small"
									className="task-filter-status"
									value={filterStatus ?? 'All'}
									onChange={({ target: { value } }) => setFilterStatus(value as TaskStatus)}
									classes={{
										select: 'task-filter-status-select'
									}}
								>
									<MenuItem value="ALL">All</MenuItem>
									<MenuItem value={TaskStatus.ToDo}>{taskStatusDisplayLabel[TaskStatus.ToDo]}</MenuItem>
									<MenuItem value={TaskStatus.InProgress}>{taskStatusDisplayLabel[TaskStatus.InProgress]}</MenuItem>
									<MenuItem value={TaskStatus.Done}>{taskStatusDisplayLabel[TaskStatus.Done]}</MenuItem>
								</Select>
							</Box>
						</Box>
						{filteredTasks.length === 0 ? (
							<Box className="task-items-empty-container">
								<ToDoListBanner className="task-items-empty-banner" />
								<Typography className="task-items-empty-label" component="h2">No tasks created</Typography>
							</Box>
						) : (
							<Box className="task-items">
									{filteredTasks.map((task) => (
									<Box key={task.id} className="task-item">
										<Box className="task-item-contents">
											{(((task.title as string)?.trim?.()?.length > 0) || (typeof task.status === 'string' && task.status.length > 0)) && (
												<Box className="task-item-title-container">
													{((task.title as string)?.trim?.()?.length > 0) && (
														<Typography className="task-item-title" component="div">
															{task.title?.trim?.()}
														</Typography>
													)}
													{isNotMobile && <TaskStatusChip status={task.status} />}
												</Box>
											)}
											<Box className="task-item-actions-container">
												<IconButton onClick={() => setEditTaskModalVisible(task.id)} disabled={loading} className="task-item-edit-icon">
													<EditIcon />
												</IconButton>
												<IconButton onClick={() => setDeleteTaskModalVisible(task.id)} disabled={loading} className="task-item-delete-icon">
													<DeleteIcon />
												</IconButton>
											</Box>
										</Box>
										{(task.description as string)?.trim?.()?.length > 0 && (
											<Typography className="task-item-description" component="div">
												{task.description?.trim?.()}
											</Typography>
										)}
										{!isNotMobile && <TaskStatusChip status={task.status} />}
									</Box>
								))}
							</Box>
						)}
					</Fragment>
				)}
			</Box>
			<EditTaskModal
				open={!!editTaskModalVisible}
				loading={loading}
				onClose={() => setEditTaskModalVisible(null)}
				onSubmit={handleEditTask}
				task={tasks.find(task => task.id === editTaskModalVisible) as Task}
			/>
			<Modal open={!!deleteTaskModalVisible} onClose={() => setDeleteTaskModalVisible(null)}>
				<Box className="delete-task-modal-container">
					<Typography className="delete-task-modal-heading" component="div">
						Are you sure you want to delete {(tasks.find(task => task.id === deleteTaskModalVisible))?.title?.trim?.()}?
					</Typography>
					<Box className="delete-task-modal-actions">
						<Button
							variant="text"
							type="button"
							className="delete-task-modal-submit-button"
							disabled={loading}
							onClick={() => setDeleteTaskModalVisible(null)}
						>
							Cancel
						</Button>
						<Button
							variant="contained"
							type="submit"
							className="delete-task-modal-cancel-button"
							disabled={loading}
							onClick={() => handleDeleteTask((tasks.find(task => task.id === deleteTaskModalVisible))?.id as string)}
						>
							Delete task
						</Button>
					</Box>
				</Box>
			</Modal>
		</Box>
	);
};

export default TaskList;
