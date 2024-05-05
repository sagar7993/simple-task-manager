import { FC } from 'react';
import { Box, Divider, Typography } from '@mui/material';

export const AuthBanner: FC = () => {
	return (
		<Box className="login-banner-container">
			<Box className="login-banner">
				<Typography className="login-banner-title" component="h4">Task manager</Typography>
				<Divider className="login-banner-title-divider" role="separator"></Divider>
				<Typography className="login-banner-subtitle" component="h5">Task management made easy</Typography>
				<Typography className="login-banner-description" component="h6">Hassle free management of your task list</Typography>
			</Box>
		</Box>
	);
};