import { FC, FormEvent, MouseEvent, useCallback, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAtom } from 'jotai';
import { FirebaseError } from 'firebase/app';
import { signUp } from '../Services/authService';
import { userAtom } from '../State/authState';
import { authErrors } from '../Constants/firebase';
import { RoutePaths, loginTextFieldProps } from '../Constants/login';
import useNotifications from '../Hooks/useNotification';
import { AuthBanner } from './AuthBanner';
import { Box, Button, IconButton, InputAdornment, TextField, Typography } from '@mui/material';

import '../Styles/auth.css';

const Signup: FC = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);

	const navigate = useNavigate();
	const { addNotification } = useNotifications();

	const [{ loading }, setUser] = useAtom(userAtom);

	const handleClickShowPassword = useCallback(() => setShowPassword((show) => !show), [setShowPassword]);

	const handleMouseDownPassword = useCallback((event: MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();
	}, []);

	const handleSignup = useCallback(async () => {
		setUser((prev) => ({ ...prev, loading: true, user: null }));
		try {
			const { user } = await signUp(email, password);
			addNotification({ type: 'success', message: 'Signup successful' });
			setUser((prev) => ({ ...prev, loading: false, user }));
			navigate(RoutePaths.Tasks, { replace: true });
		} catch (error) {
			addNotification({ type: 'error', message: authErrors[(error as FirebaseError).code] ?? (error as FirebaseError).message });
			setUser((prev) => ({ ...prev, loading: false, user: null }));
		}
	}, [email, password, setUser, navigate, addNotification]);

	return (
		<Box className="login-container">
			<AuthBanner />
			<Box className="login-form-container">
				<a className="login-form-logo" href="/">
					<img src="logo192.png" alt="logo" />
					<Typography className="login-form-heading" component="h2">Task manager</Typography>
				</a>
				<Box className="login-form-icon">
					<svg viewBox="64 64 896 896" focusable="false" width="1em" height="1em" fill="currentColor" aria-hidden="true">
						<path d="M832 464h-68V240c0-70.7-57.3-128-128-128H388c-70.7 0-128 57.3-128 128v224h-68c-17.7 0-32 14.3-32 32v384c0 17.7 14.3 32 32 32h640c17.7 0 32-14.3 32-32V496c0-17.7-14.3-32-32-32zM332 240c0-30.9 25.1-56 56-56h248c30.9 0 56 25.1 56 56v224H332V240zm460 600H232V536h560v304zM484 701v53c0 4.4 3.6 8 8 8h40c4.4 0 8-3.6 8-8v-53a48.01 48.01 0 10-56 0z" />
					</svg>
				</Box>
				<Typography className="login-form-label" component="h1">Sign-up</Typography>
				<form className="login-form" onSubmit={(event: FormEvent) => { event.preventDefault(); handleSignup(); }}>
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
									<svg className="login-form-input-adornment" focusable="false" aria-hidden="true" viewBox="0 0 24 24">
										<path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2m0 4-8 5-8-5V6l8 5 8-5z" />
									</svg>
								</InputAdornment>
							),
						}}
					/>
					<TextField
						{...loginTextFieldProps}
						type={showPassword ? 'text' : 'password'}
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
										<svg className="login-form-input-adornment" focusable="false" aria-hidden="true" viewBox="0 0 24 24">
											<path d={showPassword ? 'M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7M2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2m4.31-.78 3.15 3.15.02-.16c0-1.66-1.34-3-3-3z' : 'M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5M12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5m0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3'} />
										</svg>
									</IconButton>
								</InputAdornment>
							),
							startAdornment: (
								<InputAdornment position="start">
									<svg className="login-form-input-adornment" focusable="false" aria-hidden="true" viewBox="0 0 24 24">
										<path d="M12 17c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2m6-9h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6h1.9c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2m0 12H6V10h12z" />
									</svg>
								</InputAdornment>
							),
						}}
					/>
					<Button variant="contained" type="submit" className="login-form-submit-button" disabled={loading}>Sign-up</Button>
					<Button variant="text" type="button" className="login-form-navigate-button" disabled={loading} disableRipple={true} href="/login">Already have account?</Button>
				</form>
			</Box>
		</Box>
	);
};

export default Signup;
