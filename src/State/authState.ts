import { atom } from 'jotai';
import { getCurrentUser } from '../Services/authService';

export const userAtom = atom({
	user: getCurrentUser(),
	loading: true,
});
