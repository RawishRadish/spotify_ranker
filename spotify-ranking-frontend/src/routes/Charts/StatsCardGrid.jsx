import { useEffect, useState } from 'react';
import StatsCard from '../StatsCard';
import api from '../../axiosConfig';

const StatsCardGrid = ({ playlistId }) => {
    const [data, setData] = useState({
        totalComparisons: null,
        totalSongs: null,
        totalGenres: null,
    });

    useEffect(() => {
        const fetchAllStats = async () => {
            try {
                const [comparisonsRes, songsRes, genresRes ] = await Promise.all([
                    api.get(`stats/total_comparisons/${playlistId}`),
                    api.get(`/playlists/info/${playlistId}`),
                    api.get(`/stats/genre_count/${playlistId}`),
                ]);

                const comparisons = comparisonsRes.data;
                const songs = songsRes.data;
                const genres = genresRes.data;

                setData({
                    totalComparisons: comparisons.total,
                    totalSongs: songs.totalTracks,
                    totalGenres: genres.length
                });
            } catch (error) {
                console.error('Error fetching statistics:', error);
            }
        };

        if (playlistId) {
            fetchAllStats();
        }
    }, [playlistId]);

    return (
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 my-6'>
            <StatsCard title='Aantal vergelijkingen' value={data.totalComparisons ?? '...'} />
            <StatsCard title='Aantal unieke nummers' value={data.totalSongs ?? '...'} color='text-green-600' />
            <StatsCard title='Aantal genres' value={data.totalGenres ?? '...'} color='text-purple-600' />
        </div>
    );
};

export default StatsCardGrid;