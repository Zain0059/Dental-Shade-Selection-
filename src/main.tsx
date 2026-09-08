import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { CaseProvider } from './context/CaseContext.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <CaseProvider>
        <App />
      </CaseProvider>
    </ErrorBoundary>
  </StrictMode>,
);
