import { Task, TaskStatus } from '../Types/taskTypes';
import { stripHTMLFromUserInput } from '../Constants/task';

// Check `firebase.json` files to review the security rules defined in firebase for server side validations
// Security rules are defined to allow list/read operations for current logged in user's tasks only
// Security rules are there to allow update/delete operations for current logged in user's tasks only

export const fetchTasks = async (
	{ userId }: { userId: string; },
	{ status, searchTerm }: { status?: TaskStatus; searchTerm?: string; }
) => {
	const params = new URLSearchParams();
	params.append('userId', userId);
	if ([TaskStatus.Done, TaskStatus.InProgress, TaskStatus.ToDo].indexOf(status as TaskStatus) > -1) {
		params.append('status', status as string);
	}
	if (typeof searchTerm === 'string' && searchTerm.trim().length > 0) {
		params.append('searchTerm', searchTerm.trim());
	}
	const data = await fetch(`/api/v1/tasks${params.size > 0 ? `?${params.toString()}` : ''}`);
	return data.json() as Promise<Task[]>;
};

export const createTask = async (task: Omit<Task, 'id' | 'createdDate' | 'updatedDate'>) => {
	// Check if the title is a valid string and status is a valid enum value
	if (
		(typeof task.title !== 'string' || task.title.trim().length === 0) ||
		([TaskStatus.Done, TaskStatus.InProgress, TaskStatus.ToDo].indexOf(task.status as TaskStatus) === -1)
	) {
		throw Error('Please set valid task title and status');
	}
	// Check if optional values are sent as undefined, firestore only allows null values
	if (typeof task.dueDate === 'undefined') {
		delete task.dueDate;
	}
	if (typeof task.description === 'undefined') {
		delete task.description;
	}
	// Remove all potential HTML from title and description to prevent XSS
	task.title = stripHTMLFromUserInput(task.title);
	if (typeof task.description === 'string' && task.description.trim().length === 0) {
		task.description = stripHTMLFromUserInput(task.description);
	}
	// Firestore rules already created to handle further server side validations in firebase.json file
	// Ensure to set createdDate and updatedDate to current date timestamp
	const data = await fetch('/api/v1/tasks', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ ...task, createdDate: new Date(), updatedDate: new Date() } as Task)
	});
	return data.json() as Promise<Task>;
};

export const updateTask = async (taskId: string, updates: Partial<Omit<Task, 'id' | 'userId' | 'createdDate' | 'updatedDate'>>) => {
	// Check if the taskId is a valid string
	if (typeof taskId !== 'string' || taskId.trim().length === 0) {
		throw Error('Please use valid task id');
	}
	// Check if the title is a valid string and status is a valid enum value
	if (
		(typeof updates.title !== 'string' || updates.title.trim().length === 0) ||
		([TaskStatus.Done, TaskStatus.InProgress, TaskStatus.ToDo].indexOf(updates.status as TaskStatus) === -1)
	) {
		throw Error('Please set valid task title and status');
	}
	// Check if optional values are sent as undefined, firestore only allows null values
	if (typeof updates.dueDate === 'undefined') {
		delete updates.dueDate;
	}
	// Remove all potential HTML from title and description to prevent XSS
	updates.title = stripHTMLFromUserInput(updates.title);
	if (typeof updates.description === 'string' && updates.description.trim().length === 0) {
		updates.description = stripHTMLFromUserInput(updates.description);
	}
	// Firestore rules already created to handle further server side validations in firebase.json file
	// Ensure to set updatedDate to current date timestamp
	const data = await fetch('/api/v1/tasks', {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ ...updates, id: taskId.trim(), updatedDate: new Date() } as Task)
	});
	return data.json() as Promise<void>;
};

export const deleteTask = async (taskId: string) => {
	// Check if the taskId is a valid string
	if (typeof taskId !== 'string' || taskId.trim().length === 0) {
		throw Error('Please use valid task id');
	}
	// Firestore rules already created to handle further server side validations in firebase.json file
	const data = await fetch('/api/v1/tasks', {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ id: taskId.trim() } as Task)
	});
	return data.json() as Promise<void>;
};
