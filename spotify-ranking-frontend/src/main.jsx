import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './UserAuthContext.jsx';
import { PlaylistProvider } from './PlaylistContext.jsx';
import router from './router.jsx';
import { RouterProvider } from 'react-router-dom';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <PlaylistProvider>
        <RouterProvider router={router} />
      </PlaylistProvider>
    </AuthProvider>
  </StrictMode>,
);
