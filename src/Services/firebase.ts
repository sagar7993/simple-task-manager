import { initializeApp } from 'firebase/app';
import {
	getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword,
	sendPasswordResetEmail, verifyPasswordResetCode, signOut,
	User
} from 'firebase/auth';
import {
	getFirestore, or, and, collection, query, where, orderBy, addDoc, getDocs, updateDoc, deleteDoc, doc,
	FieldPath, WhereFilterOp, Query, DocumentData, CollectionReference,
	QueryConstraint, QueryFilterConstraint, QueryNonFilterConstraint, QueryCompositeFilterConstraint,
	WithFieldValue, DocumentReference, UpdateData, OrderByDirection,
} from 'firebase/firestore';

const app = initializeApp({
	apiKey: 'AIzaSyB1G1qdtfesThEuZH2z_PvkQFsUdJn7Oh8',
	authDomain: 'codemonk-task-manager.firebaseapp.com',
	projectId: 'codemonk-task-manager',
	storageBucket: 'codemonk-task-manager.appspot.com',
	messagingSenderId: '90069756654',
	appId: '1:90069756654:web:796b7c51fcd2043ff8e1ff'
});
const auth = getAuth(app);
const firestore = getFirestore(app);

export const firebase = {
	app,
	auth: {
		...auth,
		onAuthStateChanged: (callback: (user: User | null) => void) => onAuthStateChanged(auth, callback),
		signInWithEmailAndPassword: (email: string, password: string) => signInWithEmailAndPassword(auth, email, password),
		createUserWithEmailAndPassword: (email: string, password: string) => createUserWithEmailAndPassword(auth, email, password),
		sendPasswordResetEmail: (email: string) => sendPasswordResetEmail(auth, email),
		verifyPasswordResetCode: (code: string) => verifyPasswordResetCode(auth, code),
		signOut: () => signOut(auth),
	},
	firestore: {
		db: firestore,
		or: (...queryConstraints: QueryFilterConstraint[]) => or(...queryConstraints),
		and: (...queryConstraints: QueryFilterConstraint[]) => and(...queryConstraints),
		collection: <AppModelType, DbModelType extends DocumentData>(path: string, ...pathSegments: string[]) => collection(firestore, path, ...pathSegments) as CollectionReference<AppModelType, DbModelType>,
		query: <AppModelType, DbModelType extends DocumentData>(reference: Query<AppModelType, DbModelType>, ...queryConstraints: QueryConstraint[]) => query<AppModelType, DbModelType>(reference, ...queryConstraints),
		compositeQuery: <AppModelType, DbModelType extends DocumentData>(reference: Query<AppModelType, DbModelType>, compositeFilter: QueryCompositeFilterConstraint, ...queryConstraints: QueryNonFilterConstraint[]) => query<AppModelType, DbModelType>(reference, compositeFilter, ...queryConstraints),
		where: (fieldPath: string | FieldPath, opStr: WhereFilterOp, value: unknown) => where(fieldPath, opStr, value),
		orderBy: (fieldPath: string | FieldPath, directionStr?: OrderByDirection) => orderBy(fieldPath, directionStr),
		addDoc: <AppModelType, DbModelType extends DocumentData>(reference: CollectionReference<AppModelType, DbModelType>, data: WithFieldValue<AppModelType>) => addDoc<AppModelType, DbModelType>(reference, data),
		getDocs: <AppModelType, DbModelType extends DocumentData>(query: Query<AppModelType, DbModelType>) => getDocs<AppModelType, DbModelType>(query),
		updateDoc: <AppModelType, DbModelType extends DocumentData>(reference: DocumentReference<AppModelType, DbModelType>, data: UpdateData<DbModelType>) => updateDoc<AppModelType, DbModelType>(reference, data),
		deleteDoc: <AppModelType, DbModelType extends DocumentData>(reference: DocumentReference<AppModelType, DbModelType>) => deleteDoc<AppModelType, DbModelType>(reference),
		doc: <AppModelType, DbModelType extends DocumentData>(path: string, ...pathSegments: string[]) => doc(firestore, path, ...pathSegments) as DocumentReference<AppModelType, DbModelType>,
	},
};
