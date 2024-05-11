import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';

import './Styles/global.css';

const enableMocking = async () => {
  const { worker } = await import('./Mocks/browser');
  return worker.start();
}
enableMocking().then(() => {
  createRoot(document.getElementById('root') as HTMLElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
});

reportWebVitals();
