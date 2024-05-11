import { FC, Fragment } from 'react';
import { TaskStatus } from '../Types/taskTypes';
import { taskStatusDisplayLabel } from '../Constants/task';
import { Chip } from '@mui/material';

export const TaskStatusChip: FC<{ status: TaskStatus; }> = ({ status }) => {
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