import { firebase } from './firebase';
import { Task, TaskStatus } from '../Types/taskTypes';
import { stripHTMLFromUserInput } from '../Constants/task';

// Check `firebase.json` files to review the security rules defined in firebase for server side validations
// Security rules are defined to allow list/read operations for current logged in user's tasks only
// Security rules are there to allow update/delete operations for current logged in user's tasks only

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
	const taskRef = await firebase.firestore.addDoc<Omit<Task, 'id'>, Omit<Task, 'id'>>(firebase.firestore.collection('tasks'), task);
	return { id: taskRef.id, ...task, createdDate: new Date(), updatedDate: new Date() } as Task;
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
	const taskDocRef = firebase.firestore.doc<Omit<Task, 'id'>, Omit<Task, 'id'>>('tasks', taskId.trim());
	// Firestore rules already created to handle further server side validations in firebase.json file
	// Ensure to set updatedDate to current date timestamp
	await firebase.firestore.updateDoc<Omit<Task, 'id'>, Omit<Task, 'id'>>(taskDocRef, { ...updates, updatedDate: new Date() });
};

export const deleteTask = async (taskId: string) => {
	// Check if the taskId is a valid string
	if (typeof taskId !== 'string' || taskId.trim().length === 0) {
		throw Error('Please use valid task id');
	}
	const taskDocRef = firebase.firestore.doc<Omit<Task, 'id'>, Omit<Task, 'id'>>('tasks', taskId.trim());
	// Firestore rules already created to handle further server side validations in firebase.json file
	await firebase.firestore.deleteDoc<Omit<Task, 'id'>, Omit<Task, 'id'>>(taskDocRef);
};
