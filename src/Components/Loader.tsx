import { Box } from '@mui/material';
import { FC } from 'react';

import '../Styles/loader.css';

export const Loader: FC = () => {
	return (
		<Box className="global-loader-container">
			<Box className="global-loader"><Box /><Box /><Box /><Box /></Box>
		</Box>
	);
};