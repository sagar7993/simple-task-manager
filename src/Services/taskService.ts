import { firebase } from './firebase';
import { QueryConstraint, QueryFieldFilterConstraint, QueryFilterConstraint } from 'firebase/firestore';
import { Task, TaskStatus } from '../Types/taskTypes';

export const fetchTasks = async (
	{ userId }: { userId: string; },
	{ status, searchTerm }: { status?: TaskStatus; searchTerm?: string; }
) => {
	const queryWhere: QueryConstraint[] = [firebase.firestore.orderBy('updatedDate', 'desc')];
	const searchByUserIdWhere: QueryFilterConstraint = firebase.firestore.where('userId', '==', userId);
	const searchByStatusWhere: QueryFilterConstraint = firebase.firestore.where('status', '==', status);
	const searchByTitleWhere: QueryFieldFilterConstraint[] = [
		firebase.firestore.where('title', '>=', searchTerm),
		firebase.firestore.where('title', '<=', searchTerm + '\uf8ff	')
	];
	const searchByDescriptionWhere: QueryFieldFilterConstraint[] = [
		firebase.firestore.where('description', '>=', searchTerm),
		firebase.firestore.where('description', '<=', searchTerm + '\uf8ff	')
	];
	if (typeof userId === 'string' && userId.length > 0) {
		queryWhere.push(searchByUserIdWhere);
	}
	if (typeof status === 'string' && status.length > 0) {
		queryWhere.push(searchByStatusWhere);
	}
	// if (typeof searchTerm === 'string' && searchTerm.length > 0) {
	// 	queryWhere.push(
	// 		firebase.firestore.where<Omit<Task, 'id'>, Omit<Task, 'id'>>('title', '>=', searchTerm),
	// 		firebase.firestore.where<Omit<Task, 'id'>, Omit<Task, 'id'>>('description', '>=', searchTerm)
	// 	);
	// }
	// if (typeof searchTerm === 'string' && searchTerm.length > 0) {
	// 	queryWhere.push(
	// 		firebase.firestore.or(
	// 			firebase.firestore.or(...searchByTitleWhere),
	// 			firebase.firestore.or(...searchByDescriptionWhere),
	// 		) as unknown as QueryConstraint
	// 	);
	// }
	const querySnapshot = await firebase.firestore.getDocs<Omit<Task, 'id'>, Omit<Task, 'id'>>(
		firebase.firestore.query<Omit<Task, 'id'>, Omit<Task, 'id'>>(
			firebase.firestore.collection<Omit<Task, 'id'>, Omit<Task, 'id'>>('tasks'),
			...queryWhere,
		)
	);
	const tasks: Task[] = [];
	querySnapshot.forEach((doc) => {
		tasks.push({ id: doc.id, ...doc.data() });
	});
	return tasks;
};

export const createTask = async (task: Omit<Task, 'id'>) => {
	if (typeof task.dueDate === 'undefined') {
		delete task.dueDate;
	}
	task.createdDate = new Date();
	task.updatedDate = new Date();
	const taskRef = await firebase.firestore.addDoc<Omit<Task, 'id'>, Omit<Task, 'id'>>(firebase.firestore.collection('tasks'), task);
	return { id: taskRef.id, ...task } as Task;
};

export const updateTask = async (taskId: string, updates: Partial<Omit<Task, 'id' | 'userId' | 'createdDate' | 'updatedDate'>>) => {
	if (typeof updates.dueDate === 'undefined') {
		delete updates.dueDate;
	}
	const taskDocRef = firebase.firestore.doc<Omit<Task, 'id'>, Omit<Task, 'id'>>('tasks', taskId);
	await firebase.firestore.updateDoc<Omit<Task, 'id'>, Omit<Task, 'id'>>(taskDocRef, updates);
};

export const deleteTask = async (taskId: string) => {
	const taskDocRef = firebase.firestore.doc<Omit<Task, 'id'>, Omit<Task, 'id'>>('tasks', taskId);
	await firebase.firestore.deleteDoc<Omit<Task, 'id'>, Omit<Task, 'id'>>(taskDocRef);
};
