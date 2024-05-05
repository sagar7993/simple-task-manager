import { TextFieldProps } from '@mui/material';

export const RoutePaths = {
	Login: '/login',
	Signup: '/signup',
	Tasks: '/tasks',
	Home: '/',
}

export const loginTextFieldProps: TextFieldProps = {
	variant: 'outlined',
	required: true,
	autoCapitalize: 'off',
	autoCorrect: 'off',
	classes: {
		root: 'login-form-input-container'
	},
	InputLabelProps: {
		className: 'login-form-input-label'
	},
	InputProps: {
		classes: {
			root: 'login-form-input'
		}
	},
	sx: {
		'& .MuiOutlinedInput-root': {
			'& fieldset': {
				borderColor: '#ffffff'
			},
			'&:hover fieldset': {
				borderColor: '#1890ff'
			},
			'&.Mui-focused fieldset': {
				borderColor: '#1890ff'
			}
		},
	}
};
