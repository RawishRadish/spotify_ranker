import React, { useMemo, useState } from "react";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import { 
    useReactTable, 
    getCoreRowModel,
    getSortedRowModel,
    flexRender,
} from "@tanstack/react-table";

export default function RankingTable({ songs, searchTerm }) {
    const [sorting, setSorting] = useState([]);

    // Add position to each song before passing data to the table
    const indexedSongs = useMemo(() => {
        return [...songs]
            .sort((a, b) => b.elo_rating - a.elo_rating)
            .map((song, index) => ({
                ...song,
                position: index + 1, // Add position dynamically
            }));
        }, [songs]);

    // Filter songs
    const filteredSongs = useMemo(() => {
        return indexedSongs.filter(song =>
            song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            song.artist.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [indexedSongs, searchTerm]);
    
    // Define columns
    const columns = useMemo(() => 
        [
            {
                header: "Positie",
                accessorKey: "position",
                cell: ({ row }) => {
                    const sigma = row.original.sigma;
                    return (
                        <div className={`text-center font-semibold rounded px-2 py-1 ${getPositionColor(sigma)}`}>
                            {row.original.position}
                        </div>
                    );
                }
            },
            {
                accessorKey: "album_image_url",
                header: "",
                cell: ({ row }) => (
                    <img
                        src={row.original.album_image_url}
                        alt={`${row.original.title} cover`}
                        className='w-12 h-12 object-cover rounded-lg shadow-sm border border-gray-200 transition-transform duration-150 hover:scale-105'
                        loading='lazy'
                    />
                ),
            },
            {
                header: "Titel & Artiest",
                accessorKey: "title_artist",
                cell: ({ row }) => (
                    <div>
                        <div className='font-medium text-gray-900'>{row.original.title}</div>
                        <div className='text-sm text-gray-500'>{row.original.artist}</div>
                    </div>
                )
            },
        ], []
    );

    const getPositionColor = (sigma) => {
        if (sigma > 7) return "bg-red-100"; // Very high uncertainty
        if (sigma > 6) return "bg-orange-100"; // High uncertainty
        if (sigma > 5) return "bg-yellow-100"; // Medium uncertainty
        if (sigma > 3)return "bg-green-100"; // Low uncertainty
        return "bg-blue-100"; // Very low uncertainty
    };


    // Create table instance
    const table = useReactTable({
        data: filteredSongs,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        state: { sorting },
        onSortingChange: setSorting,
    });

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0 shadow-md rounded-md">
                <thead className='bg-gray-200 sticky top-0 z-10'>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <th 
                                    key={header.id}
                                    className='py-3 px-4 text-left cursor-pointer font-semibold text-gray-700'
                                    onClick={header.column.getToggleSortingHandler()}
                                >
                                    <div className='flex items-center gap-1'>
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                        {header.column.getIsSorted() === "asc" ? (
                                            <FaSortUp />
                                        ) : header.column.getIsSorted() === "desc" ? (
                                            <FaSortDown /> 
                                        ) : (
                                            <FaSort />
                                        )}
                                    </div>

                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {table.getRowModel().rows.map((row) => (
                        <tr 
                            key={row.id} 
                            id={`song-${row.index}`}
                            className="border-t hover:bg-gray-100 transition duration-200 scroll-mt-16"
                        >
                            {row.getVisibleCells().map((cell) => {
                            const sigmaValue = row.original.sigma; // Get sigma value from the row
                            const isPositionColumn = cell.column.columnDef.accessorKey === "position";
                            
                            return (
                                <td 
                                    key={cell.id} 
                                    className={`border-b border-gray-200 py-2 px-4 text-gray-800 align-middle`}
                                >
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                            );
                        })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}