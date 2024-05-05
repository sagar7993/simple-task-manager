import { atom } from 'jotai';
import { getCurrentUser } from '../Services/authService';

export enum AuthActionTypes {
	SIGN_IN = 'SIGN_IN',
	SIGN_UP = 'SIGN_UP',
	SIGN_OUT = 'SIGN_OUT',
}

export interface SignInAction {
	type: AuthActionTypes.SIGN_IN;
	payload: { email: string; password: string };
}

export interface SignUpAction {
	type: AuthActionTypes.SIGN_UP;
	payload: { email: string; password: string };
}

export interface SignOutAction {
	type: AuthActionTypes.SIGN_OUT;
}

export type AuthReducerAction = SignInAction | SignUpAction | SignOutAction;

export const userAtom = atom({
	user: getCurrentUser(),
	loading: true,
});
