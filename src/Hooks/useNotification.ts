import { useAtomCallback } from 'jotai/utils';
import { notificationKeysAtom, notificationAtomFamily } from '../State/notificationsState';
import { Notification } from '../Types/notification';
import { useCallback } from 'react';

const useNotifications = () => {
	const addNotification = useAtomCallback<void, Partial<Notification> & { message: Notification['message'] }>(

		useCallback((get, set, { id, ...content }) => {
			const realId = id ? id : Date.now().toString();
			let ids = get(notificationKeysAtom);
			if (ids.includes(realId)) {
				ids = ids.filter((id) => id !== realId);
			}
			const notification = {
				id: realId,
				open: true,
				message: content.message,
				type: content.type ?? 'success',
				autoHideDuration: content.autoHideDuration ?? 2000,
			};
			set(notificationKeysAtom, [...ids, realId]);
			set(notificationAtomFamily({ id: realId }), notification);
			return realId;
		}, [])
	);

	const hideNotification = useAtomCallback<void, { id: string }>((get, set, { id }) => {
		const notificationAtom = notificationAtomFamily({ id });
		const notification = get(notificationAtom);
		set(notificationAtomFamily({ id }), { ...notification, open: false });
	});

	const removeNotification = useAtomCallback<void, { id: string }>((get, set, { id }) => {
		set(notificationKeysAtom, (ids) => ids.filter((sid) => sid !== id));
	});

	return { removeNotification, hideNotification, addNotification };
};

export default useNotifications;
