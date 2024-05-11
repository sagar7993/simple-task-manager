import { FC, Fragment, ReactElement, Suspense, lazy, useEffect } from 'react';
import { Navigate, Routes, Route } from 'react-router';
import { BrowserRouter } from 'react-router-dom';
import { useAtomValue, useSetAtom } from 'jotai';
import { RoutePaths } from './Constants/login';
import { userAtom } from './State/authState';
import { firebase } from './Services/firebase';
import { Loader } from './Components/Loader';
import { NotificationsProvider } from './Components/NotificationsProvider';
import { CssBaseline } from '@mui/material';

// Lazy load components to improve initial load time using react code splitting
const Login = lazy(() => import('./Components/Login'));
const Signup = lazy(() => import('./Components/Signup'));
const TasksList = lazy(() => import('./Components/TaskList'));

// Component to render private routes will redirect to login page if user is not logged in
const PrivateRoute: FC<{ children: ReactElement; }> = ({ children }) => {
  const { loading, user } = useAtomValue(userAtom);
  return loading ? <Loader /> : (user?.uid ? children : <Navigate to={RoutePaths.Login} replace={true} />);
};

// Component to render public routes will redirect to tasks page if user is already logged in
const PublicRoute: FC<{ children: ReactElement; }> = ({ children }) => {
  const { loading, user } = useAtomValue(userAtom);
  return loading ? <Loader /> : (user?.uid ? <Navigate to={RoutePaths.Tasks} replace={true} /> : children);
};

const App: FC = () => {
  const setUser = useSetAtom(userAtom);

  useEffect(() => {
    // Subscribe to auth state changes to update user atom
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
          <Route
            path={RoutePaths.Tasks}
            element={(
              <PrivateRoute>
                {/* Render tasks list route as lazy component with loading spinner as fallback */}
                <Suspense fallback={<Loader />}>
                  <TasksList />
                </Suspense>
              </PrivateRoute>
            )}
          />
          <Route
            path={RoutePaths.Login}
            element={(
              <PublicRoute>
                {/* Render login route as lazy component with loading spinner as fallback */}
                <Suspense fallback={<Loader />}>
                  <Login />
                </Suspense>
              </PublicRoute>
            )}
          />
          <Route
            path={RoutePaths.Signup}
            element={(
              <PublicRoute>
                {/* Render signup route as lazy component with loading spinner as fallback */}
                <Suspense fallback={<Loader />}>
                  <Signup />
                </Suspense>
              </PublicRoute>
            )}
          />
          <Route path="*" element={<Navigate to={RoutePaths.Login} replace={true} />} />
        </Routes>
      </BrowserRouter>
    </Fragment>
  );
};

export default App;
