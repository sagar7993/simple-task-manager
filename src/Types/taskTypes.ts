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

// This is the enum used for the possible values of `sortBy` query parameter in the fetch tasks API
export enum TaskSortBy {
	TitleDesc = 'title_desc',
	TitleAsc = 'title_asc',
	DueDateDesc = 'dueDate_desc',
	DueDateAsc = 'dueDate_asc',
	UpdatedDateDesc = 'updatedDate_desc',
	UpdatedDateAsc = 'updatedDate_asc',
}
