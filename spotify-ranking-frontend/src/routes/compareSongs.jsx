import React, { useState, useEffect } from 'react';
import api from '../axiosConfig';
import { usePlaylist } from '../context/PlaylistContext';
import { useAudio } from '../context/AudioContext';
import SongCard from './SongCard';

function CompareSongs() {
    const [pairs, setPairs] = useState([]);
    const [currentPairIndex, setCurrentPairIndex] = useState(0);
    const [lastChoice, setLastChoice] = useState(null);
    const { playlistId } = usePlaylist();
    const { stop } = useAudio();

    useEffect(() => {
        // Reset pairs to empty array
        setPairs([]);
        // Fetch pairs
        async function fetchPairs() {
            try {
                const response = await api.get(`/pairs/fetch/${playlistId}`);
                console.log('Fetched pairs:', response.data);
                setPairs(response.data);
            } catch (error) {
                console.error('Error fetching pairs:', error);
            }
        }
        fetchPairs();
    }, [playlistId]);

    const handleChoice = (winnerId, loserId) => {
        // Stop audio if playing
        stop();
        console.log('User chose:', winnerId, 'over', loserId);
        // Save last choice for undo functionality
        setLastChoice({ winnerId, loserId });
        //Send choice to backend
        api.post(`/pairs/compare/${playlistId}`, { winner_id: winnerId, loser_id: loserId })
            .then(() => {
                if (currentPairIndex < pairs.length - 1) {
                    setCurrentPairIndex(currentPairIndex + 1);
                } else {
                    console.log('No more pairs in current batch');
                }
            })
            .catch(error => console.error('Error updating ratings:', error));
    };

    const handleUndo = () => {
        if (!lastChoice) return;

        api.post(`/pairs/undo/${playlistId}`, { winner_id: lastChoice.winnerId, loser_id: lastChoice.loserId })
            .then(() => {
                console.log('Undo successful');
                setCurrentPairIndex(currentPairIndex > 0 ? currentPairIndex - 1 : 0);
                setLastChoice(null);
            })
            .catch(error => console.error('Error undoing choice:', error));
    };

    if (pairs.length === 0) {
        return <div className='flex items-center justify-center h-screen text-gray-600'>Loading pairs...</div>;
    }

    const currentPair = pairs[currentPairIndex];

    return (
        <div className='flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 px-4 py-8'>
            <div className='relative w-full max-w-screen-lg px-4'>
                <div className='grid grid-cols-1 grid-rows-[1fr_auto_1fr] md:grid-rows-1 md:grid-cols-[2fr_auto_2fr] place-items-center gap-6 w-full max-w-screen-lg auto-rows-fr'>
                    <SongCard song={currentPair.song1} opponent={currentPair.song2} onChoose={handleChoice} />
                    <span className='bg-white text-gray-700 text-sm font-bold px-4 py-2 rounded-full shadow-md border border-gray-300'>
                    VS
                    </span>
                    <SongCard song={currentPair.song2} opponent={currentPair.song1} onChoose={handleChoice} />
                </div>
            </div>

            {/* Buttons */}
            <div className='mt-6 flex flex-wrap gap-4 justify-center'>
                {lastChoice && (
                    <button
                        className='mt-4 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-all text-md'
                        onClick={handleUndo}
                    >
                        Undo
                    </button>
                )}
            </div>

        </div>
    );
}

export default CompareSongs;