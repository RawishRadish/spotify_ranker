import { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';
import api from '../../axiosConfig';

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend
);

const GenreChart = ({ playlistId, topN = 10, showTitle = true, inModal= true }) => {
    const [genreData, setGenreData] = useState([]);

    useEffect(() => {
        const fetchGenreData = async () => {
            try {
                const response = await api.get(`/stats/genre_count/${playlistId}`);
                const data = response.data;
                setGenreData(data);
            } catch (error) {
                console.error('Error fetching genre data:', error);
            }   
        };

        if (playlistId) {
            fetchGenreData();
        }
    }, [playlistId]);

    const getTopGenresWithOther = (data, topN) => {
        const sorted = [...data].sort((a, b) => b.count - a.count);
        const top = sorted.slice(0, topN);
        const rest = sorted.slice(topN);
        const otherCount = rest.reduce((sum, item) => sum + item.count, 0);
        if (otherCount > 0) {
            top.push({ genre: 'Overige', count: otherCount });
        }
        return top;
    };

    const filteredData = getTopGenresWithOther(genreData, topN);

    const chartData = {
        labels: filteredData.map(item => item.genre),
        datasets: [
            {
                label: 'Aantal nummers',
                data: filteredData.map(item => item.count),
                backgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#FF9F40',
                    '#4BC0C0',
                    '#9966FF',
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#FF9F10',
                    '#4BC0C0',
                ],
                borderRadius: 6,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
            },
        },
    };

    return (
        <div className='h-full w-full bg-white rounded-xl shadow-md p-6'>
            {showTitle && (
                <h2 className='text-xl font-semibold mb-4'>Aantal nummers per genre</h2>
            )}

            {inModal ? (
                <div className='w-full aspect-square max-w-xl mx-auto'>
                    <Doughnut data={chartData} options={options} />
                </div>
            ) : (
                <Doughnut data={chartData} options={options} />
            )}
        </div>
    );
};

export default GenreChart;