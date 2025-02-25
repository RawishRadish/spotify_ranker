import React, { useState, useEffect } from 'react';
import api from '../axiosConfig';
import { usePlaylist } from '../context/PlaylistContext';
import './PlaylistSelect.css';

const PlaylistSelect =  () => {
    const { playlistId, setPlaylistId } = usePlaylist();

    const selectPlaylist = async (playlistId) => {
        setPlaylistId(playlistId);
        try {
            await api.post(`/api/playlists/${playlistId}/songs`);
        } catch (error) {
            console.error('Error importing songs:', error);
            if (error.response && error.response.status === 401) {
                alert('Je bent niet ingelogd bij Spotify. Log in om verder te gaan.');
                const response = await api.get('/spotify/login');
                window.location.href = response.data;
            }
        }
    };

    const [playlists, setPlaylists] = useState([]);

    const importPlaylists = async () => {
        try {
            const response = await api.post('/api/playlists');
            console.log('Playlists imported in database');
        } catch (error) {
            console.error('Error importing playlistss:', error);
            if (error.response && error.response.status === 401) {
                const response = await api.get('/spotify/login');
                window.location.href = response.data;
            }
        }
    };

    useEffect(() => {
        const fetchPlaylists = async () => {
            try {
                const response = await api.get('/api/playlists');
                setPlaylists(response.data);
            } catch (error) {
                console.error('Error fetching playlists:', error);
            }
        };

        fetchPlaylists();
    }, []);

    return (
        <div>
            <h2>Selecteer een playlist</h2>
            <div className="playlist-select">
                {playlists.length === 0 ? (
                    <p>Geen playlists gevonden</p>
                    ) : (
                    <table className="playlist-table" border="1" style={{width: '100%', textAlign: 'center', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th>Playlist</th>
                                <th>Aantal nummers</th>
                                <th> </th>
                            </tr>
                        </thead>
                        <tbody>
                            {playlists.map(playlist => (
                                <tr key={playlist.id}>
                                    <td>{playlist.playlist_name}</td>
                                    <td>{playlist.playlist_length}</td>
                                    <td>
                                        <button onClick={() => selectPlaylist(playlist.id)}>
                                            {playlistId === playlist.id ? 'Selected!' : 'Select this playlist'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                <div className="playlist-select-button-container">
                    <button className="playlist-select-button" onClick={importPlaylists}>Importeer Playlists</button>
                </div>
            </div>
        </div>
    );
}

export default PlaylistSelect;