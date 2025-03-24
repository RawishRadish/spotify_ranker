import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './context/UserAuthContext.jsx';
import { PlaylistProvider } from './context/PlaylistContext.jsx';
import { SpotifyAuthProvider } from './context/SpotifyAuthContext.jsx';
import { AudioProvider } from './context/AudioContext.jsx';
import router from './router.jsx';
import { RouterProvider } from 'react-router-dom';
import './index.css';

createRoot(document.getElementById('root')).render(
 // <StrictMode>
    <AuthProvider>
      <SpotifyAuthProvider>
        <PlaylistProvider>
          <AudioProvider>
            <RouterProvider router={router} />
          </AudioProvider>
        </PlaylistProvider>
      </SpotifyAuthProvider>
    </AuthProvider>
 // </StrictMode>,
);
