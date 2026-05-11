import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="883770226831-307ikqa6vua8kioe69o228or2pv9qdfs.apps.googleusercontent.com">
      <AuthProvider>
        <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
        <App />
      </AuthProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
);
