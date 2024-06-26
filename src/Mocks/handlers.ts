import { firebase } from '../Services/firebase';
import { Timestamp } from 'firebase/firestore';
import { http, HttpResponse, PathParams } from 'msw';
import { Task, TaskStatus, TaskSortBy } from '../Types/taskTypes';
import { stripHTMLFromUserInput } from '../Constants/task';

// Check `firebase.json` file to review the security rules defined in firebase for server side validations
// Security rules are defined to allow list/read operations for current logged in user's tasks only
// Security rules are there to allow update/delete operations for current logged in user's tasks only

export const handlers = [
	// HTTP GET method to get all the tasks for current userId from firebase collection
	http.get('/api/v1/tasks', async ({ request }) => {
		const collectionRef = firebase.firestore.collection<Omit<Task, 'id'>, Omit<Task, 'id'>>('tasks');
		const requestUrl = new URL(request.url);
		const userId = requestUrl.searchParams.get('userId');
		const status = requestUrl.searchParams.get('status');
		const searchTerm = requestUrl.searchParams.get('searchTerm');
		const sortBy = requestUrl.searchParams.get('sortBy');
		let queryRef = firebase.firestore.query<Omit<Task, 'id'>, Omit<Task, 'id'>>(collectionRef);
		queryRef = firebase.firestore.query<Omit<Task, 'id'>, Omit<Task, 'id'>>(queryRef, firebase.firestore.where('userId', '==', userId));
		// If status is provided, filter the tasks based on the status
		if ([TaskStatus.Done, TaskStatus.InProgress, TaskStatus.ToDo].indexOf(status as TaskStatus) > -1) {
			queryRef = firebase.firestore.query<Omit<Task, 'id'>, Omit<Task, 'id'>>(queryRef, firebase.firestore.where('status', '==', status));
		}
		// If searchTerm is provided, search for the term in title and description fields
		if (typeof searchTerm === 'string' && searchTerm.trim().length > 0) {
			queryRef = firebase.firestore.compositeQuery(queryRef, firebase.firestore.and(
				firebase.firestore.or(
					firebase.firestore.where('title', '>=', searchTerm.trim().toLowerCase()),
					firebase.firestore.where('title', '<=', searchTerm.trim().toLowerCase() + '\uf8ff'),
					firebase.firestore.where('description', '>=', searchTerm.trim().toLowerCase()),
					firebase.firestore.where('description', '<=', searchTerm.trim().toLowerCase() + '\uf8ff')
				)
			));
		}
		// Order the tasks based on the sortBy query parameter if present
		if ([TaskSortBy.TitleDesc, TaskSortBy.TitleAsc, TaskSortBy.DueDateDesc, TaskSortBy.DueDateAsc, TaskSortBy.UpdatedDateDesc, TaskSortBy.UpdatedDateAsc].indexOf(sortBy as TaskSortBy) > -1) {
			switch (sortBy) {
				case TaskSortBy.TitleDesc: {
					queryRef = firebase.firestore.query<Omit<Task, 'id'>, Omit<Task, 'id'>>(queryRef, firebase.firestore.orderBy('title', 'desc'));
					break;
				}
				case TaskSortBy.TitleAsc: {
					queryRef = firebase.firestore.query<Omit<Task, 'id'>, Omit<Task, 'id'>>(queryRef, firebase.firestore.orderBy('title', 'asc'));
					break;
				}
				case TaskSortBy.DueDateDesc: {
					queryRef = firebase.firestore.query<Omit<Task, 'id'>, Omit<Task, 'id'>>(queryRef, firebase.firestore.orderBy('dueDate', 'desc'));
					break;
				}
				case TaskSortBy.DueDateAsc: {
					queryRef = firebase.firestore.query<Omit<Task, 'id'>, Omit<Task, 'id'>>(queryRef, firebase.firestore.orderBy('dueDate', 'asc'));
					break;
				}
				case TaskSortBy.UpdatedDateDesc: {
					queryRef = firebase.firestore.query<Omit<Task, 'id'>, Omit<Task, 'id'>>(queryRef, firebase.firestore.orderBy('updatedDate', 'desc'));
					break;
				}
				case TaskSortBy.UpdatedDateAsc: {
					queryRef = firebase.firestore.query<Omit<Task, 'id'>, Omit<Task, 'id'>>(queryRef, firebase.firestore.orderBy('updatedDate', 'asc'));
					break;
				}
			}
		} else {
			// Order the tasks based on the updatedDate in descending order as a fallback
			queryRef = firebase.firestore.query<Omit<Task, 'id'>, Omit<Task, 'id'>>(
				queryRef,
				firebase.firestore.orderBy('updatedDate', 'desc')
			);
		}
		const querySnapshot = await firebase.firestore.getDocs<Omit<Task, 'id'>, Omit<Task, 'id'>>(queryRef);
		const tasks = querySnapshot.docs.map((doc) => {
			const task = doc.data();
			return {
				id: doc.id,
				...task,
				createdDate: (task.createdDate as unknown as Timestamp)?.toDate?.(),
				updatedDate: (task.updatedDate as unknown as Timestamp)?.toDate?.()
			} as Task;
		});
		return HttpResponse.json(tasks, { status: 200 });
	}),
	// HTTP POST method to add a new task to the firebase collection
	http.post<PathParams, Omit<Task, 'id' | 'createdDate' | 'updatedDate'>>('/api/v1/tasks', async ({ request }) => {
		const task = await request.json();
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
		// Firestore rules already created to handle further server side validations in `firebase.json` file
		// Ensure to set createdDate and updatedDate to current date timestamp
		const createdDate = new Date();
		const updatedDate = new Date();
		const taskRef = await firebase.firestore.addDoc<Omit<Task, 'id'>, Omit<Task, 'id'>>(firebase.firestore.collection('tasks'), { ...task, createdDate, updatedDate });
		return HttpResponse.json({ id: taskRef.id, ...task, createdDate, updatedDate } as Task, { status: 201 });
	}),
	// HTTP PUT method to update an existing task in the firebase collection
	http.put<PathParams, Partial<Omit<Task, 'userId' | 'createdDate' | 'updatedDate'>>>('api/v1/tasks', async ({ request }) => {
		const task = await request.json();
		// Check if the task id is a valid string
		if (typeof task.id !== 'string' || task.id.trim().length === 0) {
			throw Error('Please use valid task id');
		}
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
		// Remove all potential HTML from title and description to prevent XSS
		task.title = stripHTMLFromUserInput(task.title);
		if (typeof task.description === 'string' && task.description.trim().length === 0) {
			task.description = stripHTMLFromUserInput(task.description);
		}
		const taskDocRef = firebase.firestore.doc<Omit<Task, 'id'>, Omit<Task, 'id'>>('tasks', task.id.trim());
		// Firestore rules already created to handle further server side validations in `firebase.json` file
		// Ensure to set updatedDate to current date timestamp
		const updatedDate = new Date();
		await firebase.firestore.updateDoc<Omit<Task, 'id'>, Omit<Task, 'id'>>(taskDocRef, { ...task, updatedDate });
		return HttpResponse.json({}, { status: 200 });
	}),
	// HTTP DELETE method to delete an existing task in the firebase collection
	http.delete<PathParams, Pick<Task, 'id'>>('api/v1/tasks', async ({ request }) => {
		const task = await request.json();
		// Check if the task id is a valid string
		if (typeof task.id !== 'string' || task.id.trim().length === 0) {
			throw Error('Please use valid task id');
		}
		const taskDocRef = firebase.firestore.doc<Omit<Task, 'id'>, Omit<Task, 'id'>>('tasks', task.id.trim());
		// Firestore rules already created to handle further server side validations in `firebase.json` file
		await firebase.firestore.deleteDoc<Omit<Task, 'id'>, Omit<Task, 'id'>>(taskDocRef);
		return HttpResponse.json({}, { status: 200 });
	})
];
