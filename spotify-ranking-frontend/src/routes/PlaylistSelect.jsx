import React, { useState, useEffect } from 'react';
import api from '../axiosConfig';
import { usePlaylist } from '../context/PlaylistContext';

const PlaylistSelect =  () => {
    const { playlistId, setPlaylistId } = usePlaylist();

    const selectPlaylist = async (playlistId) => {
        setPlaylistId(playlistId);
        try {
            await api.post(`/spotify/playlists/${playlistId}/songs`);
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
            const response = await api.post('/spotify/playlists');
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
                const response = await api.get('/spotify/playlists');
                const basePlaylists = response.data;
                console.log('Base playlists:', basePlaylists);

                const testFetchPlaylistInfo = async () => {
                    try {
                        const response = await api.get(`/spotify/playlists/${basePlaylists[0].id}`);
                        console.log('Playlist:', response.data);
                    } catch (error) {
                        console.error('Error fetching playlist info:', error);
                    }
                }

                // const playlistsWithImages = await Promise.all(
                //     basePlaylists.map(async (playlist) => {
                //         try {
                //             console.log('Fetching playlist image for:', playlist.id);
                //             const res = await api.get(`/spotify/playlists/${playlist.id}`);
                //             console.log('Playlist:', res.data);
                //             return {
                //                 ...playlist,
                //                 imageUrl: res.data.images[0].url
                //             };
                //         } catch (error) {
                //             console.error('Error fetching playlist image:', error);
                //             return {
                //                 ...playlist,
                //                 imageUrl: null
                //             };
                //         }
                //     })
                // );
                setPlaylists(basePlaylists);
                testFetchPlaylistInfo();
            } catch (error) {
                console.error('Error fetching playlists:', error);
            }
        };

        fetchPlaylists();
    }, []);


    return (
        <div className='p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg'>
            <div className='flex items-center gap-4 mb-4'>
               <h2 className='text-xl font-bold text-gray-800 dark:text-gray-200'>Selecteer een playlist</h2>
                {/* Import playlists button */}
                <div className='ml-auto'>
                    <button 
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all" 
                        onClick={importPlaylists}
                    >
                        Importeer Playlists
                    </button>
                </div>
            </div>
            
                {/* Playlist table */}
                <div className='flex-1'>
                    {playlists.length === 0 ? (
                        <p className='text-gray-500'>Geen playlists gevonden</p>
                    ) : (
                        <table className="w-full border border-gray-300 dark:border-gray-600 shadow-md rounded-md">
                            <thead className='bg-gray-200 dark:bg-gray-700'>
                                <tr>
                                    <th className='py-3 px-4 text-left font-semibold text-gray-700 dark:text-grey-300'>Playlist</th>
                                    <th className='py-3 px-4 text-left font-semibold text-gray-700 dark:text-grey-300'>Aantal nummers</th>
                                    <th className='py-3 px-4 text-left'> </th>
                                </tr>
                            </thead>
                            <tbody>
                                {playlists.map(playlist => (
                                    <tr key={playlist.id} className='border-t hover:bg-gray-100 dark:hover:bg-gray-700 transition duration-200'>
                                        <td className='py-2 px-4'>{playlist.playlist_name}</td>
                                        <td className='py-2 px-4'>{playlist.playlist_length}</td>
                                        <td className='py-2 px-4'>
                                            <button 
                                                onClick={() => selectPlaylist(playlist.id)}
                                                className={`px-4 py-2 rounded-lg font-semibold transition ${
                                                    playlistId === playlist.id ? 'bg-green-600 text-white' : 'bg-gray-300 hover:bg-gray-400'
                                                }`}
                                            >
                                                {playlistId === playlist.id ? 'Selected!' : 'Select this playlist'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
    );
}

export default PlaylistSelect;