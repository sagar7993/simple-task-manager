import { User, UserCredential } from 'firebase/auth';
import { firebase } from './firebase';
import { stripHTMLFromUserInput } from '../Constants/task';

export const signIn = async ({ email, password }: { email: string, password: string }): Promise<UserCredential> => {
	try {
		// Remove all potential HTML from email and password to prevent XSS
		return firebase.auth.signInWithEmailAndPassword(stripHTMLFromUserInput(email), stripHTMLFromUserInput(password));
	} catch (error) {
		throw error;
	}
};

export const signUp = async ({ email, password }: { email: string, password: string }): Promise<UserCredential> => {
	try {
		// Remove all potential HTML from email and password to prevent XSS
		return firebase.auth.createUserWithEmailAndPassword(stripHTMLFromUserInput(email), stripHTMLFromUserInput(password));
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
