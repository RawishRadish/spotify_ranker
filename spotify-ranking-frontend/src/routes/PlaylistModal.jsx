import React, { useEffect, useState } from 'react';
import api from '../axiosConfig';
import { ImCross } from "react-icons/im";


const PlaylistModal = ({ onClose, onImportSuccess }) => {
    const [playlists, setPlaylists] = useState([]);
    const [selected, setSelected] = useState([]);
    const [loading, setLoading] = useState(false);
    const [importStatus, setImportStatus] = useState(null);

    useEffect(() => {
        const fetchPlaylists = async () => {
            try {
                const response = await api.get('/playlists/fetch');
                setPlaylists(response.data);
            } catch (error) {
                console.error('Error fetching playlists:', error);
            }
        };

        fetchPlaylists();
    }, []);

    const togglePlaylist = (id) => {
        setSelected((prev) => 
            prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
        );
    };

    const handleImport = async () => {
        if (selected.length === 0) return;
        setLoading(true);
        setImportStatus(null);
        try {
            await api.post('/playlists/save', { playlistIds: selected });
            setImportStatus('Playlists imported in database');
        } catch (error) {
            setImportStatus('Error importing playlists');
            console.error('Error importing playlists:', error);
        } finally {
            if (onImportSuccess) onImportSuccess();
            setLoading(false);
            onClose();
        }
    };

    return (
        <div
            className='fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50'
        >
            <div className='bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg'>
                <div className='flex justify-between items-center mb-4'>
                    <h2 className='text-xl font-bold'>Choose your playlists</h2>
                    <button onClick={onClose} className='cursor-pointer'>
                        <ImCross />
                    </button>
                </div>

                <div className='max-h-64 overflow-y-auto space-y-2'>
                    {playlists.map((pl) => (
                        <label
                            key={pl.id}
                            className='flex items-center space-x-2 hover:bg-gray-100 p-2 rounded'
                        >
                            <input
                                type='checkbox'
                                checked={selected.includes(pl.id)}
                                onChange={() => togglePlaylist(pl.id)}
                            />
                            <img
                                src={pl.images?.[0]?.url}
                                alt={pl.name}
                                className='w-10 h-10 rounded object-cover'
                            />
                            <span>{pl.name}</span>
                        </label>
                    ))}
                </div>

                <div className='mt-4 flex justify-between items-center'>
                    <button
                        onClick={handleImport}
                        disabled={loading || selected.length === 0}
                        className='bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50'
                    >
                        {loading ? 'Importing...' : 'Import selected playlists'}
                    </button>
                    {importStatus && <span>{importStatus}</span>}
                </div>
            </div>
        </div>
    );
};

export default PlaylistModal;