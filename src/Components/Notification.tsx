import { Alert, Slide } from '@mui/material';
import { useAtomValue } from 'jotai';
import { useRef, useMemo, useEffect, useCallback, FC } from 'react';
import useNotifications from '../Hooks/useNotification';
import { notificationAtomFamily } from '../State/notificationsState';

const Notification: FC<{ id: string }> = ({ id }) => {
	const mountRef = useRef(false);

	const notificationAtom = useMemo(() => notificationAtomFamily({ id }), [id]);

	const notificaiton = useAtomValue(notificationAtom);
	const { open, message, autoHideDuration = 2000, type = 'success' } = notificaiton;
	const { hideNotification, removeNotification } = useNotifications();

	const onExitAnimation = useCallback(() => removeNotification({ id }), [id, removeNotification]);

	useEffect(() => {
		let timer: NodeJS.Timeout;
		const wasMounted = mountRef.current;
		if (!wasMounted) {
			timer = setTimeout(function () {
				hideNotification({ id });
			}, autoHideDuration);
			mountRef.current = true;
		}
		return () => {
			if (timer && wasMounted) {
				clearTimeout(timer);
			}
		};
	}, [hideNotification, id, autoHideDuration]);

	return (
		<Slide
			direction="left"
			in={open}
			mountOnEnter
			unmountOnExit
			style={{ marginBottom: '12px' }}
			onExited={onExitAnimation}
		>
			<Alert severity={type}>{message}</Alert>
		</Slide>
	);
};

export default Notification;
