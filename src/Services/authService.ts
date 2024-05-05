import { firebase } from './firebase';

export const signIn = async (email: string, password: string) => {
	try {
		return firebase.auth.signInWithEmailAndPassword(email, password);
	} catch (error) {
		throw error;
	}
};

export const signUp = async (email: string, password: string) => {
	try {
		return firebase.auth.createUserWithEmailAndPassword(email, password);
	} catch (error) {
		throw error;
	}
};

export const signOut = async () => {
	try {
		return firebase.auth.signOut();
	} catch (error) {
		throw error;
	}
};

export const getCurrentUser = () => {
	return firebase.auth.currentUser;
};
