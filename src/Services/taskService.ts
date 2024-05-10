import { firebase } from './firebase';
import { Task, TaskStatus } from '../Types/taskTypes';
import { stripHTMLFromUserInput } from '../Constants/task';

export const fetchTasks = async (
	{ userId }: { userId: string; },
	{ status, searchTerm }: { status?: TaskStatus; searchTerm?: string; }
) => {
	const collectionRef = firebase.firestore.collection<Omit<Task, 'id'>, Omit<Task, 'id'>>('tasks');
	let queryRef = firebase.firestore.query<Omit<Task, 'id'>, Omit<Task, 'id'>>(collectionRef);
	queryRef = firebase.firestore.query<Omit<Task, 'id'>, Omit<Task, 'id'>>(queryRef, firebase.firestore.where('userId', '==', userId));
	if (status) {
		queryRef = firebase.firestore.query<Omit<Task, 'id'>, Omit<Task, 'id'>>(queryRef, firebase.firestore.where('status', '==', status));
	}
	if (searchTerm) {
		queryRef = firebase.firestore.compositeQuery(queryRef, firebase.firestore.and(
			firebase.firestore.or(
				firebase.firestore.where('title', '>=', searchTerm.toLowerCase()),
				firebase.firestore.where('title', '<=', searchTerm.toLowerCase() + '\uf8ff'),
				firebase.firestore.where('description', '>=', searchTerm.toLowerCase()),
				firebase.firestore.where('description', '<=', searchTerm.toLowerCase() + '\uf8ff')
			)
		));
	}
	queryRef = firebase.firestore.query<Omit<Task, 'id'>, Omit<Task, 'id'>>(queryRef, firebase.firestore.orderBy('updatedDate', 'desc'));
	const querySnapshot = await firebase.firestore.getDocs<Omit<Task, 'id'>, Omit<Task, 'id'>>(queryRef);
	return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
};

export const createTask = async (task: Omit<Task, 'id'>) => {
	if (
		(typeof task.title !== 'string' || task.title.trim().length === 0) ||
		([TaskStatus.Done, TaskStatus.InProgress, TaskStatus.ToDo].indexOf(task.status as TaskStatus) === -1)
	) {
		throw Error('Please set valid task title and status');
	}
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
	task.createdDate = new Date();
	task.updatedDate = new Date();
	const taskRef = await firebase.firestore.addDoc<Omit<Task, 'id'>, Omit<Task, 'id'>>(firebase.firestore.collection('tasks'), task);
	return { id: taskRef.id, ...task } as Task;
};

export const updateTask = async (taskId: string, updates: Partial<Omit<Task, 'id' | 'userId' | 'createdDate' | 'updatedDate'>>) => {
	if (typeof taskId !== 'string' || taskId.length === 0) {
		throw Error('Please use valid task id');
	}
	if (
		(typeof updates.title !== 'string' || updates.title.trim().length === 0) ||
		([TaskStatus.Done, TaskStatus.InProgress, TaskStatus.ToDo].indexOf(updates.status as TaskStatus) === -1)
	) {
		throw Error('Please set valid task title and status');
	}
	if (typeof updates.dueDate === 'undefined') {
		delete updates.dueDate;
	}
	// Remove all potential HTML from title and description to prevent XSS
	updates.title = stripHTMLFromUserInput(updates.title);
	if (typeof updates.description === 'string' && updates.description.trim().length === 0) {
		updates.description = stripHTMLFromUserInput(updates.description);
	}
	const taskDocRef = firebase.firestore.doc<Omit<Task, 'id'>, Omit<Task, 'id'>>('tasks', taskId);
	await firebase.firestore.updateDoc<Omit<Task, 'id'>, Omit<Task, 'id'>>(taskDocRef, { ...updates, updatedDate: new Date() });
};

export const deleteTask = async (taskId: string) => {
	if (typeof taskId !== 'string' || taskId.length === 0) {
		throw Error('Please use valid task id');
	}
	const taskDocRef = firebase.firestore.doc<Omit<Task, 'id'>, Omit<Task, 'id'>>('tasks', taskId);
	await firebase.firestore.deleteDoc<Omit<Task, 'id'>, Omit<Task, 'id'>>(taskDocRef);
};
