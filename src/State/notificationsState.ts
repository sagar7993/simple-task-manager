import { atom } from 'jotai';
import { atomFamily } from 'jotai/utils';
import { Notification } from '../Types/notification';

interface Param { id: string; }

export const notificationScope = Symbol('notificationScope');

export const notificationAtomFamily = atomFamily(({ id }: Param) => (
	atom<Notification>({ id, message: '', open: true })
), (a, b) => (a.id === b.id));

export const notificationKeysAtom = atom<string[]>([]);
