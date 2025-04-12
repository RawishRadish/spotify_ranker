import React, { useState } from 'react';

import DashboardCard from './DashboardCard';
import StatisticsModal from './Charts/StatisticsModal';

import { usePlaylist } from '../context/PlaylistContext';
import GenreChart from './Charts/GenreChart';
import ArtistChart from './Charts/ArtistsChart';
import StatsCardGrid from './Charts/StatsCardGrid';
import StabilityOverview from './Charts/StabilityOverview';

const Statistics = () => {
    const { playlistId } = usePlaylist();
    const [activeChart, setActiveChart] = useState(null);

    const openModal = (chartName) => setActiveChart(chartName);
    const closeModal = () => setActiveChart(null);

    const modalContent = {
        genre: <GenreChart playlistId={playlistId} />,
        artist: <ArtistChart playlistId={playlistId} />,
        overview: <StatsCardGrid playlistId={playlistId} />,
        stability: <StabilityOverview playlistId={playlistId} />,
    };

    return (
        <div className='p-6'>
            <h1 className='text-2xl font-bold mb-6'>Statistieken</h1>
            <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'>
                <DashboardCard title='Overzicht'>
                    <StatsCardGrid playlistId={playlistId} />
                </DashboardCard>

                <DashboardCard title='Genres' onClick={() => openModal('genre')}>
                        <GenreChart playlistId={playlistId} topN={3} showTitle={false} inModal={false} />
                </DashboardCard>

                <DashboardCard title='Artiesten' onClick={() => openModal('artist')} ratio='16/9'>
                    <ArtistChart playlistId={playlistId} topN={3} showTitle={false} inModal={false} />
                </DashboardCard>

                <DashboardCard title='Stabiliteit' onClick={() => openModal('stability')}>
                    <StabilityOverview playlistId={playlistId} topN={3} showTitle={false} inModal={false} />
                </DashboardCard>
            </div>

            <StatisticsModal isOpen={!!activeChart} onClose={closeModal}>
                {modalContent[activeChart]}
            </StatisticsModal>
        </div>
    );
};

export default Statistics;