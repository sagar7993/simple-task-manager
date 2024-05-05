import { FC, Fragment, FormEvent, useState, useEffect, useCallback } from 'react';
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
import { Box, Button, Chip, IconButton, TextField, Typography, useMediaQuery } from '@mui/material';
import { LocalizationProvider, MobileDateTimePicker as DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import EditIcon from '@mui/icons-material/EditOutlined';
import { Loader } from './Loader';
import { EditTaskModal } from './EditTaskModal';
import { ReactComponent as ToDoListBanner } from '../Assets/ToDoListBanner.svg';

import '../Styles/taskList.css';

dayjs.extend(utc);
dayjs.extend(timezone);

interface TaskListProps {}

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
	const [editTaskModalVisible, setEditTaskModalVisible] = useState<string | null>(null);
	const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
	const [filterStatus, setFilterStatus] = useState<TaskStatus | 'ALL'>('ALL');
	const [taskTitle, setTaskTitle] = useState('');
  	const [taskDueDate, setTaskDueDate] = useState<Dayjs | null>(null);
	const [searchTerm, setSearchTerm] = useState('');
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

	const fetchTasksData = useCallback(async () => {
		if (!user?.uid) {
			setTasks([]);
			return;
		}
		setLoading(true);
		const tasksData = await fetchTasks(
			{ userId: user?.uid as string },
			{ status: filterStatus === 'ALL' ? undefined : filterStatus, searchTerm }
		);
		setTasks(tasksData);
		setLoading(false);
	}, [user?.uid, filterStatus, searchTerm, setTasks]);

	useEffect(() => {
		fetchTasksData();
	}, [fetchTasksData]);

	useEffect(() => {
		const filtered = tasks.filter(task => {
			if (filterStatus !== 'ALL' && task.status !== filterStatus) return false;
			if (searchTerm && !task.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
			return true;
		});
		setFilteredTasks(filtered);
	}, [tasks, filterStatus, searchTerm]);

	const handleSort = useCallback((sortOrder: 'asc' | 'desc') => {
		const sortedTasks = [...filteredTasks].sort((a, b) => {
			if (sortOrder === 'asc') {
				return a.title.localeCompare(b.title);
			} else {
				return b.title.localeCompare(a.title);
			}
		});
		setFilteredTasks(sortedTasks);
		setSortOrder(sortOrder);
	}, [filteredTasks]);

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
	}, [setLoading, addNotification]);

	const handleDeleteTask = useCallback(async (taskId: string) => {
		setLoading(true);
		try {
			await deleteTask(taskId);
			setTasks((prev) => prev.filter((task) => task.id !== taskId));
			setLoading(false);
			addNotification({ type: 'success', message: 'Task deletion successful' });
		} catch (error) {
			setLoading(false);
			addNotification({ type: 'error', message: (error as FirebaseError).message });
		}
	}, [setLoading, addNotification]);

	const handleEditTask = useCallback(async (taskId: string, updates: Partial<Omit<Task, 'id' | 'userId' | 'createdDate' | 'updatedDate'>>) => {
		setLoading(true);
		try {
			await updateTask(taskId, { title: updates.title, description: updates.description, status: updates.status, dueDate: updates.dueDate });
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
      const task = await createTask({ title: taskTitle.trim(), status: TaskStatus.ToDo, dueDate: taskDueDate?.toDate?.(), userId: user?.uid as string });
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
								onChange={({ target:{ value } }) => setTaskTitle(value)}
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
										<IconButton onClick={() => handleDeleteTask(task.id)} disabled={loading} className="task-item-delete-icon">
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
		</Box>
	);
};

export default TaskList;
