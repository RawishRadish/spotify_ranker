import React, { useState, useEffect } from 'react';
import api from './axiosConfig';
import { useAuth } from './UserAuthContext';
import { usePlaylist } from './PlaylistContext';
import { FixedSizeList as List } from 'react-window';
import './RankingList.css';

const RankingList = () => {
    const { isLoggedIn } = useAuth();
    const [songs, setSongs] = useState([]);
    const { playlistId } = usePlaylist();

    useEffect(() => {
        const fetchSongs = async () => {
            try {
                const response = await api.get(`/api/ranked/${playlistId}`);
                setSongs(response.data);
            } catch (error) {
                console.error('Error fetching songs:', error);
            }
        };

        if (isLoggedIn) {
            fetchSongs();
        }
    }, [isLoggedIn, playlistId]);

    const Row = ({ index, style }) => (
        <div className="songrow" style={style}>
            {songs[index].title} - {songs[index].artist}
        </div>
    );

    return (
        <List
            height={600} // Height of the list container
            itemCount={songs.length} // Number of items in the list
            itemSize={45} // Height of each item
            width={400} // Width of the list container
        >
            {Row}
        </List>
    );
};

export default RankingList;