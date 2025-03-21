import React, { useState, useEffect } from 'react';
import api from '../axiosConfig';
import { usePlaylist } from '../context/PlaylistContext';
import PreviewSongPlayer from './previewSongPlayer';

function CompareSongs() {
    const [pairs, setPairs] = useState([]);
    const [currentPairIndex, setCurrentPairIndex] = useState(0);
    const [lastChoice, setLastChoice] = useState(null);
    const { playlistId } = usePlaylist();

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

    const getPreviewUrls = async () => {
        console.log(currentPair);
        const { song1, song2 } = currentPair;
        console.log('Getting preview URLs for:', `${song1.title} - ${song1.artist}, ${song2.title} - ${song2.artist}`);
        try {
            const response = await api.post('/pairs/preview', {
                songs: [song1, song2],
            });
            console.log('Preview URLs:', response.data);
        } catch (error) {
            console.error('Error getting preview URLs:', error);
        }
    };

    return (
        <div className='flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200'>
            <div className='flex gap-6'>
                <div>
                    <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg shadow-lg transition-all text-lg" onClick={() => handleChoice(currentPair.song1.id, currentPair.song2.id)}>
                        {currentPair.song1.title} <br />
                        <span className='text-sm text-gray-300'>{currentPair.song1.artist}</span>
                    </button>
                    <PreviewSongPlayer song={currentPair.song1} />
                </div>
                <span className='text-xl font-semibold'> vs. </span>
                <div>
                    <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg shadow-lg transition-all text-lg" onClick={() => handleChoice(currentPair.song2.id, currentPair.song1.id)}>
                        {currentPair.song2.title} <br />
                        <span className='text-sm text-gray-300'>{currentPair.song2.artist}</span>
                    </button>
                    <PreviewSongPlayer song={currentPair.song2} />
                </div>
            </div>
            {lastChoice && (
                <button
                    className='mt-4 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-all text-md'
                    onClick={handleUndo}
                >
                    Undo
                </button>
            )}
            <button
                className='mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-all text-md'
                onClick={getPreviewUrls}
            >
                Log preview URLs
            </button>
            <PreviewSongPlayer song={currentPair.song1} />
        </div>
    );
}

export default CompareSongs;