import { User, UserCredential } from 'firebase/auth';
import { firebase } from './firebase';

export const signIn = async ({ email, password }: { email: string, password: string }): Promise<UserCredential> => {
	try {
		return firebase.auth.signInWithEmailAndPassword(email, password);
	} catch (error) {
		throw error;
	}
};

export const signUp = async ({ email, password }: { email: string, password: string }): Promise<UserCredential> => {
	try {
		return firebase.auth.createUserWithEmailAndPassword(email, password);
	} catch (error) {
		throw error;
	}
};

export const signOut = async (): Promise<void> => {
	try {
		return firebase.auth.signOut();
	} catch (error) {
		throw error;
	}
};

export const getCurrentUser = (): User | null => {
	return firebase.auth.currentUser;
};
