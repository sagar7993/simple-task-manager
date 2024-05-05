import { FC, Fragment, ReactElement, useEffect } from 'react';
import { Navigate, Routes, Route } from 'react-router';
import { BrowserRouter } from 'react-router-dom';
import { useAtomValue, useSetAtom } from 'jotai';
import { RoutePaths } from './Constants/login';
import { userAtom } from './State/authState';
import Login from './Components/Login';
import Signup from './Components/Signup';
import TasksList from './Components/TaskList';
import { firebase } from './Services/firebase';
import { Loader } from './Components/Loader';
import { NotificationsProvider } from './Components/NotificationsProvider';
import { CssBaseline } from '@mui/material';

const PrivateRoute: FC<{ children: ReactElement; }> = ({ children }) => {
  const { loading, user } = useAtomValue(userAtom);
  return loading ? <Loader /> : (user?.uid ? children : <Navigate to={RoutePaths.Login} replace={true} />);
};

const PublicRoute: FC<{ children: ReactElement; }> = ({ children }) => {
  const { loading, user } = useAtomValue(userAtom);
  return loading ? <Loader /> : (user?.uid ? <Navigate to={RoutePaths.Tasks} replace={true} /> : children);
};

const App: FC = () => {
  const setUser = useSetAtom(userAtom);

  useEffect(() => {
    const unsubscribe = firebase.auth.onAuthStateChanged((user) => {
      setUser((prev) => ({ ...prev, loading: false, user }));
    });
    return () => unsubscribe();
  }, [setUser]);

  return (
    <Fragment>
      <CssBaseline />
      <BrowserRouter>
        <NotificationsProvider maxNotifications={5} />
        <Routes>
          <Route path={RoutePaths.Tasks} element={<PrivateRoute><TasksList /></PrivateRoute>} />
          <Route path={RoutePaths.Login} element={<PublicRoute><Login /></PublicRoute>} />
          <Route path={RoutePaths.Signup} element={<PublicRoute><Signup /></PublicRoute>} />
          <Route path="*" element={<Navigate to={RoutePaths.Login} replace={true} />} />
        </Routes>
      </BrowserRouter>
    </Fragment>
  );
};

export default App;
