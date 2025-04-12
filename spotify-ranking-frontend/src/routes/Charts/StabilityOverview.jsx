import { useEffect, useState } from 'react';
import StabilityList from './StabilityList';
import api from '../../axiosConfig';

const StabilityOverview = ({ playlistId, topN = 10, showTitle = true, inModal = true }) => {
    const [sigmaData, setSigmaData] = useState([]);

    useEffect(() => {
        const fetchSigmaData = async () => {
            try {
                const response = await api.get(`/stats/sigma_per_song/${playlistId}`);
                const data = response.data;
                setSigmaData(data);
            } catch (error) {
                console.error('Error fetching sigma data: ', error);
            }
        };

        if (playlistId) {
            fetchSigmaData();
        }
    }, [playlistId]);

    const topUnstable = [...sigmaData]
        .sort((a, b) => b.sigma - a.sigma)
        .slice(0, topN);

    const topStable = [...sigmaData]
        .sort ((a, b) => a.sigma - b.sigma)
        .slice(0, topN);

    
    return (
        <div className='h-full bg-white rounded-xl shadow-md p-6'>
            {showTitle && (
                <h2 className='text-xl font-semibold mb-4'>Stabiliteit per nummer</h2>
            )}
            {sigmaData.length > 0 ? (
                <div className={`grid ${
                        inModal ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
                        } gap-8`}
                >
                    <StabilityList
                        data={topStable}
                        title={`Top ${topN} meest stabiele nummers`}
                        color='text-green-600'
                        compact={!inModal}
                        maxLines={inModal ? 3 : 2}
                    />
                    <StabilityList
                        data={topUnstable}
                        title={`Top ${topN} minst stabiele nummers`}
                        color='text-red-600'
                        compact={!inModal}
                        maxLines={inModal ? 3 : 2}
                    />
                </div>
            ) : (
                <p>Geen data beschikbaar.</p>
            )}
        </div>
    );
};

export default StabilityOverview;