// This is the interface used for the task object in firestore document
export interface Task {
	id: string;
	userId: string;
	title: string;
	description?: string;
	status: TaskStatus;
	dueDate?: Date;
	createdDate?: Date;
	updatedDate?: Date;
}

// This is the enum used for the possible values of `status` field of the task document in firestore
export enum TaskStatus {
	ToDo = 'TO_DO',
	InProgress = 'IN_PROGRESS',
	Done = 'DONE',
}
