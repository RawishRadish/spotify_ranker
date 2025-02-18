import React, { useState, useEffect } from 'react';
import api from './axiosConfig';
import { usePlaylist } from './PlaylistContext';
import './CompareSongs.css';

function CompareSongs() {
    const [pairs, setPairs] = useState([]);
    const [currentPairIndex, setCurrentPairIndex] = useState(0);
    const { playlistId } = usePlaylist();

    useEffect(() => {
        // Reset pairs to empty array
        setPairs([]);

        // Fetch pairs
        async function fetchPairs() {
            try {
                const response = await api.get(`/api/pairs/${playlistId}`);
                console.log('Fetched pairs:', response.data);
                setPairs(response.data);
            } catch (error) {
                console.error('Error fetching pairs:', error);
            }
        }
        fetchPairs();
    }, [playlistId]);

    const handleChoice = (winnerId, loserId) => {
        console.log('User chose:', winnerId, 'over', loserId);

        //Send choice to backend
        api.post(`/api/pairs/compare/${playlistId}`, { winnerId, loserId })
            .then(() => {
                if (currentPairIndex < pairs.length - 1) {
                    setCurrentPairIndex(currentPairIndex + 1);
                } else {
                    console.log('No more pairs in current batch');
                }
            })
            .catch(error => console.error('Error updating ratings:', error));
    };

    if (pairs.length === 0) {
        return <div>Loading pairs...</div>;
    }

    const currentPair = pairs[currentPairIndex];

    return (
        <div className="compare-container">
            <button className="compare-button" onClick={() => handleChoice(currentPair.song1_id, currentPair.song2_id)}>
                {currentPair.song1_title} <br></br>
                {currentPair.song1_artist}
            </button>
            <span> vs. </span>
            <button className="compare-button" onClick={() => handleChoice(currentPair.song2_id, currentPair.song1_id)}>
                {currentPair.song2_title} <br></br>
                {currentPair.song2_artist}
            </button>
        </div>
    );
}

export default CompareSongs;