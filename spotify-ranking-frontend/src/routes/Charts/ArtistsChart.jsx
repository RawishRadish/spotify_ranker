import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend,
} from 'chart.js';
import api from '../../axiosConfig';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend
);

const ArtistChart = ({ playlistId, topN = 10, showTitle = true, inModal = true }) => {
    const [artistData, setArtistData] = useState([]);

    useEffect(() => {
        const fetchArtistData = async () => {
            try {
                const response = await api.get(`/stats/artist_count/${playlistId}`)
                const data = response.data;
                setArtistData(data);
            } catch (error) {
                console.error('Error fetching artist data: ', error);
            }
        };

        if (playlistId) {
            fetchArtistData();
        }
    }, [playlistId]);

    const getTopArtists = (data, topN) => {
        const sorted = [...data].sort((a, b) => b.count - a.count);
        const top = sorted.slice(0, topN);
        return top;
    }

    const filteredData = getTopArtists(artistData, topN);

    const chartData = {
        labels: filteredData.map(item => item.artist),
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
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    precision: 0,
                },
            },
        },
    };

    return (
        <div className='w-full bg-white rounded-xl shadow-md p-6'>
            {showTitle && (
                <h2 className='text-xl font-semibold mb-4'>Aantal nummers per artiest</h2>
            )}
            {inModal ? (
                <div className='w-full aspect-[16/9] max-w-xl mx-auto'>
                    <Bar data={chartData} options={options} />
                </div>
            ) : (
                <Bar data={chartData} options={options} />
            )}
        </div>
    );
};

export default ArtistChart;