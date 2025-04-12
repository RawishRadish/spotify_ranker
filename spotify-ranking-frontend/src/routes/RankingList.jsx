import React, { useState, useEffect } from 'react';
import api from '../axiosConfig';
import { usePlaylist } from '../context/PlaylistContext';
import RankingTable from './RankingTable';

const RankingList = () => {
    const [songs, setSongs] = useState([]);
    const [ searchTerm, setSearchTerm ] = useState('');
    const { playlistId } = usePlaylist();

    useEffect(() => {
        const fetchSongs = async () => {
            try {
                const response = await api.get(`/playlists/ranked/${playlistId}`);
                console.log('Fetched songs:', response.data);
                setSongs(response.data);
            } catch (error) {
                console.error('Error fetching songs:', error);
            }
        };

        fetchSongs();
    }, [playlistId]);

    // Add jump to position functionality
    const totalSongs = songs.length;
    const jumpInterval = totalSongs < 100 ? 20 : totalSongs < 500 ? 100 : 200;
    const jumpPoints = Array.from({ length: Math.ceil(totalSongs / jumpInterval) }, (_, i) => i * jumpInterval);

    const scrollToIndex = (index) => {
        document.getElementById(`song-${index}`).scrollIntoView({ behavior: 'smooth' });
    };

    // Add jump to top functionality
    const [showScrollTop, setShowScrollTop] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 300);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className='p-4'>
            <h2 className='text-2xl font-bold mb-4 text-gray-800'>Ranking</h2>
            <input
                type='text'
                placeholder='Search for song or artist...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-full p-2 border border-gray-300 rounded-md mb-4'
            />
            <div className='flex space-x-2 mb-4'>
                {jumpPoints.map((index) => (
                    <button
                        key={index}
                        className='p-2 bg-blue-500 text-white rounded'
                        onClick={() => scrollToIndex(index)}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>
           
            <RankingTable songs={songs} searchTerm={searchTerm} />

            {showScrollTop && (
                <button
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className='fixed bottom-4 right-4 bg-blue-500 text-white p-2 rounded-full shadow-lg'
                    >
                        Scroll to top
                </button>
            )}
        </div>
    );
};

export default RankingList;