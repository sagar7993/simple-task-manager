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

export enum TaskStatus {
	ToDo = 'TO_DO',
	InProgress = 'IN_PROGRESS',
	Done = 'DONE',
}
