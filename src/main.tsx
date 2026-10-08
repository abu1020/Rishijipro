import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

createRoot(document.getElementById('root')!).render(
  <ToastProvider>
    <AuthProvider>
      <App />
    </AuthProvider>
  </ToastProvider>
);

