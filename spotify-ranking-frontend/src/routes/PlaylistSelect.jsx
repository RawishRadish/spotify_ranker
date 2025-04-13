import React, { useState, useEffect, useMemo } from 'react';
import api from '../axiosConfig';
import { usePlaylist } from '../context/PlaylistContext';
import PlaylistModal from './Modals/PlaylistModal';
import { HiCheckCircle, HiPencilAlt, HiTrash } from 'react-icons/hi';
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

    // Function to select a playlist
    const selectPlaylist = async (newPlaylistId) => {
        if (playlistId === newPlaylistId) {
            localStorage.removeItem('selectedPlaylistId');
            try {
                await api.post('/user/last_playlist', { playlistId: null })
            } catch (error) {
                console.error('Error saving last playlist:', error);
                alert('Error saving last playlist');
            }
            setPlaylistId(null);
        } else {
            localStorage.setItem('selectedPlaylistId', newPlaylistId);

            try {
                await api.post('/user/last_playlist', { playlistId: newPlaylistId });
            } catch (error) {
                console.error('Error saving last playlist:', error);
                alert('Error saving last playlist');
            }
            setPlaylistId(newPlaylistId);
        }

    };

    // Function to update a playlist
    const updatePlaylist = async (playlistId) => {
        try {
            const response = await api.patch(`/playlists/update/${playlistId}`);
            if (response.data.updated) {
                alert('Playlist geüpdatet!');
            } else {
                alert('Geen wijzigingen gevonden in de playlist sinds de laatste import.');
            }
        } catch (error) {
            console.error('Error updating playlist:', error);
            alert('Error updating playlist');
        }
    };


    // Function to delete a playlist
    const deletePlaylist = async (playlistId) => {
        if (window.confirm('Weet je zeker dat je deze playlist wilt verwijderen?')) {
            try {
                await api.delete(`/playlists/delete/${playlistId}`);
                setPlaylists((prevPlaylists) =>
                    prevPlaylists.filter((playlist) => playlist.id !== playlistId)
                );
            } catch (error) {
                console.error('Error deleting playlist:', error);
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
                            imageUrl: res.data.playlistInfo.images[0].url
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
                    getValue() ? (
                    <img 
                        src={getValue()} 
                        alt='cover' 
                        className='w-20 h-20 rounded shadow-md transform transition-transform duration-300 hover:scale-105 hover:shadow-lg' 
                    /> 
                    ) : 'No image'
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
                    <div className='flex flex-col gap-2 items-stretch'>
                        <button
                        onClick={() => selectPlaylist(row.original.id)}
                        className={`flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg font-semibold transition shadow-sm ${
                            playlistId === row.original.id
                                ? 'bg-green-600 shadow-md text-white hover:bg-green-700'
                                : 'bg-gray-200 text-gray-800 hover:bg-green-100 hover:shadow-lg'
                        }`}
                        >
                            <HiCheckCircle size={18} />
                            {playlistId === row.original.id ? 'Geselecteerd!' : 'Selecteer playlist'}
                        </button>
                        <button
                            onClick={() => updatePlaylist(row.original.id)}
                            className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-gray-200 rounded-lg text-gray-700 hover:bg-gray-300 transition"
                        >
                            <HiPencilAlt size={18} />
                            Update
                        </button>
                        <button
                            onClick={() => deletePlaylist(row.original.id)}
                            className='flex items-center justify-center gap-2 w-full px-4 py-2 bg-gray-200 text-red-600 rounded-lg hover:bg-red-100 transition'
                        >
                            <HiTrash size={18} />
                            Verwijder
                        </button>
                    </div>


                ),
            },
        ], [playlistId, selectPlaylist, deletePlaylist]
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
                            <thead className='sticky top-0 z-10 bg-gray-200 dark:bg-gray-700'>
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
                                        className={`border-t transition duration-200 ${
                                            playlistId === row.original.id
                                                ? 'bg-green-100 dark:bg-green-700'
                                                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }`}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <td key={cell.id} className='py-2 px-4 align-middle'>
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