import React, { useState, useEffect, useMemo } from 'react';
import api from '../axiosConfig';
import { usePlaylist } from '../context/PlaylistContext';
import PlaylistModal from './PlaylistModal';
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    flexRender,
} from '@tanstack/react-table';

const PlaylistSelect =  () => {
    const [ showModal, setShowModal ] = useState(false);
    const { playlistId, setPlaylistId } = usePlaylist();
    const [ playlists, setPlaylists ] = useState([]);
    const [ sorting, setSorting ] = useState([]);
    const [ searchTerm, setSearchTerm ] = useState('');

    const selectPlaylist = async (playlistId) => {
        setPlaylistId(playlistId);
        try {
            await api.post(`/playlists/save/${playlistId}/songs`);
        } catch (error) {
            console.error('Error importing songs:', error);
            if (error.response && error.response.status === 401) {
                alert('Je bent niet ingelogd bij Spotify. Log in om verder te gaan.');
                const response = await api.get('/spotify/login');
                window.location.href = response.data;
            }
        }
    };

    const fetchPlaylists = async () => {
        try {
            const response = await api.get('/playlists/getfromdb');
            const basePlaylists = response.data;

            const playlistsWithImages = await Promise.all(
                basePlaylists.map(async (playlist) => {
                    try {
                        const res = await api.get(`/playlists/info/${playlist.id}`);
                        return {
                            ...playlist,
                            imageUrl: res.data.images[0].url
                        };
                    } catch (error) {
                        console.error('Error fetching playlist image:', error);
                        return {
                            ...playlist,
                            imageUrl: null
                        };
                    }
                })
            );
            setPlaylists(playlistsWithImages);
        } catch (error) {
            console.error('Error fetching playlists:', error);
        }
    };


    useEffect(() => {
        fetchPlaylists();
    }, []);

    const filteredPlaylists = useMemo(() => {
        return playlists.filter(p =>
            p.playlist_name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [playlists, searchTerm]);

    const columns = useMemo(
        () => [
            {
                header: 'Afbeelding',
                accessorKey: 'imageUrl',
                cell: ({ getValue }) => (
                    getValue() ? <img src={getValue()} alt='cover' className='w-12 h-12 rounded' /> : 'No image'
                ),
            },
            {
                header: 'Playlist',
                accessorKey: 'playlist_name',
            },
            {
                header: 'Aantal nummers',
                accessorKey: 'playlist_length',
            },
            {
                header: '',
                id: 'actions',
                cell: ({ row }) => (
                    <button
                        onClick={() => selectPlaylist(row.original.id)}
                        className={`px-4 py-2 rounded-lg font-semibold transition ${
                            playlistId === row.original.id
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                    >
                        {playlistId === row.original.id ? 'Selected!' : 'Select this playlist'}
                    </button>
                ),
            },
        ], [playlistId]
    );

    const table = useReactTable({
        data: filteredPlaylists,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        state: { sorting },
        onSortingChange: setSorting,
    });

    return (
        <div className='p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg'>
            <div className='flex items-center gap-4 mb-4'>
               <h2 className='text-xl font-bold text-gray-800 dark:text-gray-200'>Selecteer een playlist</h2>
               <input
                    type='text'
                    placeholder='Zoek een playlist...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className='md: ml-auto px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white'
                />
                {/* Import playlists button */}
                <div className='ml-auto'>
                    <button 
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all" 
                        onClick={() => setShowModal(true)}
                    >
                        Importeer Playlists
                    </button>
                </div>
            </div>
            {/* Import playlists modal */}
            {showModal && (
                <PlaylistModal 
                    onClose={() => setShowModal(false)} 
                    onImportSuccess={fetchPlaylists}
                />
            )}
            
                {/* Playlist table */}
                <div className='overflow-x-auto'>
                    {filteredPlaylists.length === 0 ? (
                        <p className='text-gray-500'>Geen playlists gevonden</p>
                    ) : (
                        <table className="min-w-full border border-gray-300 dark:border-gray-600 shadow-md rounded-md">
                            <thead className='bg-gray-200 dark:bg-gray-700'>
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <tr key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => (
                                            <th
                                                key={header.id}
                                                className="py-3 px-4 text-left cursor-pointer font-semibold text-gray-700 dark:text-gray-300"
                                                onClick={header.column.getToggleSortingHandler()}
                                            >
                                                {flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                                {header.column.getIsSorted() === 'asc'
                                                    ? ' ▲'
                                                    : header.column.getIsSorted() === 'desc'
                                                    ? ' ▼'
                                                    : ''}
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                            </thead>
                            <tbody>
                                {table.getRowModel().rows.map((row) => (
                                    <tr
                                        key={row.id}
                                        className='border-t hover:bg-gray-100 dark:hover:bg-gray-700 transition duration-200'
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <td key={cell.id} className='py-2 px-4'>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
    );
}

export default PlaylistSelect;