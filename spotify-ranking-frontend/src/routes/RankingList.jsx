import React, { useState, useEffect } from 'react';
import api from '../axiosConfig';
import { useAuth } from '../context/UserAuthContext';
import { usePlaylist } from '../context/PlaylistContext';
import RankingTable from './RankingTable';

const RankingList = () => {
    const [songs, setSongs] = useState([]);
    const { playlistId } = usePlaylist();

    useEffect(() => {
        const fetchSongs = async () => {
            try {
                const response = await api.get(`/spotify/playlists/${playlistId}/ranked`);
                setSongs(response.data);
            } catch (error) {
                console.error('Error fetching songs:', error);
            }
        };

        fetchSongs();
    }, [playlistId]);

    return (
        <div className='p-4'>
            <h2 className='text-2xl font-bold mb-4 text-gray-800'>Ranking</h2>
            <RankingTable songs={songs} />
        </div>
    );
};

export default RankingList;