import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useSetAtom } from 'jotai';
import { userAtom } from './State/authState';

import App from './App';
import { User } from 'firebase/auth';
import { delay } from './Constants/login';

test('shows login screen when user is not logged in', async () => {
	const setUserAtom = useSetAtom(userAtom);
	setUserAtom({ user: null, loading: false });
	render(<App />);
	await screen.findByTestId<HTMLDivElement>('login-container');
});

test('shows tasks screen when user is logged in', async () => {
	const setUserAtom = useSetAtom(userAtom);
	setUserAtom({ user: { uid: 'test-user' } as unknown as User, loading: false });
	render(<App />);
	await screen.findByTestId<HTMLDivElement>('task-list-container');
});

test('shows tasks screen after user has finished login', async () => {
	const setUserAtom = useSetAtom(userAtom);
	setUserAtom({ user: null, loading: false });
	render(<App />);
	fireEvent.click(screen.getByTestId('login-form-submit-button'));
	setUserAtom({ user: { uid: 'test-user' } as unknown as User, loading: false });
	await delay(2000);
	await screen.findByTestId<HTMLDivElement>('task-list-container');
});

test('creates new task after user has submitted the form', async () => {
	const setUserAtom = useSetAtom(userAtom);
	setUserAtom({ user: { uid: 'test-user' } as unknown as User, loading: false });
	render(<App />);
	const taskItems = await screen.findAllByTestId<HTMLDivElement>('task-item');
	fireEvent.click(screen.getByTestId('task-form-submit-button'));
	await delay(2000);
	const updatedTaskItems = await screen.findAllByTestId<HTMLDivElement>('task-item');
	expect(updatedTaskItems.length).toBe(taskItems.length + 1);
});

test('deletes existing task after user has clicked delete icon and confirm button of popup modal', async () => {
	const setUserAtom = useSetAtom(userAtom);
	setUserAtom({ user: { uid: 'test-user' } as unknown as User, loading: false });
	render(<App />);
	const taskItems = await screen.findAllByTestId<HTMLDivElement>('task-item');
	fireEvent.click(screen.getByTestId('task-form-submit-button'));
	fireEvent.click(screen.getByTestId('task-modal-submit-button'));
	await delay(2000);
	const updatedTaskItems = await screen.findAllByTestId<HTMLDivElement>('task-item');
	expect(updatedTaskItems.length).toBe(taskItems.length - 1);
});
