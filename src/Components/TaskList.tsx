import { FC, Fragment, useState, useEffect, useCallback, useMemo } from 'react';
import { FirebaseError } from 'firebase/app';
import { useAtom } from 'jotai';
import { Virtuoso } from 'react-virtuoso';
import { Task, TaskStatus } from '../Types/taskTypes';
import { signOut } from '../Services/authService';
import { createTask, deleteTask, fetchTasks, updateTask } from '../Services/taskService';
import { userAtom } from '../State/authState';
import { tasksAtom } from '../State/taskState';
import { getGravatarProfilePhotoUrl, taskStatusDisplayLabel, taskTextFieldProps } from '../Constants/task';
import useDebounce from '../Hooks/useDebounce';
import useNotifications from '../Hooks/useNotification';
import { Box, Button, Divider, IconButton, MenuItem, Modal, Select, TextField, Typography, useMediaQuery } from '@mui/material';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import EditIcon from '@mui/icons-material/EditOutlined';
import { Loader } from './Loader';
import { CreateTaskForm } from './CreateTaskForm';
import { EditTaskModal } from './EditTaskModal';
import { TaskStatusChip } from './TaskStatusChip';
import { ReactComponent as ToDoListBanner } from '../Assets/ToDoListBanner.svg';

import '../Styles/taskList.css';

interface TaskListProps { }

const TaskList: FC<TaskListProps> = () => {
	const [{ user }, setUser] = useAtom(userAtom);

	const { addNotification } = useNotifications();
	const isNotMobile = useMediaQuery('(min-width:600px)');

	const [loading, setLoading] = useState(false);
	const [tasks, setTasks] = useAtom(tasksAtom);
	const [deleteTaskModalVisible, setDeleteTaskModalVisible] = useState<string | null>(null);
	const [editTaskModalVisible, setEditTaskModalVisible] = useState<string | null>(null);
	const [filterStatus, setFilterStatus] = useState<TaskStatus | 'ALL'>('ALL');
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
		// Set loading to true so that progress indicator can be shown in the list view
		setLoading(true);
		const tasksData = await fetchTasks(
			{ userId: user?.uid as string },
			{ status: filterStatus === 'ALL' ? undefined : filterStatus, searchTerm: debouncedSearchTerm }
		);
		setTasks(tasksData);
		// Set loading to false so that progress indicator can be disabled
		setLoading(false);
	}, [user?.uid, filterStatus, debouncedSearchTerm, setTasks]);

	useEffect(() => {
		fetchTasksData();
	}, [fetchTasksData]);

	const handleSignout = useCallback(async () => {
		// Set loading to true so that progress indicator can be shown in the list view
		setUser((prev) => ({ ...prev, loading: true }));
		setLoading(true);
		try {
			await signOut();
			// Set user to null in the atom so that login screen will be shown automatically
			setUser((prev) => ({ ...prev, loading: false, user: null }));
		} catch (error) {
			// Show error toast notification on bottom right of page
			addNotification({ type: 'error', message: (error as FirebaseError).message });
		} finally {
			// Set loading to false so that progress indicator can be disabled
			setLoading(false);
			setUser((prev) => ({ ...prev, loading: false }));
		}
	}, [setLoading, setUser, addNotification]);

	const handleDeleteTask = useCallback(async (taskId: string) => {
		// Check if the task id is a valid string
		if (typeof taskId !== 'string' || taskId.length === 0) {
			return;
		}
		setLoading(true);
		try {
			await deleteTask(taskId);
			// Remove the deleted task from the tasks list
			setTasks((prev) => prev.filter((task) => task.id !== taskId));
			// Show success toast notification on bottom right of page
			addNotification({ type: 'success', message: 'Task deletion successful' });
		} catch (error) {
			// Show error toast notification on bottom right of page
			addNotification({ type: 'error', message: (error as FirebaseError).message });
		} finally {
			// Set loading to false so that progress indicator can be disabled
			setLoading(false);
			// Close the delete task modal after task is deleted
			setDeleteTaskModalVisible(null);
		}
	}, [setTasks, setLoading, addNotification]);

	const handleEditTask = useCallback(async (taskId: string, updates: Partial<Omit<Task, 'id' | 'userId' | 'createdDate' | 'updatedDate'>>) => {
		// Check if the task id is a valid string and title and status are valid strings
		if (typeof taskId !== 'string' || taskId.length === 0) {
			return;
		}
		if ((typeof updates.title !== 'string' || updates.title.trim().length === 0) || (typeof updates.status !== 'string')) {
			return;
		}
		setLoading(true);
		try {
			await updateTask(taskId, { title: updates.title?.trim?.(), description: updates.description?.trim?.(), status: updates.status, dueDate: updates.dueDate });
			// Update the tasks list with the updated task
			setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, ...updates } : t));
			// Show success toast notification on bottom right of page
			addNotification({ type: 'success', message: 'Task update successful' });
		} catch (error) {
			// Show error toast notification on bottom right of page
			addNotification({ type: 'error', message: (error as FirebaseError).message });
		} finally {
			// Set loading to false so that progress indicator can be disabled
			setLoading(false);
			// Close the edit task modal after task is updated
			setEditTaskModalVisible(null);
		}
	}, [setTasks, setLoading, addNotification]);

	const handleAddTask = useCallback(async ({ title, dueDate }: Pick<Task, 'title' | 'dueDate'>) => {
		// Check if the title is a valid string
		if (typeof title !== 'string' || title.trim().length === 0) {
			return;
		}
		setLoading(true);
		try {
			const task = await createTask({ title: title.trim(), description: '', status: TaskStatus.ToDo, dueDate, userId: user?.uid as string });
			// Update the tasks list with the newly created task
			setTasks((prev) => ([task, ...prev]));
			// Show success toast notification on bottom right of page
			addNotification({ type: 'success', message: 'Task creation successful' });
		} catch (error) {
			// Show error toast notification on bottom right of page
			addNotification({ type: 'error', message: (error as FirebaseError).message });
		} finally {
			// Set loading to false so that progress indicator can be disabled
			setLoading(false);
		}
	}, [user?.uid, setLoading, setTasks, addNotification]);

	const tasksListRowRenderer = useCallback((index: number) => {
		// Return null if the task is not found or the task id is not a valid string
		const task = filteredTasks[index];
		if (!task || typeof task.id !== 'string' || task.id.length === 0) {
			return null;
		}
		return (
			<Box key={task.id} className="task-item-container" data-testid="task-item-container" style={{ paddingBottom: (index === filteredTasks.length - 1) ? 0 : 16 }}>
				<Box className="task-item" data-testid="task-item">
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
			</Box>
		);
	}, [filteredTasks, isNotMobile, loading, setEditTaskModalVisible, setDeleteTaskModalVisible]);

	return (
		<Box className="task-list-container" data-testid="task-list-container">
			<Box className="task-list-profile">
				<img src={getGravatarProfilePhotoUrl(user?.email, 200)} alt="gravatar" className="task-list-gravatar" draggable={false} />
				<IconButton className="task-list-logout-container" data-testid="task-list-logout-container" disabled={loading} disableRipple={true} onClick={handleSignout}>
					<Typography className="task-list-logout" data-testid="task-list-profile" component="div" tabIndex={-1}>Logout</Typography>
				</IconButton>
			</Box>
			<Typography className="task-list-heading" component="h1">Lets do some tasks!</Typography>
			<Box className="task-list">
				{loading ? <Loader /> : (
					<Fragment>
						<CreateTaskForm loading={loading} onSubmit={handleAddTask} />
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
								{/* Render task items in a virtual list to ensure smooth DOM rendering for large lists */}
								<Virtuoso<Task>
									style={{ width: '100%', height: '100%' }}
									totalCount={filteredTasks.length}
									data={filteredTasks}
									itemContent={tasksListRowRenderer}
									defaultItemHeight={100}
									overscan={300}
								/>
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
							data-testid="delete-task-modal-submit-button"
							// Disable cancel button while loading state is true
							disabled={loading}
							onClick={() => setDeleteTaskModalVisible(null)}
						>
							Cancel
						</Button>
						<Button
							variant="contained"
							type="submit"
							className="delete-task-modal-cancel-button"
							data-testid="delete-task-modal-cancel-button"
							// Disable submit button while loading state is true
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
