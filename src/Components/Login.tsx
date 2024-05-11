import { FC, FormEvent, MouseEvent, useCallback, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAtom } from 'jotai';
import { FirebaseError } from 'firebase/app';
import { signIn } from '../Services/authService';
import { userAtom } from '../State/authState';
import { authErrors } from '../Constants/firebase';
import { RoutePaths, loginTextFieldProps } from '../Constants/login';
import useNotifications from '../Hooks/useNotification';
import { AuthBanner } from './AuthBanner';
import { Box, Button, IconButton, InputAdornment, TextField, Typography } from '@mui/material';
import { ReactComponent as LockIcon } from '../Assets/LockIcon.svg';
import { ReactComponent as EmailIcon } from '../Assets/EmailIcon.svg';
import { ReactComponent as PasswordIcon } from '../Assets/PasswordIcon.svg';
import { ReactComponent as EyeVisibleIcon } from '../Assets/EyeVisible.svg';
import { ReactComponent as EyeInvisibleIcon } from '../Assets/EyeInvisible.svg';

import '../Styles/auth.css';

const Login: FC = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);

	const [{ loading }, setUser] = useAtom(userAtom);

	const navigate = useNavigate();
	const { addNotification } = useNotifications();

	const handleClickShowPassword = useCallback(() => setShowPassword((show) => !show), [setShowPassword]);

	const handleMouseDownPassword = useCallback((event: MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();
	}, []);

	const handleLogin = useCallback(async () => {
		if (
			(typeof email !== 'string' || email.trim().length === 0) || 
			(typeof password !== 'string' || password.trim().length === 0)
		) {
			// Show error toast notification on bottom right of page
			addNotification({ type: 'error', message: 'Please enter valid email and password' });
			return;
		}
		// Set loading to true so that progress indicator can be shown beside the button
		setUser((prev) => ({ ...prev, loading: true, user: null }));
		try {
			const { user } = await signIn({ email: email.trim(), password: password.trim() });
			// Show success toast notification on bottom right of page
			addNotification({ type: 'success', message: 'Login successful' });
			// Set user value so that tasks page can be rendered
			setUser((prev) => ({ ...prev, loading: false, user }));
			navigate(RoutePaths.Tasks, { replace: true });
		} catch (error) {
			// Show error toast notification on bottom right of page
			addNotification({ type: 'error', message: authErrors[(error as FirebaseError).code] ?? (error as FirebaseError).message });
			// Set loading to false so that progress indicator can be disabled
			setUser((prev) => ({ ...prev, loading: false, user: null }));
		} finally {
			// Reset the form after promise is resolved or error is thrown
			setEmail('');
			setPassword('');
		}
	}, [email, password, setUser, navigate, addNotification]);

	return (
		<Box className="login-container" data-testid="login-container">
			<AuthBanner />
			<Box className="login-form-container">
				<a className="login-form-logo" href="/">
					<img src="logo192.png" alt="logo" draggable={false} />
					<Typography className="login-form-heading" component="h2">Task manager</Typography>
				</a>
				<Box className="login-form-icon">
					<LockIcon focusable="false" aria-hidden="true" />
				</Box>
				<Typography className="login-form-label" component="h1">Login</Typography>
				<form className="login-form" onSubmit={(event: FormEvent) => { event.preventDefault(); handleLogin(); }}>
					<TextField
						{...loginTextFieldProps}
						type="email"
						label="Email"
						placeholder="Email"
						value={email ?? ''}
						onChange={({ target: { value } }) => setEmail(value)}
						autoFocus={true}
						autoComplete="email"
						InputProps={{
							...loginTextFieldProps.InputProps,
							startAdornment: (
								<InputAdornment position="start">
									<EmailIcon className="login-form-input-adornment" focusable="false" aria-hidden="true" />
								</InputAdornment>
							),
						}}
					/>
					<TextField
						{...loginTextFieldProps}
						type={showPassword? 'text' : 'password'}
						label="Password"
						placeholder="Password"
						value={password ?? ''}
						onChange={({ target: { value } }) => setPassword(value)}
						autoComplete="current-password"
						InputProps={{
							...loginTextFieldProps.InputProps,
							endAdornment: (
								<InputAdornment position="end">
									<IconButton onClick={handleClickShowPassword} onMouseDown={handleMouseDownPassword} disabled={loading} edge="end">
										{showPassword ? (
											<EyeVisibleIcon className="login-form-input-adornment" focusable="false" aria-hidden="true" />
										) : (
											<EyeInvisibleIcon className="login-form-input-adornment" focusable="false" aria-hidden="true" />
										)}
									</IconButton>
								</InputAdornment>
							),
							startAdornment: (
								<InputAdornment position="start">
									<PasswordIcon className="login-form-input-adornment" focusable="false" aria-hidden="true" />
								</InputAdornment>
							),
						}}
					/>
					<Button
						variant="contained"
						type="submit"
						className="login-form-submit-button"
						data-testid="login-form-submit-button"
						// Disable login submit button while loading state is true
						disabled={loading}
					>
						Login
					</Button>
					<Button
						variant="text"
						type="button"
						className="login-form-navigate-button"
						data-testid="login-form-navigate-button"
						// Disable route change button while loading state is true
						disabled={loading}
						disableRipple={true}
						href={RoutePaths.Signup}
					>
						Don't have account?
					</Button>
				</form>
			</Box>
		</Box>
	);
};

export default Login;
