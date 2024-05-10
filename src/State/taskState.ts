import { atom } from 'jotai';
import { Task } from '../Types/taskTypes';

export const tasksAtom = atom(new Array<Task>());
